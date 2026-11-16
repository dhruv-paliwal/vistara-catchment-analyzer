"""
FastAPI Backend for Geospatial Retail Expansion & Catchment Analyzer
Provides REST API endpoints for DBSCAN clustering and Random Forest revenue prediction.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import numpy as np
from sklearn.cluster import DBSCAN
from sklearn.ensemble import RandomForestRegressor
import math

app = FastAPI(
    title="Vistāra Geospatial Catchment Analyzer API",
    description="Microservice providing DBSCAN Spatial Clustering & Random Forest Retail Revenue Viability Simulation",
    version="1.0.0"
)

# Enable CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

EARTH_RADIUS_KM = 6371.0

def haversine_km(lat1, lon1, lat2, lon2):
    dLat = math.radians(lat2 - lat1)
    dLon = math.radians(lon2 - lon1)
    a = (math.sin(dLat / 2) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
         math.sin(dLon / 2) ** 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return EARTH_RADIUS_KM * c

# --- Pydantic Data Models ---
class CatchmentPointItem(BaseModel):
    id: str
    name: str
    lat: float
    lng: float
    type: str # 'Retail Hub' | 'Competitor' | 'Highway Intersection'
    dailyTraffic: float
    populationDensity: float

class ClusterRequest(BaseModel):
    points: List[CatchmentPointItem]
    epsKm: float = 1.8
    minSamples: int = 3

class PredictRequest(BaseModel):
    proposedLat: float
    proposedLng: float
    propertySizeSqFt: float = 1800.0
    points: List[CatchmentPointItem]
    epsKm: float = 1.8
    minSamples: int = 3

@app.get("/")
def read_root():
    return {
        "status": "online",
        "service": "Geospatial Retail Expansion & Catchment Analyzer ML Backend",
        "endpoints": ["/api/health", "/api/cluster", "/api/predict"]
    }

@app.get("/api/health")
def health_check():
    return {"status": "healthy", "engine": "scikit-learn", "python": "3.10+"}

@app.post("/api/cluster")
def cluster_points(req: ClusterRequest):
    if not req.points:
        return {"clusteredPoints": [], "clusters": [], "noisePointsCount": 0}

    # Extract coordinates in radians for spherical haversine DBSCAN
    coords = np.array([[math.radians(p.lat), math.radians(p.lng)] for p in req.points])
    
    # eps in radians = eps_km / Earth radius in km
    eps_radians = req.epsKm / EARTH_RADIUS_KM

    db = DBSCAN(eps=eps_radians, min_samples=req.minSamples, metric='haversine')
    labels = db.fit_predict(coords)

    clustered_points = []
    clusters_dict = {}

    for idx, (p, label) in enumerate(zip(req.points, labels)):
        cluster_id = int(label) + 1 if label >= 0 else -1
        p_dict = p.dict()
        p_dict["clusterId"] = cluster_id
        clustered_points.append(p_dict)

        if cluster_id > 0:
            if cluster_id not in clusters_dict:
                clusters_dict[cluster_id] = []
            clusters_dict[cluster_id].append(p_dict)

    formatted_clusters = []
    colors = ['#C85A32', '#E67E22', '#D49A1F', '#8E44AD', '#2E7D32', '#C0392B', '#16A085']

    for cid, pts in clusters_dict.items():
        lats = [pt["lat"] for pt in pts]
        lngs = [pt["lng"] for pt in pts]
        centroid = {"lat": float(np.mean(lats)), "lng": float(np.mean(lngs))}
        avg_traffic = int(np.mean([pt["dailyTraffic"] for pt in pts]))
        avg_density = int(np.mean([pt["populationDensity"] for pt in pts]))
        
        # Dominant type
        types = [pt["type"] for pt in pts]
        dominant_type = max(set(types), key=types.count)

        formatted_clusters.append({
            "id": cid,
            "name": f"Catchment Zone #{cid}",
            "color": colors[(cid - 1) % len(colors)],
            "pointCount": len(pts),
            "centroid": centroid,
            "avgTraffic": avg_traffic,
            "avgDensity": avg_density,
            "dominantType": dominant_type,
            "primaryCharacteristics": f"Density cluster of {len(pts)} commercial anchors, {avg_traffic:,} daily traffic, {avg_density:,}/km² population density."
        })

    noise_count = sum(1 for l in labels if l == -1)

    return {
        "clusteredPoints": clustered_points,
        "clusters": formatted_clusters,
        "noisePointsCount": noise_count
    }

@app.post("/api/predict")
def predict_viability(req: PredictRequest):
    if not req.points:
        raise HTTPException(status_code=400, detail="Points list cannot be empty")

    lat, lng = req.proposedLat, req.proposedLng

    # 1. Spatial calculations
    highways = [p for p in req.points if p.type == 'Highway Intersection']
    if highways:
        min_hw_dist = min([haversine_km(lat, lng, h.lat, h.lng) for h in highways])
    else:
        min_hw_dist = 2.5

    # Inverse distance weighting for local traffic & density
    weights = []
    traffics = []
    densities = []
    comp_count = 0
    hub_count = 0

    for p in req.points:
        d = max(haversine_km(lat, lng, p.lat, p.lng), 0.1)
        w = 1.0 / (d * d)
        weights.append(w)
        traffics.append(p.dailyTraffic)
        densities.append(p.populationDensity)
        if d <= 1.5:
            if p.type == 'Competitor':
                comp_count += 1
            elif p.type == 'Retail Hub':
                hub_count += 1

    total_w = sum(weights)
    interp_traffic = sum(t * w for t, w in zip(traffics, weights)) / total_w
    interp_density = sum(d * w for d, w in zip(densities, weights)) / total_w

    # Run clustering to test if inside cluster
    cluster_res = cluster_points(ClusterRequest(points=req.points, epsKm=req.epsKm, minSamples=req.minSamples))
    clusters = cluster_res["clusters"]
    
    is_inside = False
    nearest_cluster = None
    nearest_dist = float('inf')

    for c in clusters:
        dist = haversine_km(lat, lng, c["centroid"]["lat"], c["centroid"]["lng"])
        if dist < nearest_dist:
            nearest_dist = dist
            nearest_cluster = c
        if dist <= max(1.2, req.epsKm * 0.8):
            is_inside = True

    # Train Random Forest Regressor on benchmark scenarios
    # Features: [traffic, highway_dist, density, cluster_dist, is_inside, comp_count, hub_count]
    X_train = np.array([
        [70000, 0.4, 15000, 0.3, 1, 2, 3],
        [85000, 0.2, 18000, 0.2, 1, 3, 4],
        [45000, 1.2, 13000, 0.8, 1, 1, 1],
        [30000, 3.5, 9000, 2.8, 0, 0, 0],
        [120000, 0.1, 12000, 0.5, 1, 1, 2],
        [50000, 2.0, 16000, 1.5, 0, 1, 1],
        [95000, 0.6, 21000, 0.1, 1, 4, 3],
        [25000, 4.5, 8000, 4.0, 0, 0, 0],
    ])
    # Target: Annual revenue in INR for 1,800 sq ft property
    y_train = np.array([
        5800000, # ₹58 Lakhs
        8200000, # ₹82 Lakhs
        4200000, # ₹42 Lakhs
        2600000, # ₹26 Lakhs
        7400000, # ₹74 Lakhs
        3800000, # ₹38 Lakhs
        9600000, # ₹96 Lakhs
        2100000  # ₹21 Lakhs
    ])

    rf = RandomForestRegressor(n_estimators=30, random_state=42)
    rf.fit(X_train, y_train)

    X_test = np.array([[
        interp_traffic,
        min_hw_dist,
        interp_density,
        nearest_dist if nearest_dist != float('inf') else 3.0,
        1 if is_inside else 0,
        comp_count,
        hub_count
    ]])

    pred_revenue = float(rf.predict(X_test)[0])
    # Scale by property size
    pred_revenue = pred_revenue * (req.propertySizeSqFt / 1800.0)

    # Calculate Gini feature importances
    importances = rf.feature_importances_
    features = [
        {"feature": "daily_traffic_volume", "label": "Daily Traffic Volume", "importance": round(importances[0] * 100)},
        {"feature": "highway_proximity", "label": "Highway Intersection Proximity", "importance": round(importances[1] * 100)},
        {"feature": "population_density", "label": "Local Population Density", "importance": round(importances[2] * 100)},
        {"feature": "catchment_centroid", "label": "Catchment Centroid Proximity", "importance": round(importances[3] * 100)},
        {"feature": "commercial_synergy", "label": "Commercial Synergy & Clustering", "importance": round((importances[4] + importances[5] + importances[6]) * 100)},
    ]
    features.sort(key=lambda x: x["importance"], reverse=True)

    # Format INR
    lakhs = pred_revenue / 100000
    if lakhs >= 100:
        formatted_rev = f"₹{lakhs/100:.2f} Crores"
    else:
        formatted_rev = f"₹{lakhs:.1f} Lakhs"

    return {
        "coordinates": {"lat": lat, "lng": lng},
        "isInViableZone": is_inside,
        "targetClusterName": nearest_cluster["name"] if nearest_cluster else "Unclustered Fringe Node",
        "projectedAnnualRevenueINR": round(pred_revenue),
        "projectedAnnualRevenueFormatted": formatted_rev,
        "featureImportances": features,
        "keySpatialMetrics": {
            "nearestHighwayDistanceKm": round(min_hw_dist, 2),
            "nearestCentroidDistanceKm": round(nearest_dist, 2) if nearest_dist != float('inf') else 0,
            "interpolatedTrafficVolume": int(interp_traffic),
            "interpolatedPopulationDensity": int(interp_density),
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

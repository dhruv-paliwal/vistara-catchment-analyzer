import { CatchmentPoint } from './types';

const EARTH_RADIUS_KM = 6371.0;

/**
 * Calculates great-circle distance between two coordinates using the Haversine formula
 * Returns distance in kilometers
 */
export function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_KM * c;
}

/**
 * Calculates the distance to the nearest Highway Intersection for a given point
 */
export function getDistanceToNearestHighway(
  lat: number,
  lng: number,
  points: CatchmentPoint[]
): { distanceKm: number; nearestHighwayName: string } {
  const highwayPoints = points.filter(
    (p) => p.type === 'Highway Intersection'
  );

  if (highwayPoints.length === 0) {
    return { distanceKm: 2.5, nearestHighwayName: 'State Highway Corridor' };
  }

  let minDistance = Infinity;
  let nearestHighwayName = highwayPoints[0].name;

  for (const highway of highwayPoints) {
    // Avoid zero distance if the point itself is the highway
    if (highway.lat === lat && highway.lng === lng) continue;
    const dist = haversineDistance(lat, lng, highway.lat, highway.lng);
    if (dist < minDistance) {
      minDistance = dist;
      nearestHighwayName = highway.name;
    }
  }

  // If minDistance is still Infinity (e.g. only 1 highway and this point is it)
  if (minDistance === Infinity) {
    minDistance = 0.05;
  }

  return { distanceKm: minDistance, nearestHighwayName };
}

/**
 * Calculates average distance to the nearest major highway intersection for the whole dataset
 */
export function calculateAverageDistanceToHighway(points: CatchmentPoint[]): number {
  if (!points || points.length === 0) return 0;

  const highwayPoints = points.filter((p) => p.type === 'Highway Intersection');
  if (highwayPoints.length === 0) return 0;

  let totalDist = 0;
  let count = 0;

  for (const point of points) {
    let minDist = Infinity;
    for (const h of highwayPoints) {
      const dist = haversineDistance(point.lat, point.lng, h.lat, h.lng);
      if (dist < minDist) {
        minDist = dist;
      }
    }
    if (minDist !== Infinity) {
      totalDist += minDist;
      count++;
    }
  }

  return count > 0 ? totalDist / count : 0;
}

/**
 * Calculates the geographic centroid of a list of points
 */
export function calculateCentroid(points: CatchmentPoint[]): { lat: number; lng: number } {
  if (points.length === 0) return { lat: 12.9716, lng: 77.5946 };
  const sumLat = points.reduce((acc, p) => acc + p.lat, 0);
  const sumLng = points.reduce((acc, p) => acc + p.lng, 0);
  return {
    lat: sumLat / points.length,
    lng: sumLng / points.length,
  };
}

/**
 * Calculates a 2D convex hull around points to draw catchment polygons
 * Uses Monotone Chain algorithm, and if fewer than 3 points, creates an expanded buffer ring
 */
export function calculateConvexHull(points: CatchmentPoint[], bufferKm: number = 0.4): [number, number][] {
  if (points.length === 0) return [];

  if (points.length === 1) {
    // Circle buffer around 1 point
    return createCircularBuffer(points[0].lat, points[0].lng, bufferKm);
  }

  if (points.length === 2) {
    // Oval / pill buffer around 2 points
    const p1 = points[0];
    const p2 = points[1];
    return [
      ...createCircularBuffer(p1.lat, p1.lng, bufferKm).slice(0, 8),
      ...createCircularBuffer(p2.lat, p2.lng, bufferKm).slice(0, 8),
    ];
  }

  // Convert points to [lat, lng] array
  const pts = points.map((p) => [p.lat, p.lng] as [number, number]);

  // Sort by lat then lng
  pts.sort((a, b) => (a[0] === b[0] ? a[1] - b[1] : a[0] - b[0]));

  const cross = (o: [number, number], a: [number, number], b: [number, number]) =>
    (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);

  // Lower hull
  const lower: [number, number][] = [];
  for (const p of pts) {
    while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], p) <= 0) {
      lower.pop();
    }
    lower.push(p);
  }

  // Upper hull
  const upper: [number, number][] = [];
  for (let i = pts.length - 1; i >= 0; i--) {
    const p = pts[i];
    while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], p) <= 0) {
      upper.pop();
    }
    upper.push(p);
  }

  lower.pop();
  upper.pop();
  const hull = lower.concat(upper);

  // If hull is too tight, slightly expand each point away from the centroid by bufferKm
  const centroid = calculateCentroid(points);
  const kmToDegLat = 1 / 111.0;
  const kmToDegLng = 1 / (111.0 * Math.cos((centroid.lat * Math.PI) / 180));

  return hull.map(([lat, lng]) => {
    const dLat = lat - centroid.lat;
    const dLng = lng - centroid.lng;
    const dist = Math.sqrt(dLat * dLat + dLng * dLng) || 0.001;
    const expansion = (bufferKm * 0.5) * kmToDegLat;
    return [lat + (dLat / dist) * expansion, lng + (dLng / dist) * expansion * (kmToDegLng / kmToDegLat)];
  });
}

function createCircularBuffer(lat: number, lng: number, radiusKm: number, steps: number = 16): [number, number][] {
  const kmToDegLat = radiusKm / 111.0;
  const kmToDegLng = radiusKm / (111.0 * Math.cos((lat * Math.PI) / 180));
  const coords: [number, number][] = [];
  for (let i = 0; i < steps; i++) {
    const angle = (i * 2 * Math.PI) / steps;
    coords.push([
      lat + Math.sin(angle) * kmToDegLat,
      lng + Math.cos(angle) * kmToDegLng,
    ]);
  }
  return coords;
}

/**
 * Inverse Distance Weighting (IDW) interpolation to estimate traffic and population density
 * at any given target coordinate based on surrounding known catchment points
 */
export function interpolateSpatialFeatures(
  targetLat: number,
  targetLng: number,
  points: CatchmentPoint[]
): {
  interpolatedTraffic: number;
  interpolatedDensity: number;
  nearestCompetitorDistanceKm: number;
  nearestHubDistanceKm: number;
  competitorCountWithin1_5km: number;
  retailHubCountWithin1_5km: number;
} {
  if (points.length === 0) {
    return {
      interpolatedTraffic: 50000,
      interpolatedDensity: 14000,
      nearestCompetitorDistanceKm: 1.0,
      nearestHubDistanceKm: 0.8,
      competitorCountWithin1_5km: 2,
      retailHubCountWithin1_5km: 3,
    };
  }

  let totalWeight = 0;
  let weightedTraffic = 0;
  let weightedDensity = 0;

  let nearestCompetitorDist = Infinity;
  let nearestHubDist = Infinity;
  let competitorCount = 0;
  let retailHubCount = 0;

  for (const p of points) {
    const distKm = haversineDistance(targetLat, targetLng, p.lat, p.lng);
    const effectiveDist = Math.max(distKm, 0.1); // prevent division by zero
    const weight = 1 / (effectiveDist * effectiveDist);

    totalWeight += weight;
    weightedTraffic += p.dailyTraffic * weight;
    weightedDensity += p.populationDensity * weight;

    if (p.type === 'Competitor') {
      if (distKm < nearestCompetitorDist) nearestCompetitorDist = distKm;
      if (distKm <= 1.5) competitorCount++;
    } else if (p.type === 'Retail Hub') {
      if (distKm < nearestHubDist) nearestHubDist = distKm;
      if (distKm <= 1.5) retailHubCount++;
    }
  }

  return {
    interpolatedTraffic: Math.round(weightedTraffic / (totalWeight || 1)),
    interpolatedDensity: Math.round(weightedDensity / (totalWeight || 1)),
    nearestCompetitorDistanceKm: nearestCompetitorDist === Infinity ? 2.0 : nearestCompetitorDist,
    nearestHubDistanceKm: nearestHubDist === Infinity ? 1.5 : nearestHubDist,
    competitorCountWithin1_5km: competitorCount,
    retailHubCountWithin1_5km: retailHubCount,
  };
}

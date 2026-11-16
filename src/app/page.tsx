'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Header } from '@/components/Header';
import { DataUploadPanel } from '@/components/DataUploadPanel';
import { HighwayMetricCard } from '@/components/HighwayMetricCard';
import { HeatmapControl } from '@/components/HeatmapControl';
import { DbscanPanel } from '@/components/DbscanPanel';
import { ViabilityTestForm } from '@/components/ViabilityTestForm';
import { FeatureImportanceChart } from '@/components/FeatureImportanceChart';
import { SiteViabilityReportModal } from '@/components/SiteViabilityReportModal';
import { MapContainer } from '@/components/MapContainer';
import { BENGALURU_SAMPLE_DATA } from '@/lib/sampleData';
import { CatchmentPoint, CatchmentCluster, ViabilityPrediction } from '@/lib/types';
import { runDBSCAN } from '@/lib/dbscan';
import { predictViabilityAndRevenue } from '@/lib/randomForest';
import { MapPin, Sparkles, AlertCircle, Layers } from 'lucide-react';

export default function Home() {
  // --- State: Geospatial Catchment Data ---
  const [points, setPoints] = useState<CatchmentPoint[]>(BENGALURU_SAMPLE_DATA);
  const [activeFileName, setActiveFileName] = useState<string>('Bengaluru_Commercial_Catchment_Data.csv');

  // --- State: Spatial EDA & Heatmapping ---
  const [showHeatmap, setShowHeatmap] = useState<boolean>(false);
  const [heatmapMetric, setHeatmapMetric] = useState<'traffic' | 'density' | 'points'>('traffic');

  // --- State: Catchment Clustering DBSCAN ---
  const [epsKm, setEpsKm] = useState<number>(1.8);
  const [minSamples, setMinSamples] = useState<number>(3);
  const [clusters, setClusters] = useState<CatchmentCluster[]>([]);
  const [noisePointsCount, setNoisePointsCount] = useState<number>(0);
  const [isClustering, setIsClustering] = useState<boolean>(false);
  const [selectedClusterId, setSelectedClusterId] = useState<number | null>(null);

  // --- State: Revenue Viability & Random Forest ---
  const [proposedLat, setProposedLat] = useState<number>(12.9348); // Default Koramangala
  const [proposedLng, setProposedLng] = useState<number>(77.6255);
  const [propertySqFt, setPropertySqFt] = useState<number>(1800); // 1,800 sq ft standard
  const [isPinDropMode, setIsPinDropMode] = useState<boolean>(false);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [prediction, setPrediction] = useState<ViabilityPrediction | null>(null);

  // --- State: Site Viability Report Overlay ---
  const [showReportModal, setShowReportModal] = useState<boolean>(false);

  // --- State: ML Backend Settings (FastAPI Python / Colab Integration) ---
  const [useBackendApi, setUseBackendApi] = useState<boolean>(false);
  const [apiEndpoint, setApiEndpoint] = useState<string>('http://localhost:8000');

  // Automatically run initial clustering and benchmark simulation on mount
  useEffect(() => {
    executeDBSCAN(BENGALURU_SAMPLE_DATA, 1.8, 3);
  }, []);

  // --- Handler: Execute DBSCAN Clustering ---
  const executeDBSCAN = async (pts: CatchmentPoint[], eps: number, minPts: number) => {
    setIsClustering(true);
    try {
      if (useBackendApi) {
        // Call FastAPI Python endpoint
        const res = await fetch(`${apiEndpoint}/api/cluster`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ points: pts, epsKm: eps, minSamples: minPts }),
        });
        if (!res.ok) throw new Error('Backend clustering service failed');
        const data = await res.json();
        setPoints(data.clusteredPoints || pts);
        setClusters(data.clusters || []);
        setNoisePointsCount(data.noisePointsCount || 0);
      } else {
        // Instant In-Browser Engine
        const result = runDBSCAN(pts, eps, minPts);
        setPoints(result.clusteredPoints);
        setClusters(result.clusters);
        setNoisePointsCount(result.noisePointsCount);
      }
    } catch (err) {
      console.warn('Fallback to in-browser DBSCAN:', err);
      const result = runDBSCAN(pts, eps, minPts);
      setPoints(result.clusteredPoints);
      setClusters(result.clusters);
      setNoisePointsCount(result.noisePointsCount);
    } finally {
      setIsClustering(false);
    }
  };

  // --- Handler: Execute Random Forest Simulation ---
  const executeViabilityPrediction = async () => {
    setIsSimulating(true);
    try {
      if (useBackendApi) {
        // Call FastAPI Python endpoint
        const res = await fetch(`${apiEndpoint}/api/predict`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            proposedLat,
            proposedLng,
            propertySizeSqFt: propertySqFt,
            points,
            epsKm,
            minSamples,
          }),
        });
        if (!res.ok) throw new Error('Backend prediction service failed');
        const data = await res.json();
        // Enrich with client-side formatters if needed
        const pred = predictViabilityAndRevenue(
          proposedLat,
          proposedLng,
          points,
          clusters,
          propertySqFt
        );
        // Merge backend values
        pred.projectedAnnualRevenueINR = data.projectedAnnualRevenueINR || pred.projectedAnnualRevenueINR;
        pred.projectedAnnualRevenueFormatted = data.projectedAnnualRevenueFormatted || pred.projectedAnnualRevenueFormatted;
        if (data.featureImportances) {
          pred.featureImportances = data.featureImportances;
        }
        setPrediction(pred);
        setShowReportModal(true);
      } else {
        // Instant In-Browser Random Forest Ensemble
        const pred = predictViabilityAndRevenue(
          proposedLat,
          proposedLng,
          points,
          clusters,
          propertySqFt
        );
        setPrediction(pred);
        setShowReportModal(true);
      }
    } catch (err) {
      console.warn('Fallback to in-browser Random Forest:', err);
      const pred = predictViabilityAndRevenue(
        proposedLat,
        proposedLng,
        points,
        clusters,
        propertySqFt
      );
      setPrediction(pred);
      setShowReportModal(true);
    } finally {
      setIsSimulating(false);
    }
  };

  // --- Handler: Map Click (Pin Drop) ---
  const handleMapClick = useCallback((lat: number, lng: number) => {
    setProposedLat(parseFloat(lat.toFixed(5)));
    setProposedLng(parseFloat(lng.toFixed(5)));
    setIsPinDropMode(false); // Cleanly disable pin drop mode after placing
  }, []);

  // --- Handler: New CSV Data Ingestion ---
  const handleDataLoaded = (newPoints: CatchmentPoint[], fileName: string) => {
    setPoints(newPoints);
    setActiveFileName(fileName);
    // Automatically re-run clustering on new dataset
    executeDBSCAN(newPoints, epsKm, minSamples);
    setPrediction(null);
  };

  // --- Handler: Reset to Bengaluru Benchmark Sample Dataset ---
  const handleResetToSample = () => {
    setPoints(BENGALURU_SAMPLE_DATA);
    setActiveFileName('Bengaluru_Commercial_Catchment_Data.csv');
    executeDBSCAN(BENGALURU_SAMPLE_DATA, epsKm, minSamples);
  };

  // --- Handler: Download Mock CSV Template ---
  const handleDownloadTemplate = () => {
    const csvContent =
`Location_Name,Latitude,Longitude,Location_Type,Daily_Traffic_Volume,Local_Population_Density
Indiranagar 100ft Road,12.9719,77.6412,Retail Hub,68500,14200
Indiranagar 12th Main,12.9698,77.6435,Competitor,42000,13800
Indiranagar Metro Station,12.9784,77.6387,Retail Hub,78000,15100
Koramangala 80ft Road,12.9352,77.6245,Retail Hub,72000,16800
Koramangala Sony World Signal,12.9344,77.6288,Retail Hub,85000,17200
Koramangala 5th Block,12.9359,77.6186,Competitor,54000,18500
Silk Board Junction,12.9175,77.6238,Highway Intersection,165000,11500
HSR Layout 27th Main,12.9116,77.6515,Retail Hub,58000,14900
Marathahalli Outer Ring Road,12.9562,77.7011,Highway Intersection,142000,12600
Whitefield ITPL Main Rd,12.9863,77.7314,Highway Intersection,115000,11200
Phoenix Marketcity Mahadevapura,12.9961,77.6963,Retail Hub,102000,14500
MG Road Brigade Junction,12.9754,77.6066,Retail Hub,94000,19200
Hebbal Flyover Junction,13.0358,77.5970,Highway Intersection,175000,9400
Electronic City Toll Plaza,12.8452,77.6602,Highway Intersection,125000,8900
`;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'Bengaluru_Commercial_Catchment_Data.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-[#FAF6ED] flex flex-col font-sans text-sandstone-900">
      
      {/* Indian Aesthetic Navigation Header */}
      <Header
        pointCount={points.length}
        clusterCount={clusters.length}
        onResetToSample={handleResetToSample}
        onDownloadTemplate={handleDownloadTemplate}
        apiEndpoint={apiEndpoint}
        setApiEndpoint={setApiEndpoint}
        useBackendApi={useBackendApi}
        setUseBackendApi={setUseBackendApi}
      />

      {/* Main Workspace Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5">
        
        {/* Dual Column Layout: Left Control & Pipeline Panel, Right Map & Visualizer */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          
          {/* Left Column: Analysis & Simulation Control Panels */}
          <div className="lg:col-span-5 space-y-4">
            
            {/* CSV Upload Panel */}
            <DataUploadPanel
              onDataLoaded={handleDataLoaded}
              activeFileName={activeFileName}
              totalPoints={points.length}
            />

            {/* Highway Proximity Metric Card */}
            <HighwayMetricCard points={points} />

            {/* DBSCAN Clustering Control Panel */}
            <DbscanPanel
              epsKm={epsKm}
              setEpsKm={setEpsKm}
              minSamples={minSamples}
              setMinSamples={setMinSamples}
              onRunClustering={() => executeDBSCAN(points, epsKm, minSamples)}
              isClustering={isClustering}
              clusters={clusters}
              noisePointsCount={noisePointsCount}
              selectedClusterId={selectedClusterId}
              setSelectedClusterId={setSelectedClusterId}
            />

            {/* Test New Location (1,800 sq ft) Form */}
            <ViabilityTestForm
              proposedLat={proposedLat}
              setProposedLat={setProposedLat}
              proposedLng={proposedLng}
              setProposedLng={setProposedLng}
              propertySqFt={propertySqFt}
              setPropertySqFt={setPropertySqFt}
              isPinDropMode={isPinDropMode}
              setIsPinDropMode={setIsPinDropMode}
              onRunSimulation={executeViabilityPrediction}
              isSimulating={isSimulating}
            />

          </div>

          {/* Right Column: Interactive Map, Heatmap Toggle, Feature Importances (7 Cols on LG) */}
          <div className="lg:col-span-7 space-y-4">
            
            {/* Heatmap Toggle Header Bar above Map */}
            <HeatmapControl
              showHeatmap={showHeatmap}
              setShowHeatmap={setShowHeatmap}
              heatmapMetric={heatmapMetric}
              setHeatmapMetric={setHeatmapMetric}
            />

            {/* Interactive Leaflet Web Map Container */}
            <div className="relative">
              <MapContainer
                points={points}
                clusters={clusters}
                showHeatmap={showHeatmap}
                heatmapMetric={heatmapMetric}
                proposedLat={proposedLat}
                proposedLng={proposedLng}
                isPinDropMode={isPinDropMode}
                setIsPinDropMode={setIsPinDropMode}
                onMapClick={handleMapClick}
                selectedClusterId={selectedClusterId}
              />

              {/* Overlay Quick-Access Pill to open Site Viability Report if generated */}
              {prediction && (
                <div className="absolute top-4 right-4 z-[400] flex items-center gap-2">
                  <button
                    onClick={() => setShowReportModal(true)}
                    className="px-3.5 py-2 rounded-xl bg-[#FFFDF9]/95 backdrop-blur-md border border-saffron-300 text-sandstone-900 font-medium text-xs shadow-warm flex items-center gap-2 hover:bg-cream-50 hover:border-terracotta-400 transition-all active:scale-[0.98]"
                  >
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>View Viability Report ({prediction.projectedAnnualRevenueFormatted})</span>
                  </button>
                </div>
              )}
            </div>

            {/* Recharts Feature Importance Visualization */}
            {prediction && (
              <FeatureImportanceChart
                data={prediction.featureImportances}
                propertySqFt={prediction.propertySizeSqFt}
              />
            )}

            {/* Helper Empty State if simulation not run yet */}
            {!prediction && (
              <div className="p-4 rounded-2xl bg-cream-100/60 border border-cream-200 text-center text-xs text-sandstone-600">
                <span className="font-serif font-semibold text-sandstone-800 block text-sm mb-1">
                  Ready for Viability Prediction
                </span>
                Click on the map or enter coordinates in the candidate site form to evaluate an 1,800 sq ft retail store. The Random Forest simulation will compute revenue and visualize feature importance weights here.
              </div>
            )}

          </div>

        </div>

      </main>

      {/* Printable Site Viability Report Card Modal */}
      {showReportModal && prediction && (
        <SiteViabilityReportModal
          prediction={prediction}
          onClose={() => setShowReportModal(false)}
        />
      )}

      {/* Subtle Heritage Footer */}
      <footer className="mt-8 py-4 border-t border-cream-300 bg-[#FFFDF9] text-center text-xs text-sandstone-600">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            Vistāra Geospatial Intelligence • Designed for Indian Commercial Retail Expansion
          </span>
          <span className="text-sandstone-500 font-serif">
            Bengaluru Urban Corridor Engine • All metrics in Indian Rupees (₹)
          </span>
        </div>
      </footer>

    </div>
  );
}

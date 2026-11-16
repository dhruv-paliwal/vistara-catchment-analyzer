'use client';

import React from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  X,
  Download,
  Printer,
  Share2,
  Building,
  Navigation,
  Users,
  Compass,
  TrendingUp,
  FileCheck,
} from 'lucide-react';
import { ViabilityPrediction } from '@/lib/types';
import { MandalaIcon, JaliBorderPattern } from './IndianMotifs';
import { formatDistance, formatTraffic, formatDensity, formatINR } from '@/lib/formatters';

interface SiteViabilityReportModalProps {
  prediction: ViabilityPrediction | null;
  onClose: () => void;
}

export function SiteViabilityReportModal({
  prediction,
  onClose,
}: SiteViabilityReportModalProps) {
  if (!prediction) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadJson = () => {
    const reportData = {
      project: 'Geospatial Retail Expansion & Catchment Analyzer',
      timestamp: new Date().toISOString(),
      location: {
        latitude: prediction.coordinates.lat,
        longitude: prediction.coordinates.lng,
        propertySizeSqFt: prediction.propertySizeSqFt,
      },
      viability: {
        isInViableCatchmentZone: prediction.isInViableZone,
        clusterName: prediction.targetClusterName,
        viabilityTier: prediction.viabilityTier,
        projectedAnnualRevenue: prediction.projectedAnnualRevenueFormatted,
        projectedAnnualRevenueINR: prediction.projectedAnnualRevenueINR,
        breakEvenPeriodMonths: prediction.breakEvenPeriodMonths,
      },
      zoneCharacteristics: prediction.zoneCharacteristics,
      spatialMetrics: prediction.keySpatialMetrics,
      strategicRecommendation: prediction.strategicRecommendation,
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Site_Viability_Report_${prediction.coordinates.lat.toFixed(4)}_${prediction.coordinates.lng.toFixed(4)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-sandstone-950/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 print:p-0 print:bg-white print:fixed print:inset-0">
      
      {/* Report Card Modal */}
      <div className="relative w-full max-w-3xl bg-[#FFFDF9] rounded-3xl shadow-warm-xl border border-cream-300 overflow-hidden print:shadow-none print:border-none print:max-w-none">
        
        {/* Top Heritage Trim */}
        <div className="h-2 w-full bg-gradient-to-r from-terracotta-600 via-saffron-500 to-turmeric-400" />
        <JaliBorderPattern className="h-3 w-full bg-cream-100/50" />

        {/* Modal Header */}
        <div className="px-6 pt-5 pb-4 border-b border-cream-200 flex items-start justify-between">
          <div className="flex items-center space-x-3.5">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-terracotta-500 to-saffron-600 text-white shadow-warm">
              <MandalaIcon className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold tracking-wider uppercase text-terracotta-700 bg-terracotta-50 px-2 py-0.5 rounded-full border border-terracotta-200">
                  Site Viability Report • Confidential
                </span>
                <span className="text-xs text-sandstone-500 font-mono">
                  {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-sandstone-900 mt-0.5">
                Commercial Feasibility & Catchment Clearance
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2 print:hidden">
            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-sandstone-400 hover:text-sandstone-700 hover:bg-cream-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Report Content */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto print:max-h-none print:overflow-visible">
          
          {/* Section A: Viability Status Banner */}
          <div
            className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
              prediction.isInViableZone
                ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950'
                : 'bg-amber-50/80 border-amber-300 text-amber-950'
            }`}
          >
            <div className="flex items-start space-x-3">
              <div className={`p-2 rounded-xl mt-0.5 ${prediction.isInViableZone ? 'bg-emerald-600 text-white' : 'bg-amber-500 text-white'}`}>
                {prediction.isInViableZone ? <CheckCircle2 className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
              </div>
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider block opacity-75">
                  Catchment Zone Status
                </span>
                <h3 className="text-lg font-serif font-bold">
                  {prediction.isInViableZone
                    ? `Coordinate Falls Inside a Viable Catchment Zone`
                    : `Coordinate Lies Outside Validated Catchment Zones`}
                </h3>
                <p className="text-xs mt-0.5">
                  Associated Zone: <strong className="font-semibold underline decoration-dotted">{prediction.targetClusterName}</strong>
                </p>
              </div>
            </div>

            <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-sandstone-200">
              <span className="text-xs font-medium opacity-75">Classification:</span>
              <span className="font-serif font-bold text-sm sm:text-base px-2.5 py-1 rounded-lg bg-white/80 shadow-sm border border-sandstone-200 text-sandstone-900">
                {prediction.viabilityTier}
              </span>
            </div>
          </div>

          {/* Section C: Projected Annual Revenue (Featured Callout) */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-cream-100 via-[#FFFDF9] to-cream-50 border border-saffron-300 shadow-warm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-3 opacity-10">
              <MandalaIcon className="w-36 h-36 text-terracotta-700" />
            </div>

            <div className="relative z-10">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-saffron-800 bg-saffron-100 px-2 py-0.5 rounded-md">
                    Projected Annual Revenue
                  </span>
                  <div className="flex items-baseline gap-2 sm:gap-3 mt-1.5">
                    <span className="text-3xl sm:text-4xl font-serif font-extrabold text-terracotta-600 tracking-tight">
                      {prediction.projectedAnnualRevenueFormatted}
                    </span>
                    <span className="text-xs text-sandstone-600 font-medium">
                      (~{prediction.projectedMonthlyRevenueFormatted} / month)
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[11px] text-sandstone-600 block">Property Footprint</span>
                  <span className="font-serif font-bold text-base text-sandstone-900">
                    {prediction.propertySizeSqFt.toLocaleString('en-IN')} sq ft
                  </span>
                  <span className="text-[10px] text-sandstone-500 block">
                    (₹{Math.round(prediction.projectedAnnualRevenueINR / prediction.propertySizeSqFt).toLocaleString('en-IN')}/sq ft/yr)
                  </span>
                </div>
              </div>

              {/* Financial Timeline Grid */}
              <div className="mt-4 pt-3 border-t border-cream-200 grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2 rounded-lg bg-white/80 border border-cream-200">
                  <span className="text-[10px] text-sandstone-500 block">Break-Even Horizon</span>
                  <strong className="text-sandstone-900 font-serif font-bold text-sm">
                    {prediction.breakEvenPeriodMonths} Months
                  </strong>
                </div>
                <div className="p-2 rounded-lg bg-white/80 border border-cream-200">
                  <span className="text-[10px] text-sandstone-500 block">Est. Return on Capital (ROI)</span>
                  <strong className="text-emerald-700 font-serif font-bold text-sm">
                    +{prediction.roiEstimatePercent}%
                  </strong>
                </div>
                <div className="p-2 rounded-lg bg-white/80 border border-cream-200">
                  <span className="text-[10px] text-sandstone-500 block">Model Confidence</span>
                  <strong className="text-saffron-700 font-serif font-bold text-sm">
                    {prediction.confidenceScore}% (Bagging)
                  </strong>
                </div>
              </div>
            </div>
          </div>

          {/* Section B: Target Zone's Primary Characteristics */}
          <div>
            <h4 className="font-serif font-bold text-sandstone-900 text-sm mb-2.5 flex items-center gap-2">
              <span className="w-1.5 h-4 bg-terracotta-500 rounded-full" />
              <span>Target Zone Primary Characteristics</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-cream-50 border border-cream-200">
                <span className="font-medium text-sandstone-500 text-[11px] block">Commercial Footfall & Traffic</span>
                <span className="font-semibold text-sandstone-900 text-sm block mt-0.5">
                  {formatTraffic(prediction.keySpatialMetrics.interpolatedTrafficVolume)}
                </span>
                <p className="text-[11px] text-sandstone-600 mt-1">
                  {prediction.zoneCharacteristics.trafficProfile}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-cream-50 border border-cream-200">
                <span className="font-medium text-sandstone-500 text-[11px] block">Local Demographic Density</span>
                <span className="font-semibold text-sandstone-900 text-sm block mt-0.5">
                  {formatDensity(prediction.keySpatialMetrics.interpolatedPopulationDensity)}
                </span>
                <p className="text-[11px] text-sandstone-600 mt-1">
                  {prediction.zoneCharacteristics.demographicDensity}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-cream-50 border border-cream-200">
                <span className="font-medium text-sandstone-500 text-[11px] block">Highway Arterial Proximity</span>
                <span className="font-semibold text-sandstone-900 text-sm block mt-0.5">
                  {formatDistance(prediction.keySpatialMetrics.nearestHighwayDistanceKm)} to Arterial Interchange
                </span>
                <p className="text-[11px] text-sandstone-600 mt-1">
                  Provides seamless feeder vehicular access for regional shoppers.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-cream-50 border border-cream-200">
                <span className="font-medium text-sandstone-500 text-[11px] block">Commercial Aggregation Synergy</span>
                <span className="font-semibold text-sandstone-900 text-sm block mt-0.5">
                  {prediction.keySpatialMetrics.retailHubCountWithin1_5km} Retail Hubs, {prediction.keySpatialMetrics.competitorCountWithin1_5km} Rivals
                </span>
                <p className="text-[11px] text-sandstone-600 mt-1">
                  {prediction.zoneCharacteristics.competitiveMoat}
                </p>
              </div>
            </div>
          </div>

          {/* Strategic Recommendation */}
          <div className="p-4 rounded-xl bg-cream-100/70 border border-cream-300 text-xs text-sandstone-800">
            <span className="font-serif font-bold text-sandstone-900 block mb-1">
              Executive Committee Recommendation:
            </span>
            <p className="leading-relaxed">
              {prediction.strategicRecommendation}
            </p>
          </div>

          {/* GPS Coordinates Seal */}
          <div className="flex items-center justify-between text-[11px] text-sandstone-500 pt-2 border-t border-cream-200 font-mono">
            <span>Coordinates: {prediction.coordinates.lat.toFixed(5)}°N, {prediction.coordinates.lng.toFixed(5)}°E</span>
            <span>Bengaluru Urban District • EPSG:4326</span>
          </div>

        </div>

        {/* Modal Footer & Download Actions */}
        <div className="px-6 py-4 bg-cream-100/80 border-t border-cream-200 flex flex-wrap items-center justify-between gap-3 print:hidden">
          <div className="flex items-center gap-2 text-xs text-sandstone-600">
            <FileCheck className="w-4 h-4 text-emerald-600" />
            <span>Audit report ready for investment memo presentation</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white text-sandstone-800 border border-cream-300 hover:bg-cream-50 hover:border-sandstone-400 shadow-sm transition-all"
            >
              <Printer className="w-3.5 h-3.5 text-sandstone-600" />
              <span>Print Viability Card</span>
            </button>

            <button
              onClick={handleDownloadJson}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-terracotta-600 to-saffron-600 hover:from-terracotta-700 hover:to-saffron-700 text-white shadow-warm transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Report (JSON)</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

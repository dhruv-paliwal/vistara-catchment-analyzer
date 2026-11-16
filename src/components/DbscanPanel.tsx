'use client';

import React from 'react';
import { Sliders, Play, Layers, AlertCircle, Sparkles, CheckCircle2 } from 'lucide-react';
import { CatchmentCluster } from '@/lib/types';
import { formatTraffic, formatDensity } from '@/lib/formatters';

interface DbscanPanelProps {
  epsKm: number;
  setEpsKm: (val: number) => void;
  minSamples: number;
  setMinSamples: (val: number) => void;
  onRunClustering: () => void;
  isClustering: boolean;
  clusters: CatchmentCluster[];
  noisePointsCount: number;
  selectedClusterId: number | null;
  setSelectedClusterId: (id: number | null) => void;
}

export function DbscanPanel({
  epsKm,
  setEpsKm,
  minSamples,
  setMinSamples,
  onRunClustering,
  isClustering,
  clusters,
  noisePointsCount,
  selectedClusterId,
  setSelectedClusterId,
}: DbscanPanelProps) {
  return (
    <div className="bg-[#FFFDF9] rounded-2xl border border-cream-300 shadow-warm p-4 sm:p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-terracotta-100 text-terracotta-700">
            <Sliders className="w-4 h-4" />
          </div>
          <h2 className="font-serif font-bold text-sandstone-900 text-base">
            Catchment Area Clustering (DBSCAN)
          </h2>
        </div>
        <span className="text-xs text-sandstone-600 bg-cream-100 px-2 py-0.5 rounded-md border border-cream-200">
          Spatial Density Engine
        </span>
      </div>

      <p className="text-xs text-sandstone-600 mb-4">
        Calibrate neighborhood radius (<code className="font-mono text-terracotta-700 bg-terracotta-50 px-1 py-0.2 rounded">eps</code>) and density threshold (<code className="font-mono text-terracotta-700 bg-terracotta-50 px-1 py-0.2 rounded">min_samples</code>) to group contiguous retail nodes into validated catchment basins.
      </p>

      {/* Sliders Container */}
      <div className="space-y-4 p-3.5 bg-cream-50/80 rounded-xl border border-cream-200">
        {/* Slider 1: eps (0.5km to 5.0km) */}
        <div>
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="font-medium text-sandstone-800 flex items-center gap-1.5">
              <span>Cluster Radius (<strong className="font-mono">eps</strong>):</span>
              <span className="text-[11px] text-sandstone-600 font-normal">Haversine metric</span>
            </span>
            <span className="font-serif font-bold text-terracotta-600 text-sm bg-white px-2 py-0.5 rounded border border-cream-300 shadow-sm">
              {epsKm.toFixed(1)} km
            </span>
          </div>
          <input
            type="range"
            min="0.5"
            max="5.0"
            step="0.1"
            value={epsKm}
            onChange={(e) => setEpsKm(parseFloat(e.target.value))}
            className="w-full h-2 bg-cream-300 rounded-lg appearance-none cursor-pointer accent-terracotta-600"
          />
          <div className="flex justify-between text-[10px] text-sandstone-600 mt-1">
            <span>0.5 km (Tight Walkshed)</span>
            <span>2.5 km (Sub-market)</span>
            <span>5.0 km (Regional Belt)</span>
          </div>
        </div>

        {/* Slider 2: min_samples (2 to 10 points) */}
        <div>
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="font-medium text-sandstone-800 flex items-center gap-1.5">
              <span>Density Threshold (<strong className="font-mono">min_samples</strong>):</span>
              <span className="text-[11px] text-sandstone-600 font-normal">Min retail anchors</span>
            </span>
            <span className="font-serif font-bold text-terracotta-600 text-sm bg-white px-2 py-0.5 rounded border border-cream-300 shadow-sm">
              {minSamples} points
            </span>
          </div>
          <input
            type="range"
            min="2"
            max="10"
            step="1"
            value={minSamples}
            onChange={(e) => setMinSamples(parseInt(e.target.value, 10))}
            className="w-full h-2 bg-cream-300 rounded-lg appearance-none cursor-pointer accent-terracotta-600"
          />
          <div className="flex justify-between text-[10px] text-sandstone-600 mt-1">
            <span>2 anchors</span>
            <span>5 anchors</span>
            <span>10 anchors</span>
          </div>
        </div>

        {/* Run Clustering Button */}
        <button
          onClick={onRunClustering}
          disabled={isClustering}
          className="w-full py-2.5 px-4 rounded-xl font-medium text-xs sm:text-sm text-cream-50 bg-gradient-to-r from-terracotta-600 via-saffron-600 to-terracotta-700 hover:from-terracotta-700 hover:to-saffron-700 shadow-warm transition-all flex items-center justify-center gap-2 active:scale-[0.99] disabled:opacity-60"
        >
          {isClustering ? (
            <>
              <div className="w-4 h-4 border-2 border-cream-50 border-t-transparent rounded-full animate-spin" />
              <span>Synthesizing Density Basins...</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-current" />
              <span>Run DBSCAN Clustering</span>
            </>
          )}
        </button>
      </div>

      {/* Clustering Results Summary */}
      <div className="mt-4">
        <div className="flex items-center justify-between text-xs mb-2">
          <span className="font-semibold text-sandstone-900">Identified Catchment Zones</span>
          <span className="text-[11px] text-sandstone-600">
            {clusters.length} active zones • {noisePointsCount} noise points
          </span>
        </div>

        {clusters.length === 0 ? (
          <div className="p-3 text-center rounded-xl bg-cream-100 border border-cream-200 text-sandstone-600 text-xs">
            Click <strong>&quot;Run DBSCAN Clustering&quot;</strong> to synthesize catchment zones.
          </div>
        ) : (
          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {clusters.map((cluster) => {
              const isSelected = selectedClusterId === cluster.id;
              return (
                <div
                  key={cluster.id}
                  onClick={() => setSelectedClusterId(isSelected ? null : cluster.id)}
                  className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-cream-100 border-terracotta-500 shadow-warm ring-1 ring-terracotta-400'
                      : 'bg-white border-cream-200 hover:border-cream-300 hover:bg-cream-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-3.5 h-3.5 rounded-full flex-shrink-0 shadow-sm"
                        style={{ backgroundColor: cluster.color }}
                      />
                      <span className="font-medium text-sandstone-900 truncate">
                        {cluster.name}
                      </span>
                    </div>
                    <span className="text-[11px] font-semibold text-terracotta-700 bg-cream-100 px-2 py-0.5 rounded-full">
                      {cluster.pointCount} anchors
                    </span>
                  </div>

                  <div className="mt-1.5 flex items-center justify-between text-[11px] text-sandstone-600">
                    <span>Avg Traffic: <strong className="text-sandstone-800">{formatTraffic(cluster.avgTraffic)}</strong></span>
                    <span>Density: <strong className="text-sandstone-800">{formatDensity(cluster.avgDensity)}</strong></span>
                  </div>
                </div>
              );
            })}

            {noisePointsCount > 0 && (
              <div className="p-2 rounded-lg bg-gray-50 border border-gray-200 text-[11px] text-gray-700 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-gray-400" />
                  <span>Noise / Isolated Points (Outside Density Threshold)</span>
                </span>
                <span className="font-semibold">{noisePointsCount} points</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

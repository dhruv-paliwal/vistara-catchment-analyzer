'use client';

import React from 'react';
import { Flame, Eye, EyeOff, Sparkles, Sliders } from 'lucide-react';

interface HeatmapControlProps {
  showHeatmap: boolean;
  setShowHeatmap: (val: boolean) => void;
  heatmapMetric: 'traffic' | 'density' | 'points';
  setHeatmapMetric: (val: 'traffic' | 'density' | 'points') => void;
}

export function HeatmapControl({
  showHeatmap,
  setShowHeatmap,
  heatmapMetric,
  setHeatmapMetric,
}: HeatmapControlProps) {
  return (
    <div className="bg-[#FFFDF9]/95 backdrop-blur-md rounded-xl border border-cream-300 shadow-warm p-2.5 sm:px-4 sm:py-3 flex flex-wrap items-center justify-between gap-3">
      
      {/* Primary Toggle Switch */}
      <div className="flex items-center space-x-3">
        <label className="relative inline-flex items-center cursor-pointer select-none">
          <input
            type="checkbox"
            checked={showHeatmap}
            onChange={(e) => setShowHeatmap(e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-cream-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-saffron-500 peer-checked:to-terracotta-600 shadow-inner"></div>
        </label>

        <div className="flex items-center gap-1.5">
          <div className={`p-1 rounded-md ${showHeatmap ? 'bg-terracotta-100 text-terracotta-600' : 'bg-cream-200 text-sandstone-500'}`}>
            <Flame className="w-4 h-4" />
          </div>
          <div>
            <span className="font-serif font-bold text-sandstone-900 text-xs sm:text-sm">
              View Density Heatmap
            </span>
            <span className="hidden sm:inline-block text-[11px] text-sandstone-500 ml-2">
              {showHeatmap ? 'Thermal commercial density active' : 'Showing discrete pin points'}
            </span>
          </div>
        </div>
      </div>

      {/* Metric Weight Selector & Gradient Legend */}
      <div className="flex items-center space-x-3 text-xs">
        {showHeatmap && (
          <div className="flex items-center space-x-1.5 bg-cream-100 p-1 rounded-lg border border-cream-200">
            <span className="text-[10px] text-sandstone-500 px-1 font-medium">Weight:</span>
            <button
              onClick={() => setHeatmapMetric('traffic')}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                heatmapMetric === 'traffic'
                  ? 'bg-terracotta-600 text-white shadow-sm'
                  : 'text-sandstone-700 hover:text-sandstone-900'
              }`}
            >
              Traffic Flow
            </button>
            <button
              onClick={() => setHeatmapMetric('density')}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                heatmapMetric === 'density'
                  ? 'bg-terracotta-600 text-white shadow-sm'
                  : 'text-sandstone-700 hover:text-sandstone-900'
              }`}
            >
              Population
            </button>
          </div>
        )}

        {/* Heritage Thermal Palette Legend */}
        <div className="hidden md:flex items-center space-x-1.5 pl-2 border-l border-cream-200 text-[10px] text-sandstone-500">
          <span>Low</span>
          <div className="w-20 h-2.5 rounded-full bg-gradient-to-r from-turmeric-200 via-turmeric-400 via-saffron-500 to-terracotta-700 shadow-inner" />
          <span>Intense</span>
        </div>
      </div>
    </div>
  );
}

'use client';

import React from 'react';
import { Target, MapPin, Calculator, Sparkles, Building2, MousePointer } from 'lucide-react';

interface ViabilityTestFormProps {
  proposedLat: number;
  setProposedLat: (val: number) => void;
  proposedLng: number;
  setProposedLng: (val: number) => void;
  propertySqFt: number;
  setPropertySqFt: (val: number) => void;
  isPinDropMode: boolean;
  setIsPinDropMode: (val: boolean) => void;
  onRunSimulation: () => void;
  isSimulating: boolean;
}

const PRESET_LOCATIONS = [
  { name: 'Koramangala 80ft Hub', lat: 12.9348, lng: 77.6255 },
  { name: 'Indiranagar 100ft Strip', lat: 12.9712, lng: 77.6408 },
  { name: 'Whitefield Main Corridor', lat: 12.9750, lng: 77.7420 },
  { name: 'Silk Board Transit Edge', lat: 12.9210, lng: 77.6280 },
  { name: 'Fringe / Outlier Location', lat: 13.0850, lng: 77.6500 },
];

export function ViabilityTestForm({
  proposedLat,
  setProposedLat,
  proposedLng,
  setProposedLng,
  propertySqFt,
  setPropertySqFt,
  isPinDropMode,
  setIsPinDropMode,
  onRunSimulation,
  isSimulating,
}: ViabilityTestFormProps) {
  return (
    <div className="bg-[#FFFDF9] rounded-2xl border border-cream-300 shadow-warm p-4 sm:p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-saffron-100 text-saffron-700">
            <Target className="w-4 h-4" />
          </div>
          <h2 className="font-serif font-bold text-sandstone-900 text-base">
            Test Candidate Retail Location
          </h2>
        </div>
        <span className="text-xs text-sandstone-600 bg-cream-100 px-2 py-0.5 rounded-md border border-cream-200">
          Random Forest Simulator
        </span>
      </div>

      <p className="text-xs text-sandstone-600 mb-4">
        Evaluate a candidate retail site for an <strong>1,800 sq ft commercial storefront</strong>. Drop a pin on the interactive map or enter exact GPS coordinates below.
      </p>

      {/* Map Pin Drop Helper Toggle */}
      <div className="mb-4">
        <button
          type="button"
          onClick={() => setIsPinDropMode(!isPinDropMode)}
          className={`w-full py-2.5 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-xs ${
            isPinDropMode
              ? 'bg-gradient-to-r from-turmeric-500 via-saffron-500 to-terracotta-600 text-white border-transparent shadow-warm ring-2 ring-saffron-400 animate-pulse'
              : 'bg-cream-100 text-sandstone-800 border-cream-300 hover:bg-cream-200'
          }`}
        >
          <MousePointer className="w-3.5 h-3.5" />
          <span>
            {isPinDropMode ? '📍 Click Anywhere on Map to Place Pin (Active)' : 'Enable "Click on Map to Drop Pin"'}
          </span>
        </button>
        {isPinDropMode && (
          <p className="text-[11px] text-terracotta-700 font-medium text-center mt-1.5 animate-fade-in">
            🎯 Mode Active: Click any point, polygon, or landmark on the map to place candidate site.
          </p>
        )}
      </div>

      {/* Coordinates Form Grid */}
      <div className="space-y-3 p-3.5 bg-cream-50/80 rounded-xl border border-cream-200">
        <div className="grid grid-cols-2 gap-2.5">
          <div>
            <label className="block text-[11px] font-semibold text-sandstone-800 mb-1">
              Proposed Latitude (°N)
            </label>
            <input
              type="number"
              step="0.0001"
              value={proposedLat || ''}
              onChange={(e) => setProposedLat(parseFloat(e.target.value))}
              placeholder="e.g. 12.9352"
              className="w-full px-3 py-1.5 text-xs font-mono rounded-lg border border-cream-300 bg-white text-sandstone-900 focus:outline-none focus:ring-1 focus:ring-terracotta-500 shadow-sm"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-sandstone-800 mb-1">
              Proposed Longitude (°E)
            </label>
            <input
              type="number"
              step="0.0001"
              value={proposedLng || ''}
              onChange={(e) => setProposedLng(parseFloat(e.target.value))}
              placeholder="e.g. 77.6245"
              className="w-full px-3 py-1.5 text-xs font-mono rounded-lg border border-cream-300 bg-white text-sandstone-900 focus:outline-none focus:ring-1 focus:ring-terracotta-500 shadow-sm"
            />
          </div>
        </div>

        {/* Property Size - Defaults to 1,800 sq ft as required */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-1.5 text-xs text-sandstone-800">
            <Building2 className="w-3.5 h-3.5 text-terracotta-600" />
            <span className="font-medium">Property Commercial Area:</span>
          </div>
          <div className="flex items-center gap-1">
            <input
              type="number"
              min="500"
              max="20000"
              step="100"
              value={propertySqFt}
              onChange={(e) => setPropertySqFt(parseInt(e.target.value, 10) || 1800)}
              className="w-20 px-2 py-1 text-xs font-semibold text-right rounded-lg border border-cream-300 bg-white text-sandstone-900 focus:outline-none focus:ring-1 focus:ring-terracotta-500 shadow-sm"
            />
            <span className="text-xs text-sandstone-600 font-medium">sq ft</span>
          </div>
        </div>

        {/* Quick presets */}
        <div>
          <span className="block text-[10px] text-sandstone-600 uppercase font-semibold mb-1 tracking-wider">
            Quick-Fill Benchmark Sites:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {PRESET_LOCATIONS.map((preset) => (
              <button
                key={preset.name}
                type="button"
                onClick={() => {
                  setProposedLat(preset.lat);
                  setProposedLng(preset.lng);
                }}
                className="px-2 py-1 text-[11px] rounded-md bg-white border border-cream-200 text-sandstone-700 hover:text-terracotta-700 hover:border-terracotta-300 transition-colors shadow-2xs"
              >
                {preset.name}
              </button>
            ))}
          </div>
        </div>

        {/* Run Prediction Button */}
        <button
          type="button"
          onClick={onRunSimulation}
          disabled={isSimulating || !proposedLat || !proposedLng}
          className="w-full mt-2 py-2.5 px-4 rounded-xl font-medium text-xs sm:text-sm text-cream-50 bg-gradient-to-r from-saffron-600 via-terracotta-600 to-terracotta-700 hover:from-saffron-700 hover:to-terracotta-800 shadow-warm transition-all flex items-center justify-center gap-2 active:scale-[0.99] disabled:opacity-50"
        >
          {isSimulating ? (
            <>
              <div className="w-4 h-4 border-2 border-cream-50 border-t-transparent rounded-full animate-spin" />
              <span>Simulating Ensemble Revenue...</span>
            </>
          ) : (
            <>
              <Calculator className="w-4 h-4" />
              <span>Run Random Forest Viability Simulation</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

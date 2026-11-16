'use client';

import React from 'react';
import { Navigation, Route, Compass, Info } from 'lucide-react';
import { formatDistance, formatIndianNumber } from '@/lib/formatters';
import { CatchmentPoint } from '@/lib/types';
import { calculateAverageDistanceToHighway } from '@/lib/spatialUtils';

interface HighwayMetricCardProps {
  points: CatchmentPoint[];
}

export function HighwayMetricCard({ points }: HighwayMetricCardProps) {
  const avgDistanceKm = calculateAverageDistanceToHighway(points);
  const highwayPoints = points.filter((p) => p.type === 'Highway Intersection');
  const highwayCount = highwayPoints.length;

  // Calculate accessibility category
  let accessibilityTier = 'Moderate Arterial Connectivity';
  let badgeColor = 'bg-turmeric-100 text-turmeric-800 border-turmeric-300';
  if (avgDistanceKm <= 1.5) {
    accessibilityTier = 'Hyper-Connected Arterial Grid';
    badgeColor = 'bg-emerald-100 text-emerald-800 border-emerald-300';
  } else if (avgDistanceKm > 3.5) {
    accessibilityTier = 'Dispersed Radial Feeder Network';
    badgeColor = 'bg-terracotta-100 text-terracotta-800 border-terracotta-300';
  }

  return (
    <div className="bg-[#FFFDF9] rounded-2xl border border-cream-300 shadow-warm p-4 sm:p-5 relative overflow-hidden">
      {/* Decorative Warm Geometric Header */}
      <div className="absolute top-0 right-0 w-28 h-28 bg-gradient-to-bl from-saffron-200/40 via-turmeric-100/20 to-transparent rounded-bl-full pointer-events-none" />

      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-saffron-100 text-saffron-700">
            <Route className="w-4 h-4" />
          </div>
          <h3 className="font-serif font-bold text-sandstone-900 text-sm">
            Highway Proximity Benchmark
          </h3>
        </div>
        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${badgeColor}`}>
          Arterial Density
        </span>
      </div>

      <p className="text-[11px] text-sandstone-600 mb-3">
        Dataset average spatial distance from commercial catchment nodes to primary highway interchanges.
      </p>

      {/* Main Metric Highlight */}
      <div className="p-3.5 rounded-xl bg-gradient-to-br from-cream-100 to-cream-50 border border-cream-200 flex items-center justify-between">
        <div>
          <span className="text-[11px] font-medium text-sandstone-700 uppercase tracking-wider block">
            Avg Distance to Highway
          </span>
          <div className="flex items-baseline gap-2 mt-0.5">
            <span className="text-2xl sm:text-3xl font-serif font-bold text-terracotta-600">
              {formatDistance(avgDistanceKm)}
            </span>
            <span className="text-xs text-sandstone-600">
              ({avgDistanceKm.toFixed(2)} km radius)
            </span>
          </div>
        </div>

        <div className="p-2.5 rounded-full bg-turmeric-100 text-turmeric-700 shadow-sm">
          <Navigation className="w-5 h-5" />
        </div>
      </div>

      {/* Supporting Data Grid */}
      <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
        <div className="p-2.5 rounded-lg bg-cream-50 border border-cream-200">
          <span className="text-[11px] text-sandstone-600 block">Highway Anchors</span>
          <span className="font-semibold text-sandstone-900 text-sm">
            {highwayCount} Intersections
          </span>
          <span className="text-[10px] text-sandstone-500 block truncate">
            {highwayPoints.slice(0, 2).map((h) => h.name.split(' ')[0]).join(', ')}...
          </span>
        </div>

        <div className="p-2.5 rounded-lg bg-cream-50 border border-cream-200">
          <span className="text-[11px] text-sandstone-600 block">Arterial Rating</span>
          <span className="font-semibold text-saffron-700 text-xs block truncate mt-0.5" title={accessibilityTier}>
            {accessibilityTier}
          </span>
          <span className="text-[10px] text-sandstone-500 block">
            Bengaluru ORR/Radial
          </span>
        </div>
      </div>
    </div>
  );
}

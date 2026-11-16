'use client';

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  CartesianGrid,
} from 'recharts';
import { BarChart3, TrendingUp, Info, CheckCircle2 } from 'lucide-react';
import { FeatureImportance } from '@/lib/types';

interface FeatureImportanceChartProps {
  data: FeatureImportance[];
  propertySqFt: number;
}

const BAR_COLORS = [
  '#C85A32', // Terracotta
  '#E67E22', // Saffron
  '#E5A93C', // Turmeric
  '#A16118', // Deep Amber
  '#795548', // Sandstone
];

export function FeatureImportanceChart({ data, propertySqFt }: FeatureImportanceChartProps) {
  if (!data || data.length === 0) {
    return null;
  }

  // Determine comparison between Highway Proximity and Population Density
  const highwayFeature = data.find((d) => d.feature.includes('highway'));
  const densityFeature = data.find((d) => d.feature.includes('density') || d.feature.includes('population'));

  let comparisonNarrative = '';
  if (highwayFeature && densityFeature) {
    if (highwayFeature.importance > densityFeature.importance) {
      comparisonNarrative = `Highway Proximity (${highwayFeature.importance}%) outweighed Local Population Density (${densityFeature.importance}%), confirming that arterial vehicular access is the primary revenue driver for this specific location.`;
    } else if (densityFeature.importance > highwayFeature.importance) {
      comparisonNarrative = `Local Population Density (${densityFeature.importance}%) outweighed Highway Proximity (${highwayFeature.importance}%), demonstrating that residential neighborhood footfall is the dominant revenue catalyst here.`;
    } else {
      comparisonNarrative = `Highway Proximity and Population Density contributed equally (${highwayFeature.importance}% each) to the revenue viability model.`;
    }
  }

  // Custom Tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload as FeatureImportance;
      return (
        <div className="bg-[#FFFDF9] p-3 rounded-xl border border-cream-300 shadow-warm text-xs max-w-xs">
          <p className="font-serif font-bold text-sandstone-900">{item.label}</p>
          <p className="text-terracotta-600 font-semibold mt-0.5">
            Importance Weight: {item.importance}%
          </p>
          <p className="text-sandstone-600 mt-1">
            <strong>Site Metric:</strong> {item.valueFormatted}
          </p>
          <p className="text-sandstone-500 text-[11px] mt-1 italic">
            {item.description}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-[#FFFDF9] rounded-2xl border border-cream-300 shadow-warm p-4 sm:p-5">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-terracotta-100 text-terracotta-700">
            <BarChart3 className="w-4 h-4" />
          </div>
          <h3 className="font-serif font-bold text-sandstone-900 text-sm sm:text-base">
            Random Forest: Feature Importance Weights
          </h3>
        </div>
        <span className="text-[11px] font-semibold text-terracotta-700 bg-cream-100 px-2 py-0.5 rounded-md border border-cream-200">
          Recharts Ensemble Analysis
        </span>
      </div>

      <p className="text-xs text-sandstone-600 mb-3">
        Gini impurity and permutation sensitivity proving the exact driving forces behind the ₹ revenue model.
      </p>

      {/* Narrative Proof Banner */}
      {comparisonNarrative && (
        <div className="p-3 mb-4 rounded-xl bg-gradient-to-r from-cream-100 via-turmeric-50 to-saffron-50 border border-saffron-200 text-xs text-sandstone-800 flex items-start gap-2.5">
          <div className="p-1 rounded-full bg-saffron-500 text-white flex-shrink-0 mt-0.5">
            <TrendingUp className="w-3.5 h-3.5" />
          </div>
          <div>
            <strong className="text-sandstone-900 font-semibold block mb-0.5">
              Empirical Model Insight:
            </strong>
            <span>{comparisonNarrative}</span>
          </div>
        </div>
      )}

      {/* Recharts Bar Graph */}
      <div className="w-full h-56 sm:h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#EBDCCE" />
            <XAxis
              type="number"
              domain={[0, 50]}
              unit="%"
              stroke="#6E3F1A"
              fontSize={11}
              tickLine={false}
            />
            <YAxis
              dataKey="label"
              type="category"
              width={140}
              stroke="#6E3F1A"
              fontSize={11}
              tickLine={false}
              tick={{ fill: '#3D2F27', fontWeight: 500 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="importance" radius={[0, 6, 6, 0]} barSize={18}>
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={BAR_COLORS[index % BAR_COLORS.length]}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Feature Value Badges */}
      <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 pt-3 border-t border-cream-200 text-xs">
        {data.slice(0, 4).map((f, i) => (
          <div key={f.feature} className="flex items-center justify-between p-2 rounded-lg bg-cream-50 border border-cream-200">
            <span className="text-sandstone-700 truncate pr-2">{f.label}</span>
            <span className="font-semibold text-terracotta-700 flex-shrink-0 font-mono">
              {f.importance}% weight
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

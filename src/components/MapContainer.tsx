'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { CatchmentPoint, CatchmentCluster } from '@/lib/types';
import { Compass } from 'lucide-react';

const LeafletMap = dynamic(() => import('./LeafletMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[440px] lg:min-h-[580px] rounded-2xl bg-cream-100 flex flex-col items-center justify-center text-sandstone-600 gap-3 border border-cream-300">
      <div className="w-10 h-10 border-4 border-terracotta-500 border-t-transparent rounded-full animate-spin" />
      <span className="font-serif font-medium text-sm text-sandstone-800">
        Rendering Bengaluru Geospatial Canvas...
      </span>
    </div>
  ),
});

interface MapContainerProps {
  points: CatchmentPoint[];
  clusters: CatchmentCluster[];
  showHeatmap: boolean;
  heatmapMetric: 'traffic' | 'density' | 'points';
  proposedLat: number;
  proposedLng: number;
  isPinDropMode: boolean;
  setIsPinDropMode?: (val: boolean) => void;
  onMapClick: (lat: number, lng: number) => void;
  selectedClusterId: number | null;
}

export function MapContainer(props: MapContainerProps) {
  return <LeafletMap {...props} />;
}

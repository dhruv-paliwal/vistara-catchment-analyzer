'use client';

import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { CatchmentPoint, CatchmentCluster, LocationType } from '@/lib/types';
import { formatTraffic, formatDensity } from '@/lib/formatters';

interface LeafletMapProps {
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

// Custom Leaflet DivIcon Generators for warm Indian aesthetic pins
const createCustomPin = (
  type: LocationType,
  clusterColor?: string,
  isNoise?: boolean
) => {
  let bgColor = '#E67E22'; // Saffron
  let borderColor = '#FFFDF9';
  let iconSvg = '';

  if (isNoise) {
    bgColor = '#9E9E9E'; // Gray for noise
    borderColor = '#E0E0E0';
  } else if (clusterColor) {
    bgColor = clusterColor;
  } else {
    if (type === 'Retail Hub') bgColor = '#C85A32'; // Terracotta
    else if (type === 'Competitor') bgColor = '#E5A93C'; // Turmeric
    else if (type === 'Highway Intersection') bgColor = '#3D2F27'; // Sandstone
  }

  if (type === 'Highway Intersection') {
    // Highway cloverleaf icon
    iconSvg = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>`;
  } else if (type === 'Competitor') {
    // Storefront icon
    iconSvg = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`;
  } else {
    // Retail Shopping bag icon
    iconSvg = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>`;
  }

  const opacityClass = isNoise ? 'opacity-50' : 'opacity-100';

  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: `
      <div class="relative flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-transform duration-200 hover:scale-125 ${opacityClass}">
        <div style="background-color: ${bgColor}; border: 2px solid ${borderColor}; box-shadow: 0 4px 10px rgba(184, 74, 36, 0.35);" 
             class="w-7 h-7 rounded-full flex items-center justify-center text-white ring-2 ring-cream-100/60">
          ${iconSvg}
        </div>
        <div style="border-top-color: ${bgColor};" class="absolute -bottom-1.5 w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[6px]"></div>
      </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 28],
    popupAnchor: [0, -28],
  });
};

const createProposedPin = () => {
  return L.divIcon({
    className: 'proposed-leaflet-marker',
    html: `
      <div class="relative flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2 cursor-pointer">
        <span class="animate-ping absolute inline-flex h-10 w-10 rounded-full bg-saffron-400 opacity-75"></span>
        <div class="relative w-9 h-9 rounded-full bg-gradient-to-br from-saffron-500 to-terracotta-600 border-2 border-white shadow-warm-xl flex items-center justify-center text-white">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
          </svg>
        </div>
        <div class="absolute -top-7 px-2 py-0.5 rounded bg-sandstone-900 text-cream-50 text-[10px] font-bold tracking-tight shadow-md whitespace-nowrap">
          Candidate 1,800 sq ft
        </div>
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -36],
  });
};

export default function LeafletMap({
  points,
  clusters,
  showHeatmap,
  heatmapMetric,
  proposedLat,
  proposedLng,
  isPinDropMode,
  setIsPinDropMode,
  onMapClick,
  selectedClusterId,
}: LeafletMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const polygonsLayerRef = useRef<L.LayerGroup | null>(null);
  const heatmapLayerRef = useRef<L.LayerGroup | null>(null);
  const proposedMarkerRef = useRef<L.Marker | null>(null);

  // Storing refs for callbacks and pin drop state to eliminate stale closures
  const onMapClickRef = useRef(onMapClick);
  onMapClickRef.current = onMapClick;

  const isPinDropModeRef = useRef(isPinDropMode);
  isPinDropModeRef.current = isPinDropMode;

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Center on Bengaluru Central (MG Road / Vidhana Soudha)
    const map = L.map(mapContainerRef.current, {
      center: [12.9716, 77.5946],
      zoom: 12,
      zoomControl: false,
    });

    // OpenStreetMap standard public tiles (100% free, zero API key required)
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    // Zoom control at bottom right
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Click handler for pin dropping on map canvas
    map.on('click', (e: L.LeafletMouseEvent) => {
      onMapClickRef.current(e.latlng.lat, e.latlng.lng);
    });

    markersLayerRef.current = L.layerGroup().addTo(map);
    polygonsLayerRef.current = L.layerGroup().addTo(map);
    heatmapLayerRef.current = L.layerGroup().addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update container CSS classes for pin drop mode crosshair cursor
  useEffect(() => {
    const container = mapContainerRef.current;
    if (!container) return;

    if (isPinDropMode) {
      container.classList.add('pin-drop-active');
    } else {
      container.classList.remove('pin-drop-active');
    }
  }, [isPinDropMode]);

  // Update Proposed Location Marker & smoothly pan
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !proposedLat || !proposedLng) return;

    if (proposedMarkerRef.current) {
      proposedMarkerRef.current.setLatLng([proposedLat, proposedLng]);
    } else {
      const marker = L.marker([proposedLat, proposedLng], {
        icon: createProposedPin(),
        draggable: true,
      }).addTo(map);

      marker.bindTooltip('Candidate Site (1,800 sq ft) — Drag to reposition', {
        direction: 'top',
        className: 'leaflet-custom-tooltip',
      });

      marker.on('dragend', (e) => {
        const pos = e.target.getLatLng();
        onMapClickRef.current(pos.lat, pos.lng);
      });

      proposedMarkerRef.current = marker;
    }

    // Pan smoothly if the candidate pin is outside current map view
    if (!map.getBounds().contains([proposedLat, proposedLng])) {
      map.panTo([proposedLat, proposedLng], { animate: true });
    }
  }, [proposedLat, proposedLng]);

  // Render Clustered Catchment Polygons
  useEffect(() => {
    const layer = polygonsLayerRef.current;
    if (!layer) return;
    layer.clearLayers();

    clusters.forEach((cluster) => {
      if (cluster.hullPolygon && cluster.hullPolygon.length >= 3) {
        const isSelected = selectedClusterId === cluster.id;
        const poly = L.polygon(cluster.hullPolygon as L.LatLngExpression[], {
          color: cluster.color,
          weight: isSelected ? 3.5 : 2,
          opacity: 0.85,
          fillColor: cluster.color,
          fillOpacity: isSelected ? 0.28 : 0.14,
          dashArray: isSelected ? undefined : '5, 5',
          bubblingMouseEvents: true,
        });

        // Hover tooltip
        poly.bindTooltip(
          `<strong>${cluster.name}</strong><br/>Density: ${cluster.pointCount} Anchors`,
          { sticky: true, className: 'leaflet-custom-tooltip' }
        );

        // Click interaction: clicking anywhere on the catchment polygon drops candidate pin
        poly.on('click', (e: L.LeafletMouseEvent) => {
          onMapClickRef.current(e.latlng.lat, e.latlng.lng);
        });

        poly.addTo(layer);
      }
    });
  }, [clusters, selectedClusterId]);

  // Render Density Heatmap Layer (with interactive: false so clicks pass through)
  useEffect(() => {
    const layer = heatmapLayerRef.current;
    if (!layer) return;
    layer.clearLayers();

    if (!showHeatmap || points.length === 0) return;

    // Synthesize thermal radial gradient circles to emulate high-performance thermal density
    const maxTraffic = Math.max(...points.map((p) => p.dailyTraffic), 150000);
    const maxDensity = Math.max(...points.map((p) => p.populationDensity), 25000);

    points.forEach((p) => {
      let weight = 0.5;
      if (heatmapMetric === 'traffic') {
        weight = Math.min(1.0, Math.max(0.25, p.dailyTraffic / maxTraffic));
      } else if (heatmapMetric === 'density') {
        weight = Math.min(1.0, Math.max(0.25, p.populationDensity / maxDensity));
      }

      // Multi-ring thermal congregation kernel
      const outerRadius = 1400 * weight;
      const innerRadius = 600 * weight;

      // Outer warm halo (Turmeric / Amber) - non interactive
      L.circle([p.lat, p.lng], {
        radius: outerRadius,
        stroke: false,
        fillColor: '#E5A93C', // Turmeric
        fillOpacity: 0.12 * weight,
        interactive: false, // Ensures map clicks pass through without being intercepted
      }).addTo(layer);

      // Mid Saffron ring - non interactive
      L.circle([p.lat, p.lng], {
        radius: innerRadius,
        stroke: false,
        fillColor: '#E67E22', // Saffron
        fillOpacity: 0.22 * weight,
        interactive: false,
      }).addTo(layer);

      // Core Terracotta focal point - non interactive
      L.circle([p.lat, p.lng], {
        radius: innerRadius * 0.45,
        stroke: false,
        fillColor: '#C85A32', // Terracotta
        fillOpacity: 0.38 * weight,
        interactive: false,
      }).addTo(layer);
    });
  }, [showHeatmap, heatmapMetric, points]);

  // Render Point Markers (Pins)
  useEffect(() => {
    const layer = markersLayerRef.current;
    if (!layer) return;
    layer.clearLayers();

    // Map points to clusters
    const clusterColorMap = new Map<number, string>();
    clusters.forEach((c) => clusterColorMap.set(c.id, c.color));

    points.forEach((p) => {
      const isNoise = p.clusterId === -1;
      const clusterColor = p.clusterId && p.clusterId > 0 ? clusterColorMap.get(p.clusterId) : undefined;

      const marker = L.marker([p.lat, p.lng], {
        icon: createCustomPin(p.type, clusterColor, isNoise),
      });

      // Interactive popup with location details on click
      const popupContent = `
        <div style="font-family: inherit; min-width: 200px;" class="p-1">
          <div class="flex items-center justify-between gap-2 border-b border-[#EBDCCE] pb-1.5 mb-1.5">
            <span class="font-serif font-bold text-[#2A1F19] text-xs">${p.name}</span>
            <span class="text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
              p.type === 'Retail Hub'
                ? 'bg-[#FDF4F0] text-[#C85A32] border border-[#F0AD98]'
                : p.type === 'Competitor'
                ? 'bg-[#FFF8EB] text-[#E67E22] border border-[#FEDB8B]'
                : 'bg-[#FAF6ED] text-[#3D2F27] border border-[#DFCAB4]'
            }">${p.type}</span>
          </div>

          <div class="space-y-1 text-[11px] text-[#544237]">
            <div class="flex justify-between">
              <span>Daily Traffic:</span>
              <strong class="text-[#2A1F19]">${formatTraffic(p.dailyTraffic)}</strong>
            </div>
            <div class="flex justify-between">
              <span>Pop. Density:</span>
              <strong class="text-[#2A1F19]">${formatDensity(p.populationDensity)}</strong>
            </div>
            ${
              p.clusterId && p.clusterId > 0
                ? `<div class="flex justify-between text-[#C85A32] font-semibold pt-0.5 border-t border-[#F5ECE0]">
                     <span>Catchment:</span>
                     <span>Zone #${p.clusterId}</span>
                   </div>`
                : isNoise
                ? `<div class="text-gray-500 italic text-[10px] pt-0.5">Isolated Point (Noise)</div>`
                : ''
            }
          </div>
          <div class="text-[9px] text-[#8C3F16] font-mono mt-1 pt-1 border-t border-[#F5ECE0]">
            GPS: ${p.lat.toFixed(4)}°N, ${p.lng.toFixed(4)}°E
          </div>
        </div>
      `;

      marker.bindPopup(popupContent, {
        className: 'leaflet-warm-popup',
      });

      // Hover tooltip for quick preview
      marker.bindTooltip(`<strong>${p.name}</strong><br/>${p.type}`, {
        direction: 'top',
        className: 'leaflet-custom-tooltip',
      });

      // When in Pin Drop Mode, clicking any marker drops candidate pin directly at that landmark
      marker.on('click', (e: L.LeafletMouseEvent) => {
        if (isPinDropModeRef.current) {
          L.DomEvent.stopPropagation(e);
          marker.closePopup();
          onMapClickRef.current(p.lat, p.lng);
        }
      });

      marker.addTo(layer);
    });
  }, [points, clusters]);

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden border border-cream-300 shadow-warm">
      <div ref={mapContainerRef} className="w-full h-full min-h-[440px] lg:min-h-[580px] z-0" />

      {/* Floating Active Pin Drop Mode Notification Banner */}
      {isPinDropMode && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[400] bg-gradient-to-r from-turmeric-500 via-saffron-500 to-terracotta-600 text-white px-4 py-2.5 rounded-xl shadow-warm-xl flex items-center gap-3 border-2 border-white/70 pointer-events-auto transition-all animate-fade-in">
          <div className="flex items-center gap-2 text-xs font-semibold tracking-wide">
            <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping" />
            <span>📍 Pin Drop Mode: Click anywhere on the map to set location</span>
          </div>
          {setIsPinDropMode && (
            <button
              type="button"
              onClick={() => setIsPinDropMode(false)}
              className="px-2.5 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded-lg bg-white/20 hover:bg-white/30 text-white transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      )}

      {/* Map Legend (Bottom Left) */}
      <div className="absolute bottom-4 left-4 z-[400] bg-[#FFFDF9]/95 backdrop-blur-md p-3 rounded-xl border border-cream-300 shadow-warm text-xs text-sandstone-800 pointer-events-auto max-w-xs">
        <span className="font-serif font-bold text-sandstone-900 block mb-1.5 text-[11px]">
          Spatial Legend
        </span>
        <div className="space-y-1 text-[11px]">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-terracotta-500 border border-white shadow-xs" />
            <span>Retail Hub (Mall / High Street)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-turmeric-500 border border-white shadow-xs" />
            <span>Commercial Competitor</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-sandstone-800 border border-white shadow-xs" />
            <span>Highway Intersection (Arterial Node)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-gradient-to-r from-saffron-500 to-terracotta-600 animate-pulse border border-white" />
            <span className="font-semibold text-terracotta-700">Candidate Site (1,800 sq ft)</span>
          </div>
        </div>
      </div>
    </div>
  );
}

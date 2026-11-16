'use client';

import React, { useRef, useState } from 'react';
import Papa from 'papaparse';
import { UploadCloud, FileSpreadsheet, Check, AlertCircle, FileText, Database, Layers } from 'lucide-react';
import { CatchmentPoint, LocationType } from '@/lib/types';
import { formatIndianNumber } from '@/lib/formatters';

interface DataUploadPanelProps {
  onDataLoaded: (points: CatchmentPoint[], sourceFileName: string) => void;
  activeFileName: string;
  totalPoints: number;
}

export function DataUploadPanel({
  onDataLoaded,
  activeFileName,
  totalPoints,
}: DataUploadPanelProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<string | null>(null);

  const processCsvFile = (file: File) => {
    setErrorMessage(null);
    setSuccessInfo(null);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
      complete: (results) => {
        try {
          const rawData = results.data as any[];
          if (!rawData || rawData.length === 0) {
            setErrorMessage('CSV file appears to be empty.');
            return;
          }

          // Check required columns case-insensitively
          const sampleRow = rawData[0];
          const keys = Object.keys(sampleRow).map((k) => k.trim());
          
          const findKey = (candidates: string[]) =>
            keys.find((k) => candidates.some((c) => c.toLowerCase() === k.toLowerCase()));

          const latKey = findKey(['latitude', 'lat', 'lat_deg']);
          const lngKey = findKey(['longitude', 'lng', 'lon', 'long']);
          const typeKey = findKey(['location_type', 'type', 'category']);
          const trafficKey = findKey(['daily_traffic_volume', 'traffic', 'daily_traffic', 'traffic_volume']);
          const densityKey = findKey(['local_population_density', 'population_density', 'density', 'population']);
          const nameKey = findKey(['location_name', 'name', 'label', 'site_name', 'address']);

          if (!latKey || !lngKey) {
            setErrorMessage(
              'Missing required geospatial coordinates: "Latitude" and "Longitude" columns are mandatory.'
            );
            return;
          }

          const parsedPoints: CatchmentPoint[] = [];

          rawData.forEach((row, idx) => {
            const rawLat = parseFloat(row[latKey]);
            const rawLng = parseFloat(row[lngKey]);

            if (isNaN(rawLat) || isNaN(rawLng)) return;

            let locationType: LocationType = 'Retail Hub';
            if (typeKey && row[typeKey]) {
              const val = String(row[typeKey]).toLowerCase();
              if (val.includes('highway') || val.includes('intersection') || val.includes('junction')) {
                locationType = 'Highway Intersection';
              } else if (val.includes('comp') || val.includes('rival')) {
                locationType = 'Competitor';
              } else {
                locationType = 'Retail Hub';
              }
            }

            const dailyTraffic = trafficKey && !isNaN(Number(row[trafficKey]))
              ? Number(row[trafficKey])
              : 50000;

            const populationDensity = densityKey && !isNaN(Number(row[densityKey]))
              ? Number(row[densityKey])
              : 14000;

            const name = nameKey && row[nameKey]
              ? String(row[nameKey])
              : `Catchment Site #${idx + 1}`;

            parsedPoints.push({
              id: `csv-${Date.now()}-${idx}`,
              name,
              lat: rawLat,
              lng: rawLng,
              type: locationType,
              dailyTraffic,
              populationDensity,
            });
          });

          if (parsedPoints.length === 0) {
            setErrorMessage('No valid coordinate rows could be extracted from the uploaded CSV.');
            return;
          }

          setSuccessInfo(`Successfully ingested ${parsedPoints.length} commercial points from ${file.name}`);
          onDataLoaded(parsedPoints, file.name);
        } catch (err: any) {
          setErrorMessage(`Error parsing CSV: ${err.message}`);
        }
      },
      error: (err) => {
        setErrorMessage(`CSV read failure: ${err.message}`);
      },
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processCsvFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processCsvFile(e.target.files[0]);
    }
  };

  return (
    <div className="bg-[#FFFDF9] rounded-2xl border border-cream-300 shadow-warm p-4 sm:p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-terracotta-100 text-terracotta-700">
            <UploadCloud className="w-4 h-4" />
          </div>
          <h2 className="font-serif font-bold text-sandstone-900 text-base">
            Data Ingestion & Base Mapping
          </h2>
        </div>
        <span className="text-xs text-sandstone-600 bg-cream-100 px-2 py-0.5 rounded-md border border-cream-200">
          CSV File Reader
        </span>
      </div>

      {/* Upload Drag & Drop Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-xl p-4 sm:p-5 text-center cursor-pointer transition-all duration-200 ${
          isDragging
            ? 'border-terracotta-500 bg-terracotta-50/70 scale-[0.99]'
            : 'border-cream-300 bg-cream-50/60 hover:bg-cream-100/70 hover:border-saffron-400'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,text/csv"
          onChange={handleFileChange}
          className="hidden"
        />

        <div className="flex flex-col items-center justify-center space-y-2">
          <div className="p-2.5 rounded-full bg-cream-200 text-terracotta-600 shadow-sm">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs sm:text-sm font-medium text-sandstone-900">
              Drop your Catchment CSV here or <span className="text-terracotta-600 font-semibold underline underline-offset-2">Browse Files</span>
            </p>
            <p className="text-[11px] text-sandstone-700 mt-1">
              Supports columns: <code className="text-sandstone-900 bg-cream-200 px-1 py-0.5 rounded font-mono">Latitude</code>, <code className="text-sandstone-900 bg-cream-200 px-1 py-0.5 rounded font-mono">Longitude</code>, <code className="text-sandstone-900 bg-cream-200 px-1 py-0.5 rounded font-mono">Location_Type</code>, <code className="text-sandstone-900 bg-cream-200 px-1 py-0.5 rounded font-mono">Daily_Traffic_Volume</code>, <code className="text-sandstone-900 bg-cream-200 px-1 py-0.5 rounded font-mono">Local_Population_Density</code>
            </p>
          </div>
        </div>
      </div>

      {/* Active File State Banner */}
      <div className="mt-3 flex items-center justify-between text-xs px-3 py-2 rounded-lg bg-cream-100 border border-cream-200 text-sandstone-800">
        <div className="flex items-center gap-2 truncate">
          <Database className="w-3.5 h-3.5 text-saffron-600 flex-shrink-0" />
          <span className="truncate">Active Source: <strong className="text-sandstone-900 font-semibold">{activeFileName}</strong></span>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <span className="font-semibold text-terracotta-700">{formatIndianNumber(totalPoints)}</span> points plotted
        </div>
      </div>

      {/* Feedback alerts */}
      {errorMessage && (
        <div className="mt-2.5 flex items-start gap-2 p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      {successInfo && (
        <div className="mt-2.5 flex items-start gap-2 p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs">
          <Check className="w-4 h-4 flex-shrink-0 mt-0.5 text-emerald-600" />
          <span>{successInfo}</span>
        </div>
      )}
    </div>
  );
}

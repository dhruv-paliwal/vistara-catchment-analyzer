'use client';

import React, { useState } from 'react';
import { Download, RefreshCw, Sparkles, MapPin, Server, CheckCircle2, ChevronDown } from 'lucide-react';
import { MandalaIcon, JaliBorderPattern } from './IndianMotifs';

interface HeaderProps {
  pointCount: number;
  clusterCount: number;
  onResetToSample: () => void;
  onDownloadTemplate: () => void;
  apiEndpoint: string;
  setApiEndpoint: (url: string) => void;
  useBackendApi: boolean;
  setUseBackendApi: (use: boolean) => void;
}

export function Header({
  pointCount,
  clusterCount,
  onResetToSample,
  onDownloadTemplate,
  apiEndpoint,
  setApiEndpoint,
  useBackendApi,
  setUseBackendApi,
}: HeaderProps) {
  const [showSettings, setShowSettings] = useState(false);
  const [pingStatus, setPingStatus] = useState<'idle' | 'checking' | 'connected' | 'error'>('idle');

  const testApiConnection = async () => {
    setPingStatus('checking');
    try {
      const res = await fetch(`${apiEndpoint}/api/health`, { method: 'GET' });
      if (res.ok) {
        setPingStatus('connected');
      } else {
        setPingStatus('error');
      }
    } catch (e) {
      setPingStatus('error');
    }
  };

  return (
    <header className="relative bg-[#FFFDF9] border-b border-cream-300 shadow-warm">
      {/* Top Heritage Accent Bar */}
      <div className="h-1.5 w-full bg-gradient-to-r from-terracotta-600 via-saffron-500 to-turmeric-400" />
      <JaliBorderPattern className="h-2 w-full bg-cream-100/50" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          
          {/* Logo & Title Section */}
          <div className="flex items-center space-x-3.5">
            <div className="flex-shrink-0 p-2.5 rounded-xl bg-gradient-to-br from-terracotta-500 to-saffron-600 text-cream-50 shadow-warm-lg ring-2 ring-saffron-300/40">
              <MandalaIcon className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-serif font-bold text-sandstone-900 tracking-tight">
                  Vistāra <span className="text-terracotta-600 font-normal text-lg">| विस्तार</span>
                </h1>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-terracotta-50 text-terracotta-700 border border-terracotta-200">
                  Retail Catchment Intelligence
                </span>
              </div>
              <p className="text-xs text-sandstone-700 mt-0.5">
                Geospatial Catchment Analyzer & Revenue Prediction • <span className="font-medium text-saffron-700">Bengaluru Metropolitan Region</span>
              </p>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Live Count Pill */}
            <div className="flex items-center space-x-2 px-3 py-1.5 bg-cream-100/80 rounded-lg border border-cream-300 text-xs text-sandstone-800">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>
                <strong className="text-sandstone-900 font-semibold">{pointCount}</strong> Anchor Points
              </span>
              <span className="text-cream-400">|</span>
              <span>
                <strong className="text-terracotta-600 font-semibold">{clusterCount}</strong> Catchments
              </span>
            </div>

            {/* Currency Convention Pill */}
            <div className="hidden lg:flex items-center space-x-1.5 px-2.5 py-1.5 bg-turmeric-50/80 rounded-lg border border-turmeric-200 text-xs text-turmeric-800 font-medium">
              <span className="font-serif font-bold text-terracotta-600">₹</span>
              <span>Indian Rupee (Lakhs & Crores)</span>
            </div>

            {/* ML Research Study PDF Button */}
            <a
              href="/Geospatial_Retail_Catchment_ML_Study.pdf"
              target="_blank"
              rel="noopener noreferrer"
              download="Geospatial_Retail_Catchment_ML_Study.pdf"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-terracotta-50 text-terracotta-700 border border-terracotta-300 hover:bg-terracotta-100 hover:border-terracotta-400 transition-colors shadow-sm"
              title="Download the 11-page Machine Learning Technical Research Paper"
            >
              <Download className="w-3.5 h-3.5 text-terracotta-700" />
              <span>ML Study (PDF)</span>
            </a>

            {/* Template Download Button */}
            <button
              onClick={onDownloadTemplate}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-cream-50 text-sandstone-800 border border-cream-300 hover:bg-cream-100 hover:border-terracotta-300 transition-colors shadow-sm"
              title="Download mock CSV template for Bengaluru retail points"
            >
              <Download className="w-3.5 h-3.5 text-terracotta-600" />
              <span>Mock CSV</span>
            </button>

            {/* Reset to Sample Button */}
            <button
              onClick={onResetToSample}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-cream-50 text-sandstone-800 border border-cream-300 hover:bg-cream-100 hover:border-saffron-300 transition-colors shadow-sm"
              title="Reload the 36-point Bengaluru benchmark dataset"
            >
              <RefreshCw className="w-3.5 h-3.5 text-saffron-600" />
              <span>Bengaluru Data</span>
            </button>

            {/* Engine Selector Dropdown Button */}
            <div className="relative">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors shadow-sm ${
                  useBackendApi
                    ? 'bg-saffron-50 text-saffron-800 border border-saffron-300'
                    : 'bg-cream-100 text-sandstone-800 border border-cream-300 hover:bg-cream-200'
                }`}
              >
                <Server className="w-3.5 h-3.5 text-terracotta-600" />
                <span>{useBackendApi ? 'Python FastAPI' : 'In-Browser Engine'}</span>
                <ChevronDown className="w-3 h-3 opacity-60" />
              </button>

              {/* Settings Dropdown Popover */}
              {showSettings && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-warm-xl border border-cream-300 p-4 z-50">
                  <div className="flex items-center justify-between pb-2 border-b border-cream-200">
                    <span className="font-serif font-semibold text-sandstone-900 text-sm">ML Engine Execution</span>
                    <button
                      onClick={() => setShowSettings(false)}
                      className="text-sandstone-400 hover:text-sandstone-700 text-xs"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="mt-3 space-y-3">
                    <label className="flex items-start gap-2.5 cursor-pointer">
                      <input
                        type="radio"
                        name="engine"
                        checked={!useBackendApi}
                        onChange={() => setUseBackendApi(false)}
                        className="mt-0.5 text-terracotta-600 focus:ring-terracotta-500"
                      />
                      <div>
                        <div className="text-xs font-semibold text-sandstone-900">In-Browser Instant Engine</div>
                        <div className="text-[11px] text-sandstone-500">
                          Built-in Spherical DBSCAN & 20-tree Random Forest simulation. Zero setup required.
                        </div>
                      </div>
                    </label>

                    <label className="flex items-start gap-2.5 cursor-pointer">
                      <input
                        type="radio"
                        name="engine"
                        checked={useBackendApi}
                        onChange={() => setUseBackendApi(true)}
                        className="mt-0.5 text-terracotta-600 focus:ring-terracotta-500"
                      />
                      <div>
                        <div className="text-xs font-semibold text-sandstone-900">Python FastAPI / Colab Endpoint</div>
                        <div className="text-[11px] text-sandstone-500">
                          Connect to scikit-learn server running on localhost or via Google Colab ngrok tunnel.
                        </div>
                      </div>
                    </label>

                    {useBackendApi && (
                      <div className="pt-2 border-t border-cream-100 space-y-2">
                        <label className="block text-[11px] font-medium text-sandstone-700">API Server URL</label>
                        <input
                          type="text"
                          value={apiEndpoint}
                          onChange={(e) => setApiEndpoint(e.target.value)}
                          placeholder="http://localhost:8000"
                          className="w-full px-2.5 py-1 text-xs border border-cream-300 rounded-md bg-cream-50 focus:outline-none focus:ring-1 focus:ring-terracotta-500"
                        />
                        <div className="flex items-center justify-between pt-1">
                          <button
                            type="button"
                            onClick={testApiConnection}
                            className="px-2 py-1 text-[11px] font-medium rounded bg-cream-200 text-sandstone-800 hover:bg-cream-300"
                          >
                            {pingStatus === 'checking' ? 'Pinging...' : 'Test Connection'}
                          </button>
                          {pingStatus === 'connected' && (
                            <span className="text-[11px] text-emerald-600 flex items-center gap-1 font-medium">
                              <CheckCircle2 className="w-3 h-3" /> Online
                            </span>
                          )}
                          {pingStatus === 'error' && (
                            <span className="text-[11px] text-rose-600 font-medium">Server unreachable</span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </header>
  );
}

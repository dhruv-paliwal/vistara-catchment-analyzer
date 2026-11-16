import React from 'react';

/**
 * Elegant SVG Indian geometric filigree / Jali lattice motif
 */
export function JaliBorderPattern({ className = "h-3 w-full" }: { className?: string }) {
  return (
    <div className={`overflow-hidden flex items-center justify-center opacity-30 select-none ${className}`}>
      <svg width="100%" height="12" xmlns="http://www.w3.org/2000/svg" className="text-terracotta-500 fill-current">
        <pattern id="jali-pattern" x="0" y="0" width="24" height="12" patternUnits="userSpaceOnUse">
          <path d="M12 0 L24 6 L12 12 L0 6 Z" fill="none" stroke="currentColor" strokeWidth="0.8" />
          <circle cx="12" cy="6" r="1.5" fill="currentColor" />
        </pattern>
        <rect x="0" y="0" width="100%" height="12" fill="url(#jali-pattern)" />
      </svg>
    </div>
  );
}

/**
 * Mandala Lotus Insignia for branding & reports
 */
export function MandalaIcon({ className = "w-6 h-6", color = "currentColor" }: { className?: string; color?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="24" cy="24" r="5" className="fill-turmeric-400/20" stroke="currentColor" strokeWidth="1.5" />
      <path d="M24 7 C21 13 21 17 24 19 C27 17 27 13 24 7 Z" fill="currentColor" fillOpacity="0.15" />
      <path d="M24 41 C21 35 21 31 24 29 C27 31 27 35 24 41 Z" fill="currentColor" fillOpacity="0.15" />
      <path d="M7 24 C13 21 17 21 19 24 C17 27 13 27 7 24 Z" fill="currentColor" fillOpacity="0.15" />
      <path d="M41 24 C35 21 31 21 29 24 C31 27 35 27 41 24 Z" fill="currentColor" fillOpacity="0.15" />
      <path d="M12 12 C18 14 20 18 18 20 C16 22 12 20 12 12 Z" fill="currentColor" fillOpacity="0.1" />
      <path d="M36 36 C30 34 28 30 30 28 C32 26 36 28 36 36 Z" fill="currentColor" fillOpacity="0.1" />
      <path d="M36 12 C34 18 30 20 28 18 C26 16 28 12 36 12 Z" fill="currentColor" fillOpacity="0.1" />
      <path d="M12 36 C14 30 18 28 20 30 C22 32 20 36 12 36 Z" fill="currentColor" fillOpacity="0.1" />
    </svg>
  );
}

/**
 * Indian Rupee Stylized Medallion
 */
export function RupeeMedallion({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <div className={`inline-flex items-center justify-center rounded-full bg-gradient-to-br from-terracotta-500 to-saffron-600 text-cream-50 font-serif font-bold shadow-sm ${className}`}>
      ₹
    </div>
  );
}

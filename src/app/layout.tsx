import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Vistāra | Geospatial Retail Expansion & Catchment Analyzer",
  description: "Retail catchment clustering (DBSCAN), spatial density heatmapping, and Random Forest viability revenue prediction calibrated for Bengaluru commercial corridors.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen bg-[#FAF6ED] text-[#2A1F19] selection:bg-terracotta-200 selection:text-terracotta-900">
        {children}
      </body>
    </html>
  );
}

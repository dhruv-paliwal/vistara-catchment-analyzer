export type LocationType = 'Competitor' | 'Retail Hub' | 'Highway Intersection';

export interface CatchmentPoint {
  id: string;
  name: string;
  lat: number;
  lng: number;
  type: LocationType;
  dailyTraffic: number;
  populationDensity: number;
  clusterId?: number; // -1 for noise / unclustered
  distanceToHighwayKm?: number;
}

export interface CatchmentCluster {
  id: number;
  name: string;
  color: string;
  points: CatchmentPoint[];
  pointCount: number;
  centroid: { lat: number; lng: number };
  hullPolygon: [number, number][]; // [[lat, lng], ...]
  avgTraffic: number;
  avgDensity: number;
  dominantType: LocationType;
  primaryCharacteristics: string;
  viabilityScore: number; // 0 - 100
}

export interface FeatureImportance {
  feature: string;
  label: string;
  importance: number; // 0 - 100 percentage
  valueFormatted: string;
  impactLevel: 'High' | 'Medium' | 'Low';
  description: string;
}

export interface ViabilityPrediction {
  coordinates: { lat: number; lng: number };
  propertySizeSqFt: number;
  isInViableZone: boolean;
  targetCluster: CatchmentCluster | null;
  targetClusterName: string;
  viabilityTier: 'Prime Tier A+' | 'High Viability Tier A' | 'Emerging Tier B' | 'High Risk / Fringe';
  projectedAnnualRevenueINR: number;
  projectedAnnualRevenueFormatted: string;
  projectedMonthlyRevenueINR: number;
  projectedMonthlyRevenueFormatted: string;
  breakEvenPeriodMonths: number;
  roiEstimatePercent: number;
  confidenceScore: number; // 0 - 100
  featureImportances: FeatureImportance[];
  keySpatialMetrics: {
    nearestHighwayDistanceKm: number;
    nearestCentroidDistanceKm: number;
    interpolatedTrafficVolume: number;
    interpolatedPopulationDensity: number;
    competitorCountWithin1_5km: number;
    retailHubCountWithin1_5km: number;
  };
  strategicRecommendation: string;
  zoneCharacteristics: {
    commercialIntensity: string;
    trafficProfile: string;
    demographicDensity: string;
    competitiveMoat: string;
  };
}

export interface DbscanParams {
  epsKm: number;
  minSamples: number;
}

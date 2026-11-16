import { CatchmentPoint, CatchmentCluster } from './types';
import { haversineDistance, calculateCentroid, calculateConvexHull } from './spatialUtils';

// Warm, authentic Indian heritage palette for distinct catchment zones
const CLUSTER_COLORS = [
  '#C85A32', // Terracotta Red
  '#E67E22', // Deep Saffron
  '#D49A1F', // Turmeric Ochre
  '#8E44AD', // Royal Jamun / Purple
  '#2E7D32', // Betel Leaf / Forest Green
  '#C0392B', // Vermilion / Sindoor
  '#16A085', // Peacock Teal
  '#D35400', // Burnt Amber
  '#B7950B', // Antique Brass
  '#795548', // Sandstone Brown
];

const ZONE_DESCRIPTORS = [
  'High-Footfall Metro & High-Street Corridor',
  'Dense Residential & Lifestyle Commercial Hub',
  'Strategic Highway Transit & Suburban Node',
  'Fast-Growing Tech Belt & Mixed Commercial Zone',
  'Central Heritage High-Density Retail District',
  'Suburban Gateway & Regional Interchange',
];

/**
 * Runs DBSCAN algorithm on catchment points using Haversine spherical distance
 */
export function runDBSCAN(
  points: CatchmentPoint[],
  epsKm: number,
  minSamples: number
): {
  clusteredPoints: CatchmentPoint[];
  clusters: CatchmentCluster[];
  noisePointsCount: number;
} {
  const n = points.length;
  if (n === 0) {
    return { clusteredPoints: [], clusters: [], noisePointsCount: 0 };
  }

  // Clone points to avoid mutating input
  const pts: CatchmentPoint[] = points.map((p) => ({ ...p, clusterId: undefined }));
  const visited = new Array<boolean>(n).fill(false);
  const clusterAssignments = new Array<number>(n).fill(-1); // -1 = noise/unassigned
  let currentClusterId = 0;

  // Pre-calculate distance matrix or find neighbors dynamically
  const getNeighbors = (pointIdx: number): number[] => {
    const neighbors: number[] = [];
    const p1 = pts[pointIdx];
    for (let j = 0; j < n; j++) {
      const p2 = pts[j];
      const dist = haversineDistance(p1.lat, p1.lng, p2.lat, p2.lng);
      if (dist <= epsKm) {
        neighbors.push(j);
      }
    }
    return neighbors;
  };

  for (let i = 0; i < n; i++) {
    if (visited[i]) continue;
    visited[i] = true;

    const neighbors = getNeighbors(i);

    if (neighbors.length < minSamples) {
      clusterAssignments[i] = -1; // Noise
    } else {
      currentClusterId++;
      clusterAssignments[i] = currentClusterId;

      // Expand cluster
      const queue = [...neighbors];
      let queueIdx = 0;

      while (queueIdx < queue.length) {
        const neighborIdx = queue[queueIdx];
        queueIdx++;

        if (!visited[neighborIdx]) {
          visited[neighborIdx] = true;
          const secondaryNeighbors = getNeighbors(neighborIdx);
          if (secondaryNeighbors.length >= minSamples) {
            for (const sn of secondaryNeighbors) {
              if (!queue.includes(sn)) {
                queue.push(sn);
              }
            }
          }
        }

        // If not assigned to any cluster yet, or was marked as noise, join this cluster
        if (clusterAssignments[neighborIdx] <= 0) {
          clusterAssignments[neighborIdx] = currentClusterId;
        }
      }
    }
  }

  // Assign cluster IDs to points
  pts.forEach((p, idx) => {
    p.clusterId = clusterAssignments[idx];
  });

  // Group into CatchmentCluster objects
  const clusters: CatchmentCluster[] = [];
  const uniqueClusterIds = Array.from(new Set(clusterAssignments)).filter((id) => id > 0);

  for (let c = 0; c < uniqueClusterIds.length; c++) {
    const cid = uniqueClusterIds[c];
    const clusterPts = pts.filter((p) => p.clusterId === cid);
    const color = CLUSTER_COLORS[(cid - 1) % CLUSTER_COLORS.length];
    const centroid = calculateCentroid(clusterPts);
    const hullPolygon = calculateConvexHull(clusterPts, Math.max(0.3, epsKm * 0.35));

    const totalTraffic = clusterPts.reduce((acc, p) => acc + p.dailyTraffic, 0);
    const avgTraffic = Math.round(totalTraffic / clusterPts.length);
    const totalDensity = clusterPts.reduce((acc, p) => acc + p.populationDensity, 0);
    const avgDensity = Math.round(totalDensity / clusterPts.length);

    // Find dominant type
    const typeCounts: Record<string, number> = {};
    clusterPts.forEach((p) => {
      typeCounts[p.type] = (typeCounts[p.type] || 0) + 1;
    });
    let dominantType: any = 'Retail Hub';
    let maxCount = 0;
    for (const [t, count] of Object.entries(typeCounts)) {
      if (count > maxCount) {
        maxCount = count;
        dominantType = t;
      }
    }

    // Determine representative locality name
    const topPoint = clusterPts.slice().sort((a, b) => b.dailyTraffic - a.dailyTraffic)[0];
    const localityName = topPoint ? topPoint.name.split(' ')[0] : `Sector ${cid}`;

    // Viability Score calculation
    const trafficScore = Math.min(40, (avgTraffic / 150000) * 40);
    const densityScore = Math.min(35, (avgDensity / 22000) * 35);
    const sizeScore = Math.min(25, (clusterPts.length / 5) * 25);
    const viabilityScore = Math.round(trafficScore + densityScore + sizeScore);

    const descriptor = ZONE_DESCRIPTORS[(cid - 1) % ZONE_DESCRIPTORS.length];

    clusters.push({
      id: cid,
      name: `Catchment Zone #${cid} (${localityName} Cluster)`,
      color,
      points: clusterPts,
      pointCount: clusterPts.length,
      centroid,
      hullPolygon,
      avgTraffic,
      avgDensity,
      dominantType,
      primaryCharacteristics: `${descriptor} with ${clusterPts.length} commercial anchors, averaging ${avgTraffic.toLocaleString('en-IN')} daily traffic and ${avgDensity.toLocaleString('en-IN')} residents/km².`,
      viabilityScore,
    });
  }

  const noisePointsCount = pts.filter((p) => p.clusterId === -1).length;

  return {
    clusteredPoints: pts,
    clusters,
    noisePointsCount,
  };
}

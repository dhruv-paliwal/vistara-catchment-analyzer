import { NextRequest, NextResponse } from 'next/server';
import { predictViabilityAndRevenue } from '@/lib/randomForest';
import { CatchmentPoint, CatchmentCluster } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      proposedLat,
      proposedLng,
      points,
      clusters = [],
      propertySizeSqFt = 1800,
    } = body as {
      proposedLat: number;
      proposedLng: number;
      points: CatchmentPoint[];
      clusters?: CatchmentCluster[];
      propertySizeSqFt?: number;
    };

    if (proposedLat === undefined || proposedLng === undefined || !points) {
      return NextResponse.json({ error: 'Missing coordinates or points' }, { status: 400 });
    }

    const prediction = predictViabilityAndRevenue(
      Number(proposedLat),
      Number(proposedLng),
      points,
      clusters,
      Number(propertySizeSqFt)
    );

    return NextResponse.json(prediction);
  } catch (error: any) {
    console.error('Prediction error:', error);
    return NextResponse.json({ error: error.message || 'Prediction failed' }, { status: 500 });
  }
}

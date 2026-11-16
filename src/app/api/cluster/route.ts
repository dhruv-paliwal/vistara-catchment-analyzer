import { NextRequest, NextResponse } from 'next/server';
import { runDBSCAN } from '@/lib/dbscan';
import { CatchmentPoint } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { points, epsKm = 1.8, minSamples = 3 } = body as {
      points: CatchmentPoint[];
      epsKm?: number;
      minSamples?: number;
    };

    if (!points || !Array.isArray(points)) {
      return NextResponse.json({ error: 'Invalid points array provided' }, { status: 400 });
    }

    const result = runDBSCAN(points, Number(epsKm), Number(minSamples));
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Clustering error:', error);
    return NextResponse.json({ error: error.message || 'Clustering failed' }, { status: 500 });
  }
}

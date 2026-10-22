import { NextResponse } from 'next/server';
import { getRedeemLatestModifiedDates } from '../../../../src/lib/server/redeem-codes/repository.mjs';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const dates = await getRedeemLatestModifiedDates();
    const serialized = {};
    for (const [key, value] of Object.entries(dates)) {
      if (value instanceof Date && !Number.isNaN(value.getTime())) {
        serialized[key] = value.toISOString();
      } else if (typeof value === 'string') {
        serialized[key] = value;
      }
    }
    return NextResponse.json(serialized, {
      headers: {
        'Cache-Control': 'public, s-maxage=5, stale-while-revalidate=10'
      }
    });
  } catch (error) {
    console.error('[api/internal/redeem-last-modified] error:', error);
    const nowIso = new Date().toISOString();
    return NextResponse.json(
      {
        '/fc-mobile-redeem-codes': nowIso,
        '/th/fc-mobile-code': nowIso,
        '/ae/kod-fifa': nowIso,
        '/es/codigos-de-canje-de-fc-mobile': nowIso,
        latest: nowIso
      },
      { status: 200 }
    );
  }
}

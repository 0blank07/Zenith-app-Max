import { NextResponse } from 'next/server';
import crypto from 'node:crypto';
import {
  getRedeemCodeVotesBatch,
  recordRedeemCodeVote
} from '../../../../src/lib/server/redeem-codes/repository.mjs';

export const dynamic = 'force-dynamic';

function getClientIp(request) {
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    const first = forwardedFor.split(',')[0].trim();
    if (first) return first;
  }
  const realIp = request.headers.get('x-real-ip');
  if (realIp) return realIp.trim();
  const cfConnectingIp = request.headers.get('cf-connecting-ip');
  if (cfConnectingIp) return cfConnectingIp.trim();
  return '127.0.0.1';
}

function getVoterHash(request) {
  const ip = getClientIp(request);
  const userAgent = request.headers.get('user-agent') || 'unknown';
  return crypto.createHash('sha256').update(`${ip}:${userAgent}`).digest('hex');
}

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: 'Invalid JSON request body.' },
      { status: 400 }
    );
  }

  const codeId = typeof body?.codeId === 'string' ? body.codeId.trim() : '';
  const voteType = typeof body?.voteType === 'string' ? body.voteType.trim().toLowerCase() : '';

  if (!codeId) {
    return NextResponse.json(
      { success: false, error: 'codeId is required.' },
      { status: 400 }
    );
  }

  if (voteType !== 'worked' && voteType !== 'expired') {
    return NextResponse.json(
      { success: false, error: 'Invalid voteType. Must be "worked" or "expired".' },
      { status: 400 }
    );
  }

  try {
    const voterHash = getVoterHash(request);
    const result = await recordRedeemCodeVote({
      codeId,
      voteType,
      voterHash
    });

    return NextResponse.json({
      success: true,
      codeId: result.codeId || codeId,
      worked: result.worked ?? 0,
      expired: result.expired ?? 0,
      ...(result.offline ? { offline: true } : {}),
      ...(result.throttled ? { throttled: true } : {})
    });
  } catch (error) {
    console.error('[api/redeem-codes/vote] POST error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to record vote.' },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const idsParam = searchParams.get('ids') || '';

    if (!idsParam.trim()) {
      return NextResponse.json({ success: true, votes: {} });
    }

    const codeIds = idsParam
      .split(',')
      .map((id) => id.trim())
      .filter(Boolean);

    const votes = await getRedeemCodeVotesBatch(codeIds);
    return NextResponse.json({
      success: true,
      votes
    });
  } catch (error) {
    console.error('[api/redeem-codes/vote] GET error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch votes.' },
      { status: 500 }
    );
  }
}

import { NextResponse } from 'next/server';
import {
  SESSION_COOKIE_NAME,
  getCookieFromRequest,
  clearSessionCookie
} from '../../../../src/lib/server/auth/session.mjs';
import { deleteSession } from '../../../../src/lib/server/auth/db.mjs';
import { sanitizeReturnTo } from '../../../../src/lib/server/auth/crypto.mjs';

export const dynamic = 'force-dynamic';

async function performLogout(request) {
  const sessionToken = getCookieFromRequest(request, SESSION_COOKIE_NAME);
  if (sessionToken) {
    try {
      await deleteSession(sessionToken);
    } catch (err) {
      console.error('Error deleting session on logout:', err);
    }
  }
}

export async function POST(request) {
  await performLogout(request);

  const url = new URL(request.url);
  const returnTo = url.searchParams.get('returnTo');
  const acceptHeader = request.headers.get('accept') || '';

  if (returnTo && !acceptHeader.includes('application/json')) {
    const safeReturnTo = sanitizeReturnTo(returnTo, '/');
    const response = NextResponse.redirect(new URL(safeReturnTo, request.url), 302);
    clearSessionCookie(response);
    return response;
  }

  const response = NextResponse.json({ success: true });
  clearSessionCookie(response);
  return response;
}

export async function GET(request) {
  await performLogout(request);

  const url = new URL(request.url);
  const returnTo = url.searchParams.get('returnTo');
  const safeReturnTo = sanitizeReturnTo(returnTo, '/');

  const response = NextResponse.redirect(new URL(safeReturnTo, request.url), 302);
  clearSessionCookie(response);
  return response;
}

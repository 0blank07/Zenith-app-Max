import { NextResponse } from 'next/server';
import {
  isSupportedProvider,
  getAuthorizationUrl
} from '../../../../../src/lib/server/auth/oauth-providers.mjs';
import {
  generateCodeVerifier,
  generateCodeChallenge,
  createSignedOAuthState,
  sanitizeReturnTo
} from '../../../../../src/lib/server/auth/crypto.mjs';
import {
  getSessionFromRequest,
  setOAuthStateCookie
} from '../../../../../src/lib/server/auth/session.mjs';

export const dynamic = 'force-dynamic';

export async function GET(request, context) {
  let safeReturnTo = '/';
  try {
    const params = await Promise.resolve(context?.params || {});
    const provider = params.provider ? String(params.provider).trim().toLowerCase() : '';

    if (!isSupportedProvider(provider)) {
      return NextResponse.json(
        { success: false, error: `Unsupported provider: ${provider}` },
        { status: 400 }
      );
    }

    const url = new URL(request.url);
    const actionParam = url.searchParams.get('action');
    const returnToParam = url.searchParams.get('returnTo') || url.searchParams.get('next') || '/';
    safeReturnTo = sanitizeReturnTo(returnToParam, '/');

    let action = actionParam === 'link' ? 'link' : 'login';
    let userId = null;

    if (action === 'link') {
      const sessionData = await getSessionFromRequest(request);
      if (sessionData && sessionData.user) {
        userId = sessionData.user.id;
      } else {
        // If user is not authenticated, fallback to standard login
        action = 'login';
      }
    }

    let codeVerifier = null;
    let codeChallenge = null;

    if (provider === 'google' || provider === 'discord') {
      codeVerifier = generateCodeVerifier();
      codeChallenge = generateCodeChallenge(codeVerifier);
    }

    const stateToken = createSignedOAuthState({
      provider,
      action,
      returnTo: safeReturnTo,
      codeVerifier,
      userId
    });

    const authorizationUrl = getAuthorizationUrl(provider, {
      state: stateToken,
      codeChallenge
    });

    const response = NextResponse.redirect(authorizationUrl, 302);
    setOAuthStateCookie(response, provider, stateToken);

    return response;
  } catch (err) {
    console.error('OAuth login route error:', err);
    const redirectUrl = new URL(safeReturnTo, request.url);
    redirectUrl.searchParams.set('auth_error', 'login_failed');
    return NextResponse.redirect(redirectUrl, 302);
  }
}


import { NextResponse } from 'next/server';
import {
  isSupportedProvider,
  exchangeCodeForTokens,
  fetchUserProfile
} from '../../../../../src/lib/server/auth/oauth-providers.mjs';
import {
  verifySignedOAuthState,
  generateSessionToken,
  sanitizeReturnTo
} from '../../../../../src/lib/server/auth/crypto.mjs';
import {
  getSessionFromRequest,
  setSessionCookie,
  getOAuthStateCookieName,
  clearOAuthStateCookie,
  getCookieFromRequest,
  getClientIp,
  SESSION_COOKIE_MAX_AGE
} from '../../../../../src/lib/server/auth/session.mjs';
import {
  findOAuthAccount,
  findUserById,
  findUserByEmail,
  createOAuthUserWithAccount,
  linkOAuthAccount,
  createSession
} from '../../../../../src/lib/server/auth/db.mjs';

export const dynamic = 'force-dynamic';

export async function GET(request, context) {
  let fallbackReturnTo = '/';
  let currentProvider = '';

  try {
    const params = await Promise.resolve(context?.params || {});
    currentProvider = params.provider ? String(params.provider).trim().toLowerCase() : '';

    if (!isSupportedProvider(currentProvider)) {
      return NextResponse.json(
        { success: false, error: `Unsupported provider: ${currentProvider}` },
        { status: 400 }
      );
    }

    const url = new URL(request.url);
    const queryError = url.searchParams.get('error');
    const queryCode = url.searchParams.get('code');
    const queryState = url.searchParams.get('state');

    // 1. Handle error directly from OAuth provider (e.g. ?error=access_denied)
    if (queryError) {
      let targetReturnTo = fallbackReturnTo;
      if (queryState) {
        const preCheckState = verifySignedOAuthState(queryState, { expectedProvider: currentProvider });
        if (preCheckState?.returnTo) {
          targetReturnTo = sanitizeReturnTo(preCheckState.returnTo, '/');
        }
      }

      const isCancelled =
        queryError === 'access_denied' ||
        queryError === 'consent_required' ||
        queryError.toLowerCase().includes('cancel');

      const redirectUrl = new URL(targetReturnTo, request.url);
      if (isCancelled) {
        redirectUrl.searchParams.set('auth_canceled', '1');
      } else {
        redirectUrl.searchParams.set('auth_error', 'provider_rejected');
      }

      const response = NextResponse.redirect(redirectUrl, 302);
      clearOAuthStateCookie(response, currentProvider);
      return response;
    }

    // 2. Verify state parameter & cookie (CSRF & PKCE protection)
    const stateCookieName = getOAuthStateCookieName(currentProvider);
    const stateCookie = getCookieFromRequest(request, stateCookieName);

    if (!queryState || !stateCookie || queryState !== stateCookie) {
      const redirectUrl = new URL(fallbackReturnTo, request.url);
      redirectUrl.searchParams.set('auth_error', 'invalid_state');
      const response = NextResponse.redirect(redirectUrl, 302);
      clearOAuthStateCookie(response, currentProvider);
      return response;
    }

    const statePayload = verifySignedOAuthState(queryState, { expectedProvider: currentProvider });
    if (!statePayload) {
      const redirectUrl = new URL(fallbackReturnTo, request.url);
      redirectUrl.searchParams.set('auth_error', 'invalid_state');
      const response = NextResponse.redirect(redirectUrl, 302);
      clearOAuthStateCookie(response, currentProvider);
      return response;
    }

    fallbackReturnTo = sanitizeReturnTo(statePayload.returnTo, '/');
    const action = statePayload.action === 'link' ? 'link' : 'login';
    const codeVerifier = statePayload.codeVerifier;

    // 3. Validate authorization code
    if (!queryCode) {
      const redirectUrl = new URL(fallbackReturnTo, request.url);
      redirectUrl.searchParams.set('auth_error', 'missing_code');
      const response = NextResponse.redirect(redirectUrl, 302);
      clearOAuthStateCookie(response, currentProvider);
      return response;
    }

    // 4. Exchange authorization code for tokens and fetch user profile
    let tokenResult;
    let profile;
    try {
      tokenResult = await exchangeCodeForTokens(currentProvider, queryCode, {
        codeVerifier
      });
      profile = await fetchUserProfile(currentProvider, tokenResult.accessToken);
    } catch (exchangeErr) {
      console.error(`Token exchange or profile fetch failed for ${currentProvider}:`, exchangeErr);
      const redirectUrl = new URL(fallbackReturnTo, request.url);
      redirectUrl.searchParams.set('auth_error', 'provider_unavailable');
      const response = NextResponse.redirect(redirectUrl, 302);
      clearOAuthStateCookie(response, currentProvider);
      return response;
    }

    if (!profile || !profile.providerUserId) {
      const redirectUrl = new URL(fallbackReturnTo, request.url);
      redirectUrl.searchParams.set('auth_error', 'profile_fetch_failed');
      const response = NextResponse.redirect(redirectUrl, 302);
      clearOAuthStateCookie(response, currentProvider);
      return response;
    }

    // 5. Handle action: 'login' vs 'link'
    if (action === 'link') {
      const currentSession = await getSessionFromRequest(request);
      if (!currentSession || !currentSession.user || currentSession.user.isActive === false) {
        const redirectUrl = new URL(fallbackReturnTo, request.url);
        redirectUrl.searchParams.set('auth_error', 'unauthenticated');
        const response = NextResponse.redirect(redirectUrl, 302);
        clearOAuthStateCookie(response, currentProvider);
        return response;
      }

      if (statePayload.userId && statePayload.userId !== currentSession.user.id) {
        const redirectUrl = new URL(fallbackReturnTo, request.url);
        redirectUrl.searchParams.set('auth_error', 'user_mismatch');
        const response = NextResponse.redirect(redirectUrl, 302);
        clearOAuthStateCookie(response, currentProvider);
        return response;
      }

      const existingAccount = await findOAuthAccount(currentProvider, profile.providerUserId);
      if (existingAccount) {
        if (String(existingAccount.userId) !== String(currentSession.user.id)) {
          const redirectUrl = new URL(fallbackReturnTo, request.url);
          redirectUrl.searchParams.set('auth_error', 'provider_already_linked');
          const response = NextResponse.redirect(redirectUrl, 302);
          clearOAuthStateCookie(response, currentProvider);
          return response;
        }

        // Already linked to current user
        const redirectUrl = new URL(fallbackReturnTo, request.url);
        redirectUrl.searchParams.set('auth_success', 'already_linked');
        const response = NextResponse.redirect(redirectUrl, 302);
        clearOAuthStateCookie(response, currentProvider);
        return response;
      }

      // Link provider to current user
      await linkOAuthAccount(currentSession.user.id, {
        provider: currentProvider,
        providerUserId: profile.providerUserId,
        email: profile.email,
        displayName: profile.name,
        avatarUrl: profile.avatarUrl
      });

      const redirectUrl = new URL(fallbackReturnTo, request.url);
      redirectUrl.searchParams.set('auth_success', 'provider_linked');
      const response = NextResponse.redirect(redirectUrl, 302);
      clearOAuthStateCookie(response, currentProvider);
      return response;
    }

    // action === 'login'
    const existingAccount = await findOAuthAccount(currentProvider, profile.providerUserId);

    if (existingAccount) {
      const user = await findUserById(existingAccount.userId);
      if (!user || user.isActive === false) {
        const redirectUrl = new URL(fallbackReturnTo, request.url);
        redirectUrl.searchParams.set('auth_error', 'account_deactivated');
        const response = NextResponse.redirect(redirectUrl, 302);
        clearOAuthStateCookie(response, currentProvider);
        return response;
      }

      // Issue session
      const sessionToken = generateSessionToken();
      const expiresAt = new Date(Date.now() + SESSION_COOKIE_MAX_AGE * 1000);
      const userAgent = request.headers.get('user-agent');
      const ipAddress = getClientIp(request);

      await createSession(user.id, sessionToken, expiresAt, { userAgent, ipAddress });

      const redirectUrl = new URL(fallbackReturnTo, request.url);
      const response = NextResponse.redirect(redirectUrl, 302);
      clearOAuthStateCookie(response, currentProvider);
      setSessionCookie(response, sessionToken);
      return response;
    }

    // No existing OAuth account: check if user exists by verified email
    let existingUser = null;
    if (profile.email && profile.emailVerified) {
      existingUser = await findUserByEmail(profile.email);
    }

    if (existingUser) {
      if (existingUser.isActive === false) {
        const redirectUrl = new URL(fallbackReturnTo, request.url);
        redirectUrl.searchParams.set('auth_error', 'account_deactivated');
        const response = NextResponse.redirect(redirectUrl, 302);
        clearOAuthStateCookie(response, currentProvider);
        return response;
      }

      // Auto-link provider to existing user
      await linkOAuthAccount(existingUser.id, {
        provider: currentProvider,
        providerUserId: profile.providerUserId,
        email: profile.email,
        displayName: profile.name,
        avatarUrl: profile.avatarUrl
      });

      const sessionToken = generateSessionToken();
      const expiresAt = new Date(Date.now() + SESSION_COOKIE_MAX_AGE * 1000);
      const userAgent = request.headers.get('user-agent');
      const ipAddress = getClientIp(request);

      await createSession(existingUser.id, sessionToken, expiresAt, { userAgent, ipAddress });

      const redirectUrl = new URL(fallbackReturnTo, request.url);
      redirectUrl.searchParams.set('auth', 'linked');
      const response = NextResponse.redirect(redirectUrl, 302);
      clearOAuthStateCookie(response, currentProvider);
      setSessionCookie(response, sessionToken);
      return response;
    }

    // New user signup
    const newUser = await createOAuthUserWithAccount({
      email: profile.email,
      name: profile.name,
      avatarUrl: profile.avatarUrl,
      provider: currentProvider,
      providerUserId: profile.providerUserId
    });

    const sessionToken = generateSessionToken();
    const expiresAt = new Date(Date.now() + SESSION_COOKIE_MAX_AGE * 1000);
    const userAgent = request.headers.get('user-agent');
    const ipAddress = getClientIp(request);

    await createSession(newUser.id, sessionToken, expiresAt, { userAgent, ipAddress });

    const redirectUrl = new URL(fallbackReturnTo, request.url);
    redirectUrl.searchParams.set('auth', 'welcome');
    const response = NextResponse.redirect(redirectUrl, 302);
    clearOAuthStateCookie(response, currentProvider);
    setSessionCookie(response, sessionToken);
    return response;
  } catch (error) {
    console.error(`OAuth callback error for ${currentProvider}:`, error);
    const redirectUrl = new URL(fallbackReturnTo, request.url);

    if (error?.code === 'ACCOUNT_ALREADY_LINKED') {
      redirectUrl.searchParams.set('auth_error', 'provider_already_linked');
    } else {
      redirectUrl.searchParams.set('auth_error', 'server_error');
    }

    const response = NextResponse.redirect(redirectUrl, 302);
    if (currentProvider) {
      clearOAuthStateCookie(response, currentProvider);
    }
    return response;
  }
}

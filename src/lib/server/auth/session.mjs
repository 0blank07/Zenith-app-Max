import { findSession, getLinkedAccounts } from './db.mjs';

export const SESSION_COOKIE_NAME = 'zenith_session';
export const SESSION_COOKIE_MAX_AGE = 30 * 24 * 60 * 60; // 30 days in seconds (2592000s)
export const OAUTH_STATE_COOKIE_PREFIX = 'zenith_oauth_state_';
export const OAUTH_STATE_COOKIE_MAX_AGE = 10 * 60; // 10 minutes in seconds (600s)

/**
 * Computes cookie name for a given provider's OAuth state.
 *
 * @param {string} provider
 * @returns {string}
 */
export function getOAuthStateCookieName(provider) {
  if (!provider || typeof provider !== 'string') {
    throw new Error('Provider name is required for OAuth state cookie.');
  }
  return `${OAUTH_STATE_COOKIE_PREFIX}${provider.trim().toLowerCase()}`;
}

/**
 * Returns options for zenith_session cookie.
 *
 * @param {Object} [env=process.env]
 * @returns {Object}
 */
export function getSessionCookieOptions(env = process.env) {
  const isProduction = env.NODE_ENV === 'production';
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_COOKIE_MAX_AGE
  };
}

/**
 * Returns options for OAuth state cookies.
 *
 * @param {Object} [env=process.env]
 * @returns {Object}
 */
export function getOAuthStateCookieOptions(env = process.env) {
  const isProduction = env.NODE_ENV === 'production';
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    path: '/',
    maxAge: OAUTH_STATE_COOKIE_MAX_AGE
  };
}

/**
 * Parses a standard Cookie header string into a key-value dictionary.
 *
 * @param {string|null|undefined} cookieHeader
 * @returns {Record<string, string>}
 */
export function parseCookies(cookieHeader) {
  const result = {};
  if (!cookieHeader || typeof cookieHeader !== 'string') {
    return result;
  }

  const parts = cookieHeader.split(';');
  for (const part of parts) {
    const eqIdx = part.indexOf('=');
    if (eqIdx !== -1) {
      const key = part.slice(0, eqIdx).trim();
      const val = part.slice(eqIdx + 1).trim();
      if (key) {
        try {
          result[key] = decodeURIComponent(val);
        } catch {
          result[key] = val;
        }
      }
    }
  }

  return result;
}

/**
 * Serializes a cookie name, value, and options into a Set-Cookie header value.
 *
 * @param {string} name
 * @param {string} value
 * @param {Object} [options={}]
 * @returns {string}
 */
export function serializeCookie(name, value, options = {}) {
  let str = `${encodeURIComponent(name)}=${encodeURIComponent(value || '')}`;

  if (options.maxAge !== undefined) {
    str += `; Max-Age=${Math.floor(options.maxAge)}`;
  }
  if (options.expires) {
    const expDate = options.expires instanceof Date ? options.expires : new Date(options.expires);
    str += `; Expires=${expDate.toUTCString()}`;
  }
  if (options.path) {
    str += `; Path=${options.path}`;
  }
  if (options.sameSite) {
    const raw = String(options.sameSite);
    const normalized = raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase();
    str += `; SameSite=${normalized}`;
  }
  if (options.httpOnly) {
    str += '; HttpOnly';
  }
  if (options.secure) {
    str += '; Secure';
  }

  return str;
}

/**
 * Extracts a cookie value from a request object (supports NextRequest, Web Request, or headers).
 *
 * @param {Object|string} request
 * @param {string} cookieName
 * @returns {string|null}
 */
export function getCookieFromRequest(request, cookieName) {
  if (!request || !cookieName) return null;

  // NextRequest with .cookies.get
  if (request.cookies && typeof request.cookies.get === 'function') {
    const found = request.cookies.get(cookieName);
    return found ? (typeof found === 'string' ? found : found.value) : null;
  }

  // NextRequest / Web Request with headers.get
  let headerValue = null;
  if (typeof request === 'string') {
    headerValue = request;
  } else if (request.headers) {
    if (typeof request.headers.get === 'function') {
      headerValue = request.headers.get('cookie');
    } else {
      headerValue = request.headers.cookie;
    }
  }

  if (!headerValue || typeof headerValue !== 'string') {
    return null;
  }

  const parsed = parseCookies(headerValue);
  return parsed[cookieName] || null;
}

/**
 * Sets the zenith_session cookie on an App Router response.
 *
 * @param {Response|Object} response
 * @param {string} sessionToken
 * @param {Object} [env=process.env]
 * @returns {Response|Object}
 */
export function setSessionCookie(response, sessionToken, env = process.env) {
  const options = getSessionCookieOptions(env);
  if (response.cookies && typeof response.cookies.set === 'function') {
    response.cookies.set(SESSION_COOKIE_NAME, sessionToken, options);
  } else if (response.headers && typeof response.headers.append === 'function') {
    response.headers.append('Set-Cookie', serializeCookie(SESSION_COOKIE_NAME, sessionToken, options));
  }
  return response;
}

/**
 * Clears the zenith_session cookie on an App Router response.
 *
 * @param {Response|Object} response
 * @param {Object} [env=process.env]
 * @returns {Response|Object}
 */
export function clearSessionCookie(response, env = process.env) {
  const options = {
    ...getSessionCookieOptions(env),
    maxAge: 0,
    expires: new Date(0)
  };
  if (response.cookies && typeof response.cookies.set === 'function') {
    response.cookies.set(SESSION_COOKIE_NAME, '', options);
  } else if (response.headers && typeof response.headers.append === 'function') {
    response.headers.append('Set-Cookie', serializeCookie(SESSION_COOKIE_NAME, '', options));
  }
  return response;
}

/**
 * Sets an OAuth state cookie on an App Router response.
 *
 * @param {Response|Object} response
 * @param {string} provider
 * @param {string} stateToken
 * @param {Object} [env=process.env]
 * @returns {Response|Object}
 */
export function setOAuthStateCookie(response, provider, stateToken, env = process.env) {
  const cookieName = getOAuthStateCookieName(provider);
  const options = getOAuthStateCookieOptions(env);
  if (response.cookies && typeof response.cookies.set === 'function') {
    response.cookies.set(cookieName, stateToken, options);
  } else if (response.headers && typeof response.headers.append === 'function') {
    response.headers.append('Set-Cookie', serializeCookie(cookieName, stateToken, options));
  }
  return response;
}

/**
 * Clears an OAuth state cookie on an App Router response.
 *
 * @param {Response|Object} response
 * @param {string} provider
 * @param {Object} [env=process.env]
 * @returns {Response|Object}
 */
export function clearOAuthStateCookie(response, provider, env = process.env) {
  const cookieName = getOAuthStateCookieName(provider);
  const options = {
    ...getOAuthStateCookieOptions(env),
    maxAge: 0,
    expires: new Date(0)
  };
  if (response.cookies && typeof response.cookies.set === 'function') {
    response.cookies.set(cookieName, '', options);
  } else if (response.headers && typeof response.headers.append === 'function') {
    response.headers.append('Set-Cookie', serializeCookie(cookieName, '', options));
  }
  return response;
}

/**
 * Extracts client IP from request headers.
 *
 * @param {Object} request
 * @returns {string|null}
 */
export function getClientIp(request) {
  if (!request) return null;
  const forwardedFor = request.headers?.get
    ? request.headers.get('x-forwarded-for')
    : request.headers?.['x-forwarded-for'];
  if (forwardedFor && typeof forwardedFor === 'string') {
    return forwardedFor.split(',')[0].trim();
  }
  const realIp = request.headers?.get
    ? request.headers.get('x-real-ip')
    : request.headers?.['x-real-ip'];
  if (realIp && typeof realIp === 'string') {
    return realIp.trim();
  }
  return null;
}

/**
 * Resolves current session and authenticated user profile from incoming request.
 * Returns null for unauthenticated guests.
 *
 * @param {Object} request
 * @param {Object} [options]
 * @returns {Promise<{ session: Object, user: Object }|null>}
 */
export async function getSessionFromRequest(request, options = {}) {
  const sessionToken = getCookieFromRequest(request, SESSION_COOKIE_NAME);
  if (!sessionToken || typeof sessionToken !== 'string' || !sessionToken.trim()) {
    return null;
  }

  const sessionData = await findSession(sessionToken.trim(), options);
  if (!sessionData || !sessionData.user || sessionData.user.isActive === false) {
    return null;
  }

  const linkedAccounts = await getLinkedAccounts(sessionData.user.id, options);
  const providers = linkedAccounts.map((acc) => acc.provider);

  return {
    session: sessionData.session,
    user: {
      ...sessionData.user,
      providers,
      linkedAccounts
    }
  };
}

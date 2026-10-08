import crypto from 'node:crypto';

/**
 * Returns the configured auth secret for state and session signing.
 *
 * @param {Object} [env=process.env]
 * @returns {string}
 */
export function getAuthSecret(env = process.env) {
  const secret = env.AUTH_SECRET || env.AUTH_SESSION_SECRET || env.SESSION_SECRET;
  if (secret && typeof secret === 'string' && secret.trim()) {
    return secret.trim();
  }

  if (env.NODE_ENV === 'production') {
    throw new Error('AUTH_SECRET is required in production.');
  }

  // Safe development/test fallback secret with >= 32 characters
  return 'zenith-auth-dev-secret-32-chars-long-entropy-key';
}

/**
 * Sanitizes a redirect path to prevent open redirect vulnerabilities.
 * Enforces relative paths starting with a single '/' and rejects protocols.
 *
 * @param {string|null|undefined} path
 * @param {string} [fallback='/']
 * @returns {string}
 */
export function sanitizeReturnTo(path, fallback = '/') {
  if (!path || typeof path !== 'string') {
    return fallback;
  }

  const trimmed = path.trim();
  if (!trimmed) {
    return fallback;
  }

  // Must start with exactly one '/' and NOT '//' or '/\'
  if (!trimmed.startsWith('/') || trimmed.startsWith('//') || trimmed.startsWith('/\\')) {
    return fallback;
  }

  // Disallow any scheme/protocol indicators (e.g. javascript:, http:, data:)
  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(trimmed)) {
    return fallback;
  }

  // Disallow CRLF or newline characters to prevent HTTP response splitting
  if (/[\r\n]/.test(trimmed)) {
    return fallback;
  }

  return trimmed;
}

/**
 * Generates an RFC 7636 PKCE code_verifier (high-entropy cryptographic random string).
 *
 * @param {number} [byteLength=48] - 48 random bytes yield 64 base64url characters
 * @returns {string}
 */
export function generateCodeVerifier(byteLength = 48) {
  return crypto.randomBytes(byteLength).toString('base64url');
}

/**
 * Generates an RFC 7636 PKCE S256 code_challenge from a code_verifier.
 *
 * @param {string} verifier
 * @returns {string}
 */
export function generateCodeChallenge(verifier) {
  if (!verifier || typeof verifier !== 'string') {
    throw new Error('PKCE verifier must be a non-empty string.');
  }
  return crypto.createHash('sha256').update(verifier).digest('base64url');
}

/**
 * Creates a cryptographically signed OAuth state token containing CSRF nonce,
 * provider identity, action, PKCE verifier, and returnTo target.
 *
 * @param {Object} params
 * @param {string} params.provider - 'google' | 'discord' | 'facebook'
 * @param {'login'|'link'} [params.action='login']
 * @param {string} [params.returnTo='/']
 * @param {string|null} [params.codeVerifier=null]
 * @param {string|null} [params.userId=null]
 * @param {string|null} [params.nonce=null]
 * @param {number} [params.ttlSeconds=600] - 10 minutes default
 * @param {string|null} [secret=null]
 * @returns {string} Signed state token in format `${encodedPayload}.${signature}`
 */
export function createSignedOAuthState(
  {
    provider,
    action = 'login',
    returnTo = '/',
    codeVerifier = null,
    userId = null,
    nonce = null,
    ttlSeconds = 600
  },
  secret = null
) {
  if (!provider || typeof provider !== 'string') {
    throw new Error('Provider is required to create OAuth state.');
  }

  const signingSecret = secret || getAuthSecret();
  const now = Math.floor(Date.now() / 1000);
  const ttl = Math.max(60, Number(ttlSeconds) || 600);

  const payload = {
    nonce: nonce || crypto.randomBytes(16).toString('hex'),
    provider: provider.trim().toLowerCase(),
    action: action === 'link' ? 'link' : 'login',
    returnTo: sanitizeReturnTo(returnTo),
    codeVerifier: codeVerifier ? String(codeVerifier) : null,
    userId: userId ? String(userId) : null,
    iat: now,
    exp: now + ttl
  };

  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', signingSecret)
    .update(encodedPayload)
    .digest('base64url');

  return `${encodedPayload}.${signature}`;
}

/**
 * Verifies a signed OAuth state token, validating signature, expiration, and provider match.
 *
 * @param {string} stateString
 * @param {Object} [options]
 * @param {string|null} [options.secret=null]
 * @param {string|null} [options.expectedProvider=null]
 * @param {'login'|'link'|null} [options.expectedAction=null]
 * @param {number} [options.currentTime]
 * @returns {Object|null} The verified state payload, or null if invalid/expired
 */
export function verifySignedOAuthState(stateString, options = {}) {
  if (!stateString || typeof stateString !== 'string') {
    return null;
  }

  const parts = stateString.trim().split('.');
  if (parts.length !== 2) {
    return null;
  }

  const [encodedPayload, receivedSignature] = parts;
  if (!encodedPayload || !receivedSignature) {
    return null;
  }

  const signingSecret = options.secret || getAuthSecret();
  const expectedSignature = crypto
    .createHmac('sha256', signingSecret)
    .update(encodedPayload)
    .digest('base64url');

  const receivedSigBuf = Buffer.from(receivedSignature);
  const expectedSigBuf = Buffer.from(expectedSignature);

  if (receivedSigBuf.length !== expectedSigBuf.length) {
    return null;
  }

  if (!crypto.timingSafeEqual(receivedSigBuf, expectedSigBuf)) {
    return null;
  }

  try {
    const rawPayload = Buffer.from(encodedPayload, 'base64url').toString('utf8');
    const payload = JSON.parse(rawPayload);

    if (!payload || typeof payload !== 'object') {
      return null;
    }

    const currentTime = options.currentTime !== undefined
      ? options.currentTime
      : Math.floor(Date.now() / 1000);

    if (typeof payload.exp !== 'number' || payload.exp <= currentTime) {
      return null; // Expired
    }

    if (options.expectedProvider) {
      const expected = String(options.expectedProvider).trim().toLowerCase();
      if (payload.provider !== expected) {
        return null;
      }
    }

    if (options.expectedAction) {
      if (payload.action !== options.expectedAction) {
        return null;
      }
    }

    return payload;
  } catch {
    return null;
  }
}

/**
 * Generates a cryptographically secure random session token.
 *
 * @param {number} [byteLength=32] - 32 bytes yields 43 base64url characters (256 bits entropy)
 * @returns {string}
 */
export function generateSessionToken(byteLength = 32) {
  return crypto.randomBytes(byteLength).toString('base64url');
}


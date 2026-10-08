/**
 * OAuth 2.0 Providers Adapter for ZenithFCM
 * Supports Google, Discord, and Facebook OAuth 2.0.
 */

export const SUPPORTED_PROVIDERS = ['google', 'discord', 'facebook'];

/**
 * Validates if the given provider identifier is supported.
 *
 * @param {string} provider
 * @returns {boolean}
 */
export function isSupportedProvider(provider) {
  if (!provider || typeof provider !== 'string') return false;
  return SUPPORTED_PROVIDERS.includes(provider.trim().toLowerCase());
}

/**
 * Returns the base site URL for OAuth callbacks.
 *
 * @param {Object} [env=process.env]
 * @returns {string}
 */
export function getSiteUrl(env = process.env) {
  const url = env.NEXT_PUBLIC_SITE_URL || env.SITE_URL || 'http://localhost:3000';
  return url.replace(/\/+$/, '');
}

/**
 * Resolves a Discord avatar URL, falling back to the standard snowflake default avatar.
 *
 * @param {string} id - Discord user snowflake ID
 * @param {string|null} avatarHash - Discord avatar hash
 * @returns {string}
 */
export function resolveDiscordAvatarUrl(id, avatarHash) {
  if (avatarHash) {
    const ext = avatarHash.startsWith('a_') ? 'gif' : 'png';
    return `https://cdn.discordapp.com/avatars/${id}/${avatarHash}.${ext}`;
  }
  if (id) {
    try {
      const defaultIndex = Number((BigInt(id) >> 22n) % 6n);
      return `https://cdn.discordapp.com/embed/avatars/${defaultIndex}.png`;
    } catch {
      return 'https://cdn.discordapp.com/embed/avatars/0.png';
    }
  }
  return 'https://cdn.discordapp.com/embed/avatars/0.png';
}

/**
 * Returns configuration details for a specific OAuth provider.
 *
 * @param {string} provider
 * @param {Object} [env=process.env]
 * @returns {Object}
 */
export function getProviderConfig(provider, env = process.env) {
  const normalized = String(provider).trim().toLowerCase();
  const siteUrl = getSiteUrl(env);

  switch (normalized) {
    case 'google':
      return {
        id: 'google',
        name: 'Google',
        authEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
        tokenEndpoint: 'https://oauth2.googleapis.com/token',
        userInfoEndpoint: 'https://openidconnect.googleapis.com/v1/userinfo',
        defaultScopes: ['openid', 'email', 'profile'],
        supportsPkce: true,
        clientId: env.GOOGLE_CLIENT_ID || '',
        clientSecret: env.GOOGLE_CLIENT_SECRET || '',
        redirectUri: env.GOOGLE_REDIRECT_URI || `${siteUrl}/api/auth/google/callback`
      };

    case 'discord':
      return {
        id: 'discord',
        name: 'Discord',
        authEndpoint: 'https://discord.com/api/oauth2/authorize',
        tokenEndpoint: 'https://discord.com/api/oauth2/token',
        userInfoEndpoint: 'https://discord.com/api/users/@me',
        defaultScopes: ['identify', 'email'],
        supportsPkce: true,
        clientId: env.DISCORD_CLIENT_ID || '',
        clientSecret: env.DISCORD_CLIENT_SECRET || '',
        redirectUri: env.DISCORD_REDIRECT_URI || `${siteUrl}/api/auth/discord/callback`
      };

    case 'facebook':
      return {
        id: 'facebook',
        name: 'Facebook',
        authEndpoint: 'https://www.facebook.com/v20.0/dialog/oauth',
        tokenEndpoint: 'https://graph.facebook.com/v20.0/oauth/access_token',
        userInfoEndpoint: 'https://graph.facebook.com/v20.0/me?fields=id,name,email,picture.type(large)',
        defaultScopes: ['email', 'public_profile'],
        supportsPkce: false,
        clientId: env.FACEBOOK_CLIENT_ID || '',
        clientSecret: env.FACEBOOK_CLIENT_SECRET || '',
        redirectUri: env.FACEBOOK_REDIRECT_URI || `${siteUrl}/api/auth/facebook/callback`
      };

    default:
      throw new Error(`Unsupported OAuth provider: ${provider}`);
  }
}

/**
 * Builds the provider authorization URL for user redirect.
 *
 * @param {string} provider - 'google' | 'discord' | 'facebook'
 * @param {Object} options
 * @param {string} options.state - CSRF/PKCE state string
 * @param {string} [options.codeChallenge] - PKCE S256 code challenge
 * @param {string} [options.redirectUri] - Custom redirect URI override
 * @param {Array<string>} [options.scopes] - Custom scopes override
 * @param {string} [options.clientId] - Client ID override
 * @param {Object} [env=process.env]
 * @returns {string} Fully qualified authorization URL
 */
export function getAuthorizationUrl(provider, options = {}, env = process.env) {
  const config = getProviderConfig(provider, env);
  const clientId = options.clientId || config.clientId;
  const redirectUri = options.redirectUri || config.redirectUri;
  const state = options.state;

  if (!state) {
    throw new Error('OAuth state is required to build authorization URL.');
  }

  const url = new URL(config.authEndpoint);
  url.searchParams.set('client_id', clientId);
  url.searchParams.set('redirect_uri', redirectUri);
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('state', state);

  // Scopes
  const scopes = options.scopes || config.defaultScopes;
  if (config.id === 'facebook') {
    url.searchParams.set('scope', scopes.join(','));
  } else {
    url.searchParams.set('scope', scopes.join(' '));
  }

  // PKCE
  if (config.supportsPkce && options.codeChallenge) {
    url.searchParams.set('code_challenge', options.codeChallenge);
    url.searchParams.set('code_challenge_method', 'S256');
  }

  // Provider-specific parameters
  if (config.id === 'google') {
    url.searchParams.set('access_type', 'online');
    url.searchParams.set('prompt', 'select_account');
  } else if (config.id === 'discord') {
    url.searchParams.set('prompt', 'consent');
  }

  return url.toString();
}

/**
 * Exchanges an authorization code for access and ID tokens.
 *
 * @param {string} provider
 * @param {string} code
 * @param {Object} [options]
 * @param {string} [options.codeVerifier]
 * @param {string} [options.redirectUri]
 * @param {string} [options.clientId]
 * @param {string} [options.clientSecret]
 * @param {Function} [options.fetchImpl=fetch]
 * @param {number} [options.timeoutMs=8000]
 * @param {Object} [env=process.env]
 * @returns {Promise<Object>} Token payload containing accessToken, tokenType, etc.
 */
export async function exchangeCodeForTokens(
  provider,
  code,
  options = {},
  env = process.env
) {
  if (!code || typeof code !== 'string') {
    throw new Error('Authorization code is required for token exchange.');
  }

  const config = getProviderConfig(provider, env);
  const clientId = options.clientId || config.clientId;
  const clientSecret = options.clientSecret || config.clientSecret;
  const redirectUri = options.redirectUri || config.redirectUri;
  const fetchFn = options.fetchImpl || fetch;
  const timeoutMs = options.timeoutMs || 8000;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    let response;

    if (config.id === 'google' || config.id === 'discord') {
      const bodyParams = new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'authorization_code',
        code: code.trim(),
        redirect_uri: redirectUri
      });

      if (config.supportsPkce && options.codeVerifier) {
        bodyParams.set('code_verifier', options.codeVerifier);
      }

      response = await fetchFn(config.tokenEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Accept: 'application/json'
        },
        body: bodyParams.toString(),
        signal: controller.signal
      });
    } else if (config.id === 'facebook') {
      const bodyParams = new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        code: code.trim(),
        redirect_uri: redirectUri
      });

      response = await fetchFn(config.tokenEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Accept: 'application/json'
        },
        body: bodyParams.toString(),
        signal: controller.signal
      });
    }

    if (!response.ok) {
      let errorBody = '';
      try {
        errorBody = await response.text();
      } catch {
        // ignore
      }
      const error = new Error(`Token exchange failed for ${provider}: HTTP ${response.status} - ${errorBody}`);
      error.status = response.status;
      error.details = errorBody;
      throw error;
    }

    const data = await response.json();
    return {
      accessToken: data.access_token,
      access_token: data.access_token,
      tokenType: data.token_type || 'Bearer',
      expiresIn: data.expires_in || null,
      idToken: data.id_token || null,
      scope: data.scope || null,
      raw: data
    };
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Fetches user profile from the provider and normalizes it into standard shape:
 * { providerUserId, email, emailVerified, name, avatarUrl }
 *
 * @param {string} provider
 * @param {string} accessToken
 * @param {Object} [options]
 * @param {Function} [options.fetchImpl=fetch]
 * @param {number} [options.timeoutMs=8000]
 * @param {Object} [env=process.env]
 * @returns {Promise<{ provider: string, providerUserId: string, email: string|null, emailVerified: boolean, name: string, avatarUrl: string|null, raw: Object }>}
 */
export async function fetchUserProfile(
  provider,
  accessToken,
  options = {},
  env = process.env
) {
  if (!accessToken || typeof accessToken !== 'string') {
    throw new Error('Access token is required to fetch user profile.');
  }

  const config = getProviderConfig(provider, env);
  const fetchFn = options.fetchImpl || fetch;
  const timeoutMs = options.timeoutMs || 8000;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetchFn(config.userInfoEndpoint, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/json'
      },
      signal: controller.signal
    });

    if (!response.ok) {
      let errorBody = '';
      try {
        errorBody = await response.text();
      } catch {
        // ignore
      }
      const error = new Error(`Failed to fetch user profile from ${provider}: HTTP ${response.status} - ${errorBody}`);
      error.status = response.status;
      error.details = errorBody;
      throw error;
    }

    const data = await response.json();

    if (config.id === 'google') {
      const email = data.email ? String(data.email).trim().toLowerCase() : null;
      return {
        provider: 'google',
        providerUserId: String(data.sub),
        email,
        emailVerified: Boolean(data.email_verified),
        name: data.name || data.given_name || (email ? email.split('@')[0] : 'Google User'),
        avatarUrl: data.picture ? String(data.picture) : null,
        raw: data
      };
    }

    if (config.id === 'discord') {
      const email = data.email ? String(data.email).trim().toLowerCase() : null;
      const avatarUrl = resolveDiscordAvatarUrl(data.id, data.avatar);
      return {
        provider: 'discord',
        providerUserId: String(data.id),
        email,
        emailVerified: Boolean(data.verified),
        name: data.global_name || data.username || (email ? email.split('@')[0] : 'Discord User'),
        avatarUrl,
        raw: data
      };
    }

    if (config.id === 'facebook') {
      const email = data.email ? String(data.email).trim().toLowerCase() : null;
      const avatarUrl = data.picture?.data?.url ? String(data.picture.data.url) : null;
      return {
        provider: 'facebook',
        providerUserId: String(data.id),
        email,
        emailVerified: Boolean(email),
        name: data.name || (email ? email.split('@')[0] : 'Facebook User'),
        avatarUrl,
        raw: data
      };
    }

    throw new Error(`Unhandled provider: ${provider}`);
  } finally {
    clearTimeout(timer);
  }
}

import { runBlogQuery, withBlogTransaction } from '../blog/db.mjs';

/**
 * Serializes a database user row into a normalized user model.
 * Supports both camelCase and snake_case properties for compatibility.
 *
 * @param {Object|null} row
 * @returns {Object|null}
 */
export function serializeUser(row) {
  if (!row) return null;
  const name = row.name || row.display_name || '';
  const displayName = row.display_name || row.name || '';

  return {
    id: String(row.id),
    name: String(name),
    displayName: String(displayName),
    display_name: String(displayName),
    email: row.email ? String(row.email) : null,
    passwordHash: row.password_hash || null,
    password_hash: row.password_hash || null,
    role: String(row.role || 'user'),
    isActive: row.is_active !== false,
    is_active: row.is_active !== false,
    sessionVersion: Number(row.session_version) || 1,
    session_version: Number(row.session_version) || 1,
    avatarUrl: row.avatar_url ? String(row.avatar_url) : null,
    avatar_url: row.avatar_url ? String(row.avatar_url) : null,
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : (row.created_at ? new Date(row.created_at).toISOString() : null),
    created_at: row.created_at instanceof Date ? row.created_at.toISOString() : (row.created_at ? new Date(row.created_at).toISOString() : null),
    updatedAt: row.updated_at instanceof Date ? row.updated_at.toISOString() : (row.updated_at ? new Date(row.updated_at).toISOString() : null),
    updated_at: row.updated_at instanceof Date ? row.updated_at.toISOString() : (row.updated_at ? new Date(row.updated_at).toISOString() : null)
  };
}

/**
 * Serializes an oauth_accounts row into a normalized account model.
 *
 * @param {Object|null} row
 * @returns {Object|null}
 */
export function serializeOAuthAccount(row) {
  if (!row) return null;

  return {
    id: String(row.id),
    userId: String(row.user_id),
    user_id: String(row.user_id),
    provider: String(row.provider),
    providerUserId: String(row.provider_user_id),
    provider_user_id: String(row.provider_user_id),
    email: row.email ? String(row.email) : null,
    displayName: row.display_name ? String(row.display_name) : null,
    display_name: row.display_name ? String(row.display_name) : null,
    avatarUrl: row.avatar_url ? String(row.avatar_url) : null,
    avatar_url: row.avatar_url ? String(row.avatar_url) : null,
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : (row.created_at ? new Date(row.created_at).toISOString() : null),
    created_at: row.created_at instanceof Date ? row.created_at.toISOString() : (row.created_at ? new Date(row.created_at).toISOString() : null),
    updatedAt: row.updated_at instanceof Date ? row.updated_at.toISOString() : (row.updated_at ? new Date(row.updated_at).toISOString() : null),
    updated_at: row.updated_at instanceof Date ? row.updated_at.toISOString() : (row.updated_at ? new Date(row.updated_at).toISOString() : null)
  };
}

/**
 * Serializes a sessions row into a normalized session model.
 *
 * @param {Object|null} row
 * @returns {Object|null}
 */
export function serializeSession(row) {
  if (!row) return null;

  return {
    id: String(row.id),
    userId: String(row.user_id),
    user_id: String(row.user_id),
    sessionToken: String(row.session_token),
    session_token: String(row.session_token),
    userAgent: row.user_agent ? String(row.user_agent) : null,
    user_agent: row.user_agent ? String(row.user_agent) : null,
    ipAddress: row.ip_address ? String(row.ip_address) : null,
    ip_address: row.ip_address ? String(row.ip_address) : null,
    expiresAt: row.expires_at instanceof Date ? row.expires_at.toISOString() : (row.expires_at ? new Date(row.expires_at).toISOString() : null),
    expires_at: row.expires_at instanceof Date ? row.expires_at.toISOString() : (row.expires_at ? new Date(row.expires_at).toISOString() : null),
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : (row.created_at ? new Date(row.created_at).toISOString() : null),
    created_at: row.created_at instanceof Date ? row.created_at.toISOString() : (row.created_at ? new Date(row.created_at).toISOString() : null),
    updatedAt: row.updated_at instanceof Date ? row.updated_at.toISOString() : (row.updated_at ? new Date(row.updated_at).toISOString() : null),
    updated_at: row.updated_at instanceof Date ? row.updated_at.toISOString() : (row.updated_at ? new Date(row.updated_at).toISOString() : null)
  };
}

/**
 * Finds a user by their UUID primary key.
 *
 * @param {string} userId
 * @param {Object} [options]
 * @returns {Promise<Object|null>}
 */
export async function findUserById(userId, options = {}) {
  if (!userId) return null;

  const query = `
    SELECT id, name, display_name, email, password_hash, role, is_active, session_version, avatar_url, created_at, updated_at
    FROM users
    WHERE id = $1
    LIMIT 1
  `;
  const result = await runBlogQuery(query, [userId], options);
  return serializeUser(result.rows[0]);
}

/**
 * Finds a user by email address (case-insensitive).
 *
 * @param {string} email
 * @param {Object} [options]
 * @returns {Promise<Object|null>}
 */
export async function findUserByEmail(email, options = {}) {
  if (!email || typeof email !== 'string') return null;
  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail) return null;

  const query = `
    SELECT id, name, display_name, email, password_hash, role, is_active, session_version, avatar_url, created_at, updated_at
    FROM users
    WHERE LOWER(email) = $1
    LIMIT 1
  `;
  const result = await runBlogQuery(query, [normalizedEmail], options);
  return serializeUser(result.rows[0]);
}

/**
 * Finds an OAuth account by provider and providerUserId.
 *
 * @param {string} provider ('google' | 'discord' | 'facebook')
 * @param {string} providerUserId
 * @param {Object} [options]
 * @returns {Promise<Object|null>}
 */
export async function findOAuthAccount(provider, providerUserId, options = {}) {
  if (!provider || !providerUserId) return null;

  const query = `
    SELECT id, user_id, provider, provider_user_id, email, display_name, avatar_url, created_at, updated_at
    FROM oauth_accounts
    WHERE provider = $1 AND provider_user_id = $2
    LIMIT 1
  `;
  const result = await runBlogQuery(query, [String(provider), String(providerUserId)], options);
  return serializeOAuthAccount(result.rows[0]);
}

/**
 * Atomically creates a new user and links an OAuth account in a single transaction.
 *
 * @param {Object} params
 * @param {string} [params.email]
 * @param {string} [params.name]
 * @param {string} [params.avatarUrl]
 * @param {string} params.provider
 * @param {string} params.providerUserId
 * @param {Object} [options]
 * @returns {Promise<Object>} The newly created user
 */
export async function createOAuthUserWithAccount(
  { email, name, avatarUrl, provider, providerUserId },
  options = {}
) {
  if (!provider || !providerUserId) {
    throw new Error('provider and providerUserId are required to create an OAuth user account.');
  }

  const normalizedEmail = email && typeof email === 'string' && email.trim() ? email.trim().toLowerCase() : null;
  const resolvedDisplayName = (name && String(name).trim()) || (normalizedEmail ? normalizedEmail.split('@')[0] : 'Zenith User');
  const resolvedAvatarUrl = (avatarUrl && String(avatarUrl).trim()) || null;

  const execute = async (client) => {
    const insertUserQuery = `
      INSERT INTO users (name, display_name, email, role, avatar_url, is_active)
      VALUES ($1, $2, $3, 'user', $4, TRUE)
      RETURNING id, name, display_name, email, password_hash, role, is_active, session_version, avatar_url, created_at, updated_at
    `;
    const userRes = await client.query(insertUserQuery, [
      resolvedDisplayName,
      resolvedDisplayName,
      normalizedEmail,
      resolvedAvatarUrl
    ]);
    const userRow = userRes.rows[0];

    const insertAccountQuery = `
      INSERT INTO oauth_accounts (user_id, provider, provider_user_id, email, display_name, avatar_url)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, user_id, provider, provider_user_id, email, display_name, avatar_url, created_at, updated_at
    `;
    await client.query(insertAccountQuery, [
      userRow.id,
      String(provider),
      String(providerUserId),
      normalizedEmail,
      resolvedDisplayName,
      resolvedAvatarUrl
    ]);

    return serializeUser(userRow);
  };

  if (options.client) {
    return execute(options.client);
  }

  return withBlogTransaction(execute, options);
}

/**
 * Links a new OAuth account to an existing user.
 * Prevents account collision if the OAuth identity is already bound to another user.
 *
 * @param {string} userId
 * @param {Object} params
 * @param {string} params.provider
 * @param {string} params.providerUserId
 * @param {string} [params.email]
 * @param {string} [params.displayName]
 * @param {string} [params.avatarUrl]
 * @param {Object} [options]
 * @returns {Promise<Object>} The linked OAuth account
 */
export async function linkOAuthAccount(
  userId,
  { provider, providerUserId, email, displayName, avatarUrl },
  options = {}
) {
  if (!userId) {
    throw new Error('userId is required to link an OAuth account.');
  }
  if (!provider || !providerUserId) {
    throw new Error('provider and providerUserId are required to link an OAuth account.');
  }

  const normalizedEmail = email && typeof email === 'string' && email.trim() ? email.trim().toLowerCase() : null;
  const resolvedDisplayName = (displayName && String(displayName).trim()) || null;
  const resolvedAvatarUrl = (avatarUrl && String(avatarUrl).trim()) || null;

  const execute = async (client) => {
    // 1. Check if identity is already linked to anyone
    const checkQuery = `
      SELECT id, user_id, provider, provider_user_id, email, display_name, avatar_url, created_at, updated_at
      FROM oauth_accounts
      WHERE provider = $1 AND provider_user_id = $2
      LIMIT 1
    `;
    const checkRes = await client.query(checkQuery, [String(provider), String(providerUserId)]);

    if (checkRes.rows.length > 0) {
      const existing = checkRes.rows[0];
      if (String(existing.user_id) !== String(userId)) {
        const error = new Error(`Provider account ${provider} is already linked to another Zenith account.`);
        error.code = 'ACCOUNT_ALREADY_LINKED';
        throw error;
      }

      // Already linked to this user: update details if provided
      const updateQuery = `
        UPDATE oauth_accounts
        SET
          email = COALESCE($3, email),
          display_name = COALESCE($4, display_name),
          avatar_url = COALESCE($5, avatar_url),
          updated_at = NOW()
        WHERE user_id = $1 AND provider = $2
        RETURNING id, user_id, provider, provider_user_id, email, display_name, avatar_url, created_at, updated_at
      `;
      const updateRes = await client.query(updateQuery, [
        String(userId),
        String(provider),
        normalizedEmail,
        resolvedDisplayName,
        resolvedAvatarUrl
      ]);
      return serializeOAuthAccount(updateRes.rows[0]);
    }

    // 2. Insert new linked account
    const insertQuery = `
      INSERT INTO oauth_accounts (user_id, provider, provider_user_id, email, display_name, avatar_url)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, user_id, provider, provider_user_id, email, display_name, avatar_url, created_at, updated_at
    `;
    const insertRes = await client.query(insertQuery, [
      String(userId),
      String(provider),
      String(providerUserId),
      normalizedEmail,
      resolvedDisplayName,
      resolvedAvatarUrl
    ]);

    // Also update users avatar_url if the user doesn't already have one
    if (resolvedAvatarUrl) {
      await client.query(
        `UPDATE users SET avatar_url = $2, updated_at = NOW() WHERE id = $1 AND (avatar_url IS NULL OR avatar_url = '')`,
        [String(userId), resolvedAvatarUrl]
      );
    }

    return serializeOAuthAccount(insertRes.rows[0]);
  };

  if (options.client) {
    return execute(options.client);
  }

  return withBlogTransaction(execute, options);
}

/**
 * Retrieves all linked OAuth accounts for a given user.
 *
 * @param {string} userId
 * @param {Object} [options]
 * @returns {Promise<Array<{ provider: string, providerUserId: string, displayName: string|null, avatarUrl: string|null, createdAt: string|null }>>}
 */
export async function getLinkedAccounts(userId, options = {}) {
  if (!userId) return [];

  const query = `
    SELECT provider, provider_user_id, display_name, avatar_url, created_at
    FROM oauth_accounts
    WHERE user_id = $1
    ORDER BY created_at ASC
  `;
  const result = await runBlogQuery(query, [String(userId)], options);

  return result.rows.map((row) => ({
    provider: String(row.provider),
    providerUserId: String(row.provider_user_id),
    provider_user_id: String(row.provider_user_id),
    displayName: row.display_name ? String(row.display_name) : null,
    display_name: row.display_name ? String(row.display_name) : null,
    avatarUrl: row.avatar_url ? String(row.avatar_url) : null,
    avatar_url: row.avatar_url ? String(row.avatar_url) : null,
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : (row.created_at ? new Date(row.created_at).toISOString() : null),
    created_at: row.created_at instanceof Date ? row.created_at.toISOString() : (row.created_at ? new Date(row.created_at).toISOString() : null)
  }));
}

/**
 * Unlinks an OAuth account from a user.
 * Enforces security rule: cannot unlink if user has no password and this is their only provider.
 *
 * @param {string} userId
 * @param {string} provider
 * @param {Object} [options]
 * @returns {Promise<boolean>}
 */
export async function unlinkOAuthAccount(userId, provider, options = {}) {
  if (!userId || !provider) return false;

  const execute = async (client) => {
    // 1. Fetch user to check password status
    const userRes = await client.query(
      `SELECT id, password_hash FROM users WHERE id = $1 LIMIT 1`,
      [String(userId)]
    );
    if (!userRes.rows.length) {
      return false;
    }
    const user = userRes.rows[0];
    const hasPassword = Boolean(user.password_hash && String(user.password_hash).trim());

    // 2. Count remaining distinct providers that are NOT the provider being unlinked
    const countRes = await client.query(
      `SELECT COUNT(DISTINCT provider)::int AS remaining_providers FROM oauth_accounts WHERE user_id = $1 AND provider <> $2`,
      [String(userId), String(provider)]
    );
    const remainingProviders = Number(countRes.rows[0]?.remaining_providers) || 0;

    // 3. Prevent unlinking if it leaves the user without any authentication method
    if (!hasPassword && remainingProviders === 0) {
      const error = new Error('Cannot disconnect your only authentication method.');
      error.code = 'CANNOT_UNLINK_SOLE_IDENTITY';
      throw error;
    }

    // 4. Delete the provider row
    const deleteRes = await client.query(
      `DELETE FROM oauth_accounts WHERE user_id = $1 AND provider = $2`,
      [String(userId), String(provider)]
    );

    return (deleteRes.rowCount || 0) > 0;
  };

  if (options.client) {
    return execute(options.client);
  }

  return withBlogTransaction(execute, options);
}

/**
 * Creates a new session in the database.
 *
 * @param {string} userId
 * @param {string} sessionToken
 * @param {Date|string|number} expiresAt
 * @param {Object} [options]
 * @param {string} [options.userAgent]
 * @param {string} [options.ipAddress]
 * @returns {Promise<Object>}
 */
export async function createSession(userId, sessionToken, expiresAt, options = {}) {
  if (!userId) {
    throw new Error('userId is required to create a session.');
  }
  if (!sessionToken) {
    throw new Error('sessionToken is required to create a session.');
  }
  if (!expiresAt) {
    throw new Error('expiresAt is required to create a session.');
  }

  const expDate = expiresAt instanceof Date ? expiresAt : new Date(expiresAt);
  if (Number.isNaN(expDate.getTime())) {
    throw new Error('expiresAt must be a valid date.');
  }

  const userAgent = options.userAgent ? String(options.userAgent) : null;
  const ipAddress = options.ipAddress ? String(options.ipAddress) : null;

  const query = `
    INSERT INTO sessions (user_id, session_token, user_agent, ip_address, expires_at)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING id, user_id, session_token, user_agent, ip_address, expires_at, created_at, updated_at
  `;
  const result = await runBlogQuery(
    query,
    [String(userId), String(sessionToken), userAgent, ipAddress, expDate],
    options
  );

  return serializeSession(result.rows[0]);
}

/**
 * Finds an active (unexpired) session and its associated active user.
 *
 * @param {string} sessionToken
 * @param {Object} [options]
 * @returns {Promise<{ session: Object, user: Object }|null>}
 */
export async function findSession(sessionToken, options = {}) {
  if (!sessionToken || typeof sessionToken !== 'string') return null;

  const query = `
    SELECT
      s.id AS session_id,
      s.user_id AS session_user_id,
      s.session_token,
      s.user_agent,
      s.ip_address,
      s.expires_at,
      s.created_at AS session_created_at,
      s.updated_at AS session_updated_at,
      u.id AS user_id,
      u.name,
      u.display_name,
      u.email,
      u.password_hash,
      u.role,
      u.is_active,
      u.session_version,
      u.avatar_url,
      u.created_at AS user_created_at,
      u.updated_at AS user_updated_at
    FROM sessions s
    INNER JOIN users u ON u.id = s.user_id
    WHERE s.session_token = $1 AND s.expires_at > NOW()
    LIMIT 1
  `;
  const result = await runBlogQuery(query, [sessionToken.trim()], options);
  if (!result.rows.length) return null;

  const row = result.rows[0];
  if (row.is_active === false) return null;

  return {
    session: serializeSession({
      id: row.session_id,
      user_id: row.session_user_id,
      session_token: row.session_token,
      user_agent: row.user_agent,
      ip_address: row.ip_address,
      expires_at: row.expires_at,
      created_at: row.session_created_at,
      updated_at: row.session_updated_at
    }),
    user: serializeUser({
      id: row.user_id,
      name: row.name,
      display_name: row.display_name,
      email: row.email,
      password_hash: row.password_hash,
      role: row.role,
      is_active: row.is_active,
      session_version: row.session_version,
      avatar_url: row.avatar_url,
      created_at: row.user_created_at,
      updated_at: row.user_updated_at
    })
  };
}

/**
 * Deletes a session by its token (revocation/logout).
 *
 * @param {string} sessionToken
 * @param {Object} [options]
 * @returns {Promise<boolean>}
 */
export async function deleteSession(sessionToken, options = {}) {
  if (!sessionToken || typeof sessionToken !== 'string') return false;

  const query = `
    DELETE FROM sessions
    WHERE session_token = $1
  `;
  const result = await runBlogQuery(query, [sessionToken.trim()], options);
  return (result.rowCount || 0) > 0;
}

/**
 * Deletes all active sessions for a given user (global logout).
 *
 * @param {string} userId
 * @param {Object} [options]
 * @returns {Promise<number>} Number of sessions revoked
 */
export async function deleteUserSessions(userId, options = {}) {
  if (!userId) return 0;

  const query = `
    DELETE FROM sessions
    WHERE user_id = $1
  `;
  const result = await runBlogQuery(query, [String(userId)], options);
  return result.rowCount || 0;
}

/**
 * Purges expired sessions from the database.
 *
 * @param {Object} [options]
 * @returns {Promise<number>} Number of purged rows
 */
export async function purgeExpiredSessions(options = {}) {
  const query = `
    DELETE FROM sessions
    WHERE expires_at < NOW()
  `;
  const result = await runBlogQuery(query, [], options);
  return result.rowCount || 0;
}

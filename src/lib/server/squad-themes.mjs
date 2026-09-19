import { runBlogQuery } from './blog/db.mjs';

function toText(value, fallback = '') {
  if (value === undefined || value === null) return fallback;
  return String(value).trim();
}

function serializeThemeRow(row) {
  if (!row?.id) return null;
  return {
    id: toText(row.id),
    name: toText(row.name),
    backgroundUrl: toText(row.background_url),
    className: toText(row.class_name),
    createdAt: row.created_at ? new Date(row.created_at).toISOString() : null,
    updatedAt: row.updated_at ? new Date(row.updated_at).toISOString() : null
  };
}

export async function listSquadThemes(options = {}) {
  const query = `
    SELECT id, name, background_url, class_name, created_at, updated_at
    FROM squad_themes
    ORDER BY created_at ASC
  `;
  try {
    const result = await runBlogQuery(query, [], options);
    return result.rows.map(serializeThemeRow).filter(Boolean);
  } catch (error) {
    if (error.code === '42P01' || (error.message && error.message.includes('does not exist'))) {
      return []; // Table not created yet
    }
    throw error;
  }
}

export async function createSquadTheme({ name, backgroundUrl, className = '' }, options = {}) {
  const id = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now();
  
  const query = `
    INSERT INTO squad_themes (id, name, background_url, class_name)
    VALUES ($1, $2, $3, $4)
    RETURNING id, name, background_url, class_name, created_at, updated_at
  `;
  try {
    const result = await runBlogQuery(query, [id, name, backgroundUrl, className], options);
    return serializeThemeRow(result.rows[0]);
  } catch (error) {
    if (error.code === '42P01') {
      throw new Error('squad_themes table is not configured. Run migrations first.');
    }
    throw error;
  }
}

export async function deleteSquadTheme(id, options = {}) {
  const query = `DELETE FROM squad_themes WHERE id = $1 RETURNING id`;
  try {
    const result = await runBlogQuery(query, [id], options);
    if (result.rows.length === 0) {
      throw new Error(`Theme with id ${id} not found.`);
    }
    return true;
  } catch (error) {
    throw error;
  }
}

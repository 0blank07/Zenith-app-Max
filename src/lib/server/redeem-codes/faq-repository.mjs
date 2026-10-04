import { runBlogQuery } from '../blog/db.mjs';

export async function getAllFaqs() {
  const result = await runBlogQuery(`
    SELECT * FROM redeem_faqs
    ORDER BY scope ASC, order_index ASC, id DESC
  `);
  return result.rows;
}

export async function getFaqsByScope(scope) {
  const normalized = String(scope || '').toLowerCase().trim();
  const aliases = [normalized];
  if (normalized === 'th' || normalized === 'thailand') aliases.push('th', 'thailand');
  if (normalized === 'ae' || normalized === 'uae') aliases.push('ae', 'uae');
  if (normalized === 'es' || normalized === 'spain') aliases.push('es', 'spain');
  const uniqueScopes = [...new Set(aliases)];

  const result = await runBlogQuery(`
    SELECT * FROM redeem_faqs
    WHERE scope = ANY($1)
    ORDER BY order_index ASC, id DESC
  `, [uniqueScopes]);
  return result.rows;
}

export async function getFaqById(id) {
  const result = await runBlogQuery(`
    SELECT * FROM redeem_faqs
    WHERE id = $1
  `, [id]);
  return result.rows[0] || null;
}

export async function createFaq(data) {
  const result = await runBlogQuery(`
    INSERT INTO redeem_faqs (scope, question, answer, order_index)
    VALUES ($1, $2, $3, $4)
    RETURNING *
  `, [data.scope, data.question, data.answer, data.order_index || 0]);
  return result.rows[0];
}

export async function updateFaq(id, data) {
  const result = await runBlogQuery(`
    UPDATE redeem_faqs
    SET scope = $1, question = $2, answer = $3, order_index = $4, updated_at = CURRENT_TIMESTAMP
    WHERE id = $5
    RETURNING *
  `, [data.scope, data.question, data.answer, data.order_index || 0, id]);
  return result.rows[0];
}

export async function deleteFaq(id) {
  await runBlogQuery(`
    DELETE FROM redeem_faqs
    WHERE id = $1
  `, [id]);
}

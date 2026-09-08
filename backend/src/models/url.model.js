import { getDB } from "../config/db.js";

export const UrlModel = {
  async createUrl(userId, originalUrl, shortCode, customAlias, expiresAt, title = null) {
    const db = getDB();
    const query = `
      INSERT INTO urls (user_id, original_url, short_code, custom_alias, expires_at, title)
      VALUES ($1, $2, $3, $4, $5, COALESCE($6, 'Untitled'))
      RETURNING id, short_code, original_url, custom_alias, title, expires_at, created_at;
    `;
    const values = [userId, originalUrl, shortCode, customAlias, expiresAt, title];
    const result = await db.query(query, values);
    return result.rows[0];
  },

  async getUrlByShortCode(shortCode) {
    const db = getDB();
    const result = await db.query(`SELECT * FROM urls WHERE short_code = $1;`, [shortCode]);
    return result.rows[0];
  },

  async getUrlById(id) {
    const db = getDB();
    const result = await db.query(`SELECT * FROM urls WHERE id = $1;`, [id]);
    return result.rows[0];
  },

  async getUrlsByUser(userId) {
    const db = getDB();
    const result = await db.query(
      `SELECT * FROM urls WHERE user_id = $1 ORDER BY created_at DESC;`,
      [userId]
    );
    return result.rows;
  },

  async incrementClick(shortCode) {
    const db = getDB();
    await db.query(`UPDATE urls SET total_clicks = total_clicks + 1 WHERE short_code = $1;`, [shortCode]);
  },

  async deleteUrl(id) {
    const db = getDB();
    await db.query(`DELETE FROM urls WHERE id = $1;`, [id]);
    return { message: `URL ${id} deleted` };
  },
};

import { getDB } from "../config/db.js";

export const ClickModel = {
  async recordClick(urlId, ipAddress, country, deviceType, referrer) {
    const db = getDB();
    const query = `
      INSERT INTO clicks (url_id, ip_address, country, device_type, referrer)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, created_at;
    `;
    const values = [urlId, ipAddress, country, deviceType, referrer];
    const result = await db.query(query, values);
    return result.rows[0];
  },

  async getClicksByUrl(urlId) {
    const db = getDB();
    const result = await db.query(`SELECT * FROM clicks WHERE url_id = $1;`, [urlId]);
    return result.rows;
  },

  async getAnalyticsByUrl(urlId) {
    const db = getDB();
    const query = `
      SELECT 
        COUNT(*) AS total_clicks,
        COUNT(DISTINCT country) AS unique_countries,
        COUNT(DISTINCT ip_address) AS unique_users
      FROM clicks
      WHERE url_id = $1;
    `;
    const result = await db.query(query, [urlId]);
    return result.rows[0];
  },
};

import { getDB } from "../config/db.js";

export const ClickModel = {
  async recordClick(urlId, ipAddress, country, deviceType, referrer) {
    const db = getDB();
    const query = `
      INSERT INTO clicks (url_id, ip_address, country, device_type, referrer)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, clicked_at;
    `;
    const values = [urlId, ipAddress, country, deviceType, referrer];
    const result = await db.query(query, values);
    return result.rows[0];
  },

  async getTotalClicksByUrl(urlId) {
    const db = getDB();
    const result = await db.query(`SELECT * FROM clicks WHERE url_id = $1;`, [urlId]);
    return result.rows;
  },

  async getCountsByUrl(urlId) {
    const db = getDB();
    const query = `
    SELECT 
      COUNT(*) AS total_clicks,
      COUNT(DISTINCT country) AS unique_countries,
      COUNT(DISTINCT ip_address) AS unique_users,
      COUNT(DISTINCT device_type) AS unique_devices,
      COUNT(DISTINCT referrer) AS unique_referrers
    FROM clicks
    WHERE url_id = $1;
  `;
    const result = await db.query(query, [urlId]);
    return result.rows[0];
  },

  async getCountryStats(urlId) {
    const db = getDB();
    const result = await db.query(
      `SELECT country, COUNT(*) AS total
       FROM clicks
       WHERE url_id = $1
       GROUP BY country`,
      [urlId]
    );
    return result.rows;
  },

  async getDeviceStats(urlId) {
    const db = getDB();
    const result = await db.query(
      `SELECT device_type, COUNT(*) AS total
       FROM clicks
       WHERE url_id = $1
       GROUP BY device_type`,
      [urlId]
    );
    return result.rows;
  },

  async getReferrerStats(urlId) {
    const db = getDB();
    const result = await db.query(
      `SELECT referrer, COUNT(*) AS total
       FROM clicks
       WHERE url_id = $1
       GROUP BY referrer`,
      [urlId]
    );
    return result.rows;
  }
};

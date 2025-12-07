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

  async getOverview(urlId) {
    const db = getDB();
    
    const urlDetailsQuery = `
      SELECT 
        id,
        original_url,
        short_code,
        custom_alias,
        created_at,
        total_clicks
      FROM urls
      WHERE id = $1
      LIMIT 1;
    `;
    const summaryQuery = `
    SELECT 
      COUNT(*) AS total_clicks,
      COUNT(DISTINCT ip_address) AS unique_users,
      COUNT(DISTINCT country) AS unique_countries,
      COUNT(DISTINCT device_type) AS unique_devices,
      COUNT(DISTINCT referrer) AS unique_referrers
    FROM clicks
    WHERE url_id = $1;
  `;

    const dailyQuery = `
    SELECT DATE(clicked_at) AS day, COUNT(*) AS clicks
    FROM clicks
    WHERE url_id = $1
    GROUP BY day
    ORDER BY day ASC;
  `;

    const deviceQuery = `
    SELECT device_type, COUNT(*) AS total
    FROM clicks
    WHERE url_id = $1
    GROUP BY device_type;
  `;

    const countryQuery = `
    SELECT country, COUNT(*) AS total
    FROM clicks
    WHERE url_id = $1
    GROUP BY country;
  `;

    const referrerQuery = `
    SELECT referrer, COUNT(*) AS total
    FROM clicks
    WHERE url_id = $1
    GROUP BY referrer;
  `;

    const [urlDetails, summary, daily, devices, countries, referrers] = await Promise.all([
      db.query(urlDetailsQuery, [urlId]),
      db.query(summaryQuery, [urlId]),
      db.query(dailyQuery, [urlId]),
      db.query(deviceQuery, [urlId]),
      db.query(countryQuery, [urlId]),
      db.query(referrerQuery, [urlId])
    ]);

    return {
      url: urlDetails.rows[0],
      summary: summary.rows[0],
      daily: daily.rows,
      devices: devices.rows,
      countries: countries.rows,
      referrers: referrers.rows,
    };
  },

  async getClicksGroupedByDate(urlId) {
    const db = getDB();
    const query = `
      SELECT DATE(clicked_at) AS date, COUNT(*) AS clicks
      FROM clicks
      WHERE url_id = $1
      GROUP BY DATE(clicked_at)
      ORDER BY DATE(clicked_at) ASC;
    `;
    const values = [urlId];
    const result = await db.query(query, values);
    return result.rows;
  }

};

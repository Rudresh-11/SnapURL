import { getDB } from "../config/db.js";

export const UserModel = {
  async createUser(username, email, passwordHash) {
    const db = getDB();
    const query = `
      INSERT INTO users (username, email, password_hash)
      VALUES ($1, $2, $3)
      RETURNING id, username, email, created_at;
    `;
    const values = [username, email, passwordHash];
    const result = await db.query(query, values);
    return result.rows[0];
  },
  async createGoogleUser({ username, email, googleId, provider }) {
    const db = getDB();
    const query = `
    INSERT INTO users (username, email, provider, google_id)
    VALUES ($1, $2, $3, $4)
    RETURNING id, username, email, provider, google_id, created_at;
  `;
    const values = [username, email, provider, googleId];
    const result = await db.query(query, values);
    return result.rows[0];
  },

  async getUserByUsername(username) {
    const db = getDB();
    const query = `SELECT * FROM users WHERE username = $1;`;
    const result = await db.query(query, [username]);
    return result.rows[0];
  },

  async getUserByEmail(email) {
    const db = getDB();
    const query = `SELECT * FROM users WHERE email = $1;`;
    const result = await db.query(query, [email]);
    return result.rows[0];
  },

  async getUserById(id) {
    const db = getDB();
    const query = `SELECT * FROM users WHERE id = $1;`;
    const result = await db.query(query, [id]);
    return result.rows[0];
  },

  async getAllUsers() {
    const db = getDB();
    const query = `SELECT id, username, email, created_at FROM users;`;
    const result = await db.query(query);
    return result.rows;
  },

  async updateTokens(userId, accessToken, refreshToken) {
    const db = getDB();
    const query = `
      UPDATE users
      SET access_token = $1, refresh_token = $2, updated_at = NOW()
      WHERE id = $3
      RETURNING id, username, email, access_token, refresh_token;
    `;
    const values = [accessToken, refreshToken, userId];
    const result = await db.query(query, values);
    return result.rows[0];
  },

  async clearTokens(userId) {
    const db = getDB();
    const query = `
      UPDATE users
      SET refresh_token = NULL, updated_at = NOW()
      WHERE id = $1;
    `;
    await db.query(query, [userId]);
    return { message: `Tokens cleared for user ${userId}` };
  },

  async deleteUser(id) {
    const db = getDB();
    const query = `DELETE FROM users WHERE id = $1;`;
    await db.query(query, [id]);
    return { message: `User ${id} deleted` };
  },
async getUserUrlStats({ userId, from, to, urlId }) {
  const db = getDB();

  if (!userId) throw new Error("userId is required");
  if (!from || !to) throw new Error("from/to are required");

  const params = [userId, from, to];

  let extraWhereSql = "";
  if (urlId !== undefined && urlId !== null && urlId !== "") {
    params.push(Number(urlId));
    extraWhereSql = ` AND u.id = $${params.length}`;
  }

  const totalEngagementsQ = `
    SELECT COUNT(c.id)::int AS engagements
    FROM urls u
    LEFT JOIN clicks c
      ON c.url_id = u.id
     AND c.clicked_at >= $2
     AND c.clicked_at <= $3
    WHERE u.user_id = $1
    ${extraWhereSql};
  `;

  const engagementsOverTimeQ = `
    SELECT
      DATE(c.clicked_at) AS date,
      COUNT(*)::int AS engagements
    FROM urls u
    JOIN clicks c ON c.url_id = u.id
    WHERE u.user_id = $1
      AND c.clicked_at >= $2
      AND c.clicked_at <= $3
      ${extraWhereSql}
    GROUP BY DATE(c.clicked_at)
    ORDER BY DATE(c.clicked_at) ASC;
  `;

  const topPerformingDateQ = `
    SELECT
      DATE(c.clicked_at) AS date,
      COUNT(*)::int AS engagements
    FROM urls u
    JOIN clicks c ON c.url_id = u.id
    WHERE u.user_id = $1
      AND c.clicked_at >= $2
      AND c.clicked_at <= $3
      ${extraWhereSql}
    GROUP BY DATE(c.clicked_at)
    ORDER BY engagements DESC
    LIMIT 1;
  `;

  const engagementsByDeviceQ = `
    SELECT
      COALESCE(NULLIF(TRIM(c.device_type), ''), 'Unknown') AS device,
      COUNT(*)::int AS engagements
    FROM urls u
    JOIN clicks c ON c.url_id = u.id
    WHERE u.user_id = $1
      AND c.clicked_at >= $2
      AND c.clicked_at <= $3
      ${extraWhereSql}
    GROUP BY COALESCE(NULLIF(TRIM(c.device_type), ''), 'Unknown')
    ORDER BY engagements DESC;
  `;

  const engagementsByReferrerQ = `
    SELECT
      COALESCE(NULLIF(TRIM(c.referrer), ''), 'Direct') AS referrer,
      COUNT(*)::int AS engagements
    FROM urls u
    JOIN clicks c ON c.url_id = u.id
    WHERE u.user_id = $1
      AND c.clicked_at >= $2
      AND c.clicked_at <= $3
      ${extraWhereSql}
    GROUP BY COALESCE(NULLIF(TRIM(c.referrer), ''), 'Direct')
    ORDER BY engagements DESC;
  `;

  const engagementsByCountryQ = `
    SELECT
      COALESCE(NULLIF(TRIM(c.country), ''), 'Unknown') AS country,
      COUNT(*)::int AS engagements
    FROM urls u
    JOIN clicks c ON c.url_id = u.id
    WHERE u.user_id = $1
      AND c.clicked_at >= $2
      AND c.clicked_at <= $3
      ${extraWhereSql}
    GROUP BY COALESCE(NULLIF(TRIM(c.country), ''), 'Unknown')
    ORDER BY engagements DESC;
  `;

  const topLocationQ = `
    SELECT
      COALESCE(NULLIF(TRIM(c.country), ''), 'Unknown') AS country,
      COUNT(*)::int AS engagements
    FROM urls u
    JOIN clicks c ON c.url_id = u.id
    WHERE u.user_id = $1
      AND c.clicked_at >= $2
      AND c.clicked_at <= $3
      ${extraWhereSql}
    GROUP BY COALESCE(NULLIF(TRIM(c.country), ''), 'Unknown')
    ORDER BY engagements DESC
    LIMIT 1;
  `;

  const perUrlStatsQ = `
    SELECT
      u.id,
      u.title,
      u.original_url,
      u.short_code,
      u.custom_alias,
      u.expires_at,
      u.total_clicks,
      u.created_at,
      COUNT(c.id)::int AS engagements_in_range
    FROM urls u
    LEFT JOIN clicks c
      ON c.url_id = u.id
     AND c.clicked_at >= $2
     AND c.clicked_at <= $3
    WHERE u.user_id = $1
    ${extraWhereSql}
    GROUP BY u.id
    ORDER BY engagements_in_range DESC, u.created_at DESC;
  `;

  const [
    totalEngagementsR,
    engagementsOverTimeR,
    topPerformingDateR,
    byDeviceR,
    byReferrerR,
    byCountryR,
    topLocationR,
    perUrlR,
  ] = await Promise.all([
    db.query(totalEngagementsQ, params),
    db.query(engagementsOverTimeQ, params),
    db.query(topPerformingDateQ, params),
    db.query(engagementsByDeviceQ, params),
    db.query(engagementsByReferrerQ, params),
    db.query(engagementsByCountryQ, params),
    db.query(topLocationQ, params),
    db.query(perUrlStatsQ, params),
  ]);

  return {
    totals: {
      engagements: totalEngagementsR.rows?.[0]?.engagements ?? 0,
    },
    topPerformingDate: topPerformingDateR.rows?.[0] ?? null,
    engagementsOverTime: engagementsOverTimeR.rows ?? [],
    engagementsByDevice: byDeviceR.rows ?? [],
    engagementsByReferrer: byReferrerR.rows ?? [],
    topLocation: topLocationR.rows?.[0] ?? null,
    engagementsByLocation: {
      countries: byCountryR.rows ?? [],
      cities: [], // NOTE: clicks table has no city column in your migrations
    },
    urls: perUrlR.rows ?? [],
  };
},
};

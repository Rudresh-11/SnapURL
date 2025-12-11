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
};

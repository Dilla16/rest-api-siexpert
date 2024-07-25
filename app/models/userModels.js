const db = require("../../database");

const UserModel = {
  async createUser(sesa, name, email, hashedPassword, role, level) {
    const query = `
      INSERT INTO users (sesa, name, email, password, role, level)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    const values = [sesa, name, email, hashedPassword, role, level];
    const result = await db.query(query, values);
    return result.rows[0];
  },

  async getUsers() {
    const query = "SELECT * FROM users";
    const result = await db.query(query);
    return result.rows;
  },

  async deleteUserBySesa(sesa) {
    const query = "DELETE FROM users WHERE sesa = $1";
    const values = [sesa];
    return await db.query(query, values);
  },

  async updateUser(sesa, { name, email, role, level }) {
    const query = `
      UPDATE users
      SET 
        name = COALESCE($2, name),
        email = COALESCE($3, email),
        role = COALESCE($4, role),
        level = COALESCE($5, level)
      WHERE sesa = $1
      RETURNING *
    `;
    const values = [sesa, name, email, role, level];
    const result = await db.query(query, values);
    return result.rows[0];
  },

  async getUserBySesa(sesa) {
    const query = "SELECT * FROM users WHERE sesa = $1";
    const values = [sesa];
    const result = await db.query(query, values);
    return result.rows[0];
  },
};

module.exports = UserModel;

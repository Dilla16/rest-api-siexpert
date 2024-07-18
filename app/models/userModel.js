const client = require("../../database");

const UserModel = {
  async createUser(sesa, name, email, password, role, level) {
    const query = `
      INSERT INTO users (sesa, name, email, password, role, level)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *;
    `;
    const values = [sesa, name, email, password, role, level];

    try {
      const result = await client.query(query, values);
      return result.rows[0];
    } catch (error) {
      console.error("Error creating user:", error);
      throw error;
    }
  },

  async getUsers() {
    const query = `
      SELECT * FROM users;
    `;

    try {
      const result = await client.query(query);
      return result.rows;
    } catch (error) {
      console.error("Error fetching users:", error);
      throw error;
    }
  },

  async deleteUserBySesa(sesa) {
    const query = "DELETE FROM users WHERE sesa = $1";
    const values = [sesa];

    return await db.query(query, values);
  },

  async updateUser(sesa, { name, email, hashedPassword, role, level }) {
    const query = `
      UPDATE users
      SET 
        name = COALESCE($2, name),
        email = COALESCE($3, email),
        encrypted_password = COALESCE($4, encrypted_password),
        role = COALESCE($5, role),
        level = COALESCE($6, level)
      WHERE sesa = $1
      RETURNING *
    `;
    const values = [sesa, name, email, hashedPassword, role, level];

    const result = await db.query(query, values);
    return result.rows[0];
  },

  async findUserBySesa(sesa) {
    const query = "SELECT * FROM users WHERE sesa = $1";
    const values = [sesa];
    const result = await db.query(query, values);
    return result.rows[0];
  },
};

module.exports = UserModel;

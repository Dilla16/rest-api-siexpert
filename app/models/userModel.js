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
};

module.exports = UserModel;

const db = require("../../database");

const UserModel = {
  async createUser(sesa, name, email, password, role, level) {
    const query = `
      INSERT INTO users (sesa, name, email, encrypted_password, role, level)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *;
    `;
    const values = [sesa, name, email, password, role, level];

    const result = await db.query(query, values);
    return result.rows[0];
  },

  async getUsers() {
    const result = await db.query("SELECT * FROM users");
    return result.rows;
  },
  // Tambahkan fungsi lain sesuai kebutuhan
};

module.exports = UserModel;

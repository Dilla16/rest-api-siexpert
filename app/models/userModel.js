const db = require("../../database");

const UserModel = {
  async createUser(sesa, name, email, encryptedPassword, token, role, level) {
    const result = await db.query("INSERT INTO users (sesa, name, email, encrypted_password, token, role, level) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *", [sesa, name, email, encryptedPassword, token, role, level]);
    return result.rows[0];
  },
  async getUsers() {
    const result = await db.query("SELECT * FROM users");
    return result.rows;
  },
  // Tambahkan fungsi lain sesuai kebutuhan
};

module.exports = UserModel;

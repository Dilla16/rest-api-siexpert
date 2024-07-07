const pool = require("../../database");

const getAllUsers = async () => {
  const result = await pool.query("SELECT * FROM users");
  return result.rows;
};

const getUserBySesa = async (sesa) => {
  const result = await pool.query("SELECT * FROM users WHERE sesa = $1", [sesa]);
  return result.rows[0];
};

const createUser = async (user) => {
  const { sesa, name, email, password, role, level } = user;
  const result = await pool.query("INSERT INTO users (sesa, name, email, password, role, level) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *", [sesa, name, email, password, role, level]);
  return result.rows[0];
};

const updateUser = async (sesa, user) => {
  const { name, email, password, role, level } = user;
  const result = await pool.query("UPDATE users SET name = $1, email = $2, password = $3, role = $4, level = $5 WHERE sesa = $6 RETURNING *", [name, email, password, role, level, sesa]);
  return result.rows[0];
};

const deleteUser = async (sesa) => {
  const result = await pool.query("DELETE FROM users WHERE sesa = $1 RETURNING *", [sesa]);
  return result.rows[0];
};

module.exports = {
  getAllUsers,
  getUserBySesa,
  createUser,
  updateUser,
  deleteUser,
};

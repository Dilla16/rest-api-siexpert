const { Pool } = require("pg");
const bcrypt = require("bcrypt");

// Buat instance pool dengan koneksi dari environment variable
const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

// Fungsi untuk mendapatkan semua pengguna
const getAllUsers = async () => {
  const client = await pool.connect();
  try {
    const res = await client.query("SELECT * FROM users");
    return res.rows;
  } finally {
    client.release();
  }
};

// Fungsi untuk membuat pengguna baru
const createUser = async (user) => {
  const { sesa, name, email, password, role } = user;
  const client = await pool.connect();
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const res = await client.query("INSERT INTO users (sesa, name, email, password, role) VALUES ($1, $2, $3, $4, $5) RETURNING *", [sesa, name, email, hashedPassword, role]);
    return res.rows[0];
  } finally {
    client.release();
  }
};

module.exports = {
  getAllUsers,
  createUser,
};

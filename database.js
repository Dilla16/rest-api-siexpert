const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL + "?sslmode=require",
});

Pool.connect((err) => {
  if (err) throw err;
  console.log("connect to PosgreSQL successfully!");
});

module.exports = Pool;

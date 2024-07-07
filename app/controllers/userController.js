const pool = require("../../database");

// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM users");
    res.status(200).json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get user by SESA
exports.getUserBySesa = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM users WHERE sesa = $1", [req.params.sesa]);
    if (result.rows.length > 0) {
      res.status(200).json(result.rows[0]);
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create a new user
exports.createUser = async (req, res) => {
  const { sesa, name, email, password, role, level } = req.body;
  try {
    const result = await pool.query("INSERT INTO users (sesa, name, email, password, role, level) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *", [sesa, name, email, password, role, level]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update a user
exports.updateUser = async (req, res) => {
  const { name, email, password, role, level } = req.body;
  try {
    const result = await pool.query("UPDATE users SET name = $1, email = $2, password = $3, role = $4, level = $5 WHERE sesa = $6 RETURNING *", [name, email, password, role, level, req.params.sesa]);
    if (result.rows.length > 0) {
      res.status(200).json(result.rows[0]);
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete a user
exports.deleteUser = async (req, res) => {
  try {
    const result = await pool.query("DELETE FROM users WHERE sesa = $1 RETURNING *", [req.params.sesa]);
    if (result.rows.length > 0) {
      res.status(204).send();
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const { getAllUsers, createUser } = require("../models/userModel");

// Mendapatkan semua pengguna
exports.getAllUsers = async (req, res) => {
  try {
    const users = await getAllUsers();
    res.status(200).json(users);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Membuat pengguna baru
exports.createUser = async (req, res) => {
  const { sesa, name, email, password, role } = req.body;

  try {
    const newUser = await createUser({ sesa, name, email, password, role });
    res.status(201).json(newUser);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

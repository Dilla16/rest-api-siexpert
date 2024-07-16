const { User } = require("../models/userModel");
const bcrypt = require("bcrypt");

// Create a new user
exports.createUser = async (req, res) => {
  const { sesa, name, email, password, role } = req.body;

  try {
    // Validasi input
    if (!sesa || !name || !email || !password || !role) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Enkripsi password sebelum menyimpannya ke database
    const salt = await bcrypt.genSalt(10);
    const encryptedPassword = await bcrypt.hash(password, salt);

    // Buat pengguna baru dalam database
    const newUser = await User.create({
      sesa,
      name,
      email,
      encrypted_password: encryptedPassword,
      role,
    });

    res.status(201).json(newUser); // Mengembalikan respons dengan status 201 dan data pengguna yang baru dibuat
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ error: "Failed to create user" }); // Mengembalikan respons dengan status 500 jika terjadi kesalahan server
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll(); // Mengambil semua data dari tabel users
    res.status(200).json(users); // Mengembalikan respons dengan status 200 dan data pengguna dalam format JSON
  } catch (error) {
    res.status(400).json({ error: error.message }); // Mengembalikan respons dengan status 400 dan pesan error jika terjadi masalah
  }
};

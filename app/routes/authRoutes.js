// app/controllers/userController.js
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/userModels");

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Cari pengguna berdasarkan email
    const user = await User.findByEmail(email);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Verifikasi password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Pengguna berhasil diautentikasi, buat token JWT
    const payload = {
      user: {
        id: user.id,
        email: user.email,
        role: user.role, // Anda bisa menambahkan data pengguna lainnya di sini
      },
    };

    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" }, (err, token) => {
      if (err) throw err;
      res.json({ token });
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "Server Error" });
  }
};

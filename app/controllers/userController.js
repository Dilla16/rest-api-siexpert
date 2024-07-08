const { User } = require("../models/userModel");
const bcrypt = require("bcrypt");

// Create a new user
exports.createUser = async (req, res) => {
  const { sesa, name, email, password, role } = req.body;

  try {
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
    res.status(400).json({ error: error.message }); // Mengembalikan respons dengan status 400 dan pesan error jika terjadi masalah
  }
};

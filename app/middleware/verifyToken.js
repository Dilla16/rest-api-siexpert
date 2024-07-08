// middleware/verifyToken.js
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

dotenv.config(); // Load konfigurasi dari file .env

module.exports = function (req, res, next) {
  // Ambil token dari header Authorization
  const token = req.headers.authorization?.split(" ")[1];

  // Jika token tidak tersedia
  if (!token) {
    return res.status(401).json({ error: "Token not provided" });
  }

  // Verifikasi token
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      console.error(err);
      return res.status(403).json({ error: "Failed to authenticate token" });
    }

    req.user = decoded.user; // Simpan informasi pengguna dari token di objek req
    next(); // Lanjutkan ke middleware berikutnya
  });
};

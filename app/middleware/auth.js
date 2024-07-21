const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1]; // Mengambil token dari header Authorization

  if (!token) {
    return res.status(401).json({ error: "Unauthorized: Token not provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userData = decoded; // Menyimpan data pengguna yang di-decode dalam req.userData
    next(); // Lanjut ke middleware atau handler berikutnya
  } catch (error) {
    console.error("Error verifying token:", error.message || error);
    return res.status(401).json({ error: "Unauthorized: Invalid token" });
  }
};

const checkTokenExpiration = (req, res, next) => {
  const token = req.headers.authorization && req.headers.authorization.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "Unauthorized: Token not provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Add the decoded user information to the request object
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      res.status(401).json({ error: "Unauthorized: Token expired" });
    } else {
      res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
  }
};

module.exports = [authMiddleware, checkTokenExpiration];

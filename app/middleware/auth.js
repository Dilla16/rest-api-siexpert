const authService = require("../services/auth");

exports.authorize = async (req, res, next) => {
  try {
    const bearerToken = req.headers.authorization;

    if (!bearerToken) {
      throw new Error("Unauthorized");
    }

    const token = bearerToken.split("Bearer ")[1];

    const decoded = await authService.verifyToken(token);

    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({
      status: "FAIL",
      message: "Unauthorized",
    });
  }
};

// exports.isSuperAdmin = (req, res, next) => {
//   const { role } = req.user;

//   if (role !== "SUPERADMIN") {
//     res.status(403).json({
//       status: "FAIL",
//       message: "Forbidden!",
//     });
//     return;
//   }
//   next();
// };

// exports.isSuperOrAdmin = (req, res, next) => {
//   const { role } = req.user;

//   if (role !== "SUPERADMIN" && role !== "ADMIN") {
//     res.status(403).json({
//       status: "FAIL",
//       message: "Forbidden!",
//     });
//     return;
//   }
//   next();
// };

// app/middleware/auth.js
const authService = require("../services/auth");

exports.authorize = async (req, res, next) => {
  try {
    const bearerToken = req.headers.authorization;

    if (!bearerToken) {
      throw new Error("Token Required");
    }

    const user = await authService.authorize(bearerToken);
    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({
      status: "FAIL",
      message: err.message || "Unauthorized",
    });
  }
};

exports.isSuperAdmin = (req, res, next) => {
  const { role } = req.user;

  if (role !== "SUPERADMIN") {
    res.status(403).json({
      status: "FAIL",
      message: "FORBIDDEN!",
    });
    return;
  }
  next();
};

exports.isSuperOrAdmin = (req, res, next) => {
  const { role } = req.user;

  if (role !== "SUPERADMIN" && role !== "ADMIN") {
    res.status(403).json({
      status: "FAIL",
      message: "FORBIDDEN!",
    });
    return;
  }
  next();
};

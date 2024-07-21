const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const UserModel = require("../models/userModels");

const SALT = 10;

exports.encryptPassword = async (password) => {
  try {
    const hash = await bcrypt.hash(password, SALT);
    return hash;
  } catch (err) {
    throw new Error(err);
  }
};

exports.checkedPassword = async (inputPassword, hashedPassword) => {
  try {
    const match = await bcrypt.compare(inputPassword, hashedPassword);
    return match;
  } catch (err) {
    throw new Error(err);
  }
};

exports.createToken = (payload) => {
  try {
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" });
    return token;
  } catch (err) {
    throw new Error(err);
  }
};

const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

exports.authorize = async (bearerToken) => {
  try {
    if (!bearerToken) {
      res.status(401).json({
        status: "FAIL",
        message: "Unauthorized",
      });
      throw new ApplicationError("Unauthorized", 401);
    }
    const token = bearerToken.split("Bearer ")[1];

    const decoded = await verifyToken(token);

    const { sesa } = decoded;

    const user = await UserModel.findUserBySesa(sesa);

    if (!user) {
      throw new ApplicationError("Unauthorized", 401);
    }
    return user;
  } catch (err) {
    throw new ApplicationError(err.message, err.statusCode || 500);
  }
};

// app/services/auth.js
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../../.env");
const userRepository = require("../repositories/user");

const SALT_ROUNDS = 10;

const encryptPassword = async (password) => {
  return await bcrypt.hash(password, SALT_ROUNDS);
};

const checkedPassword = async (password, encryptedPassword) => {
  return await bcrypt.compare(password, encryptedPassword);
};

const createToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "1h" });
};

const verifyToken = (token) => {
  return jwt.verify(token, JWT_SECRET);
};

module.exports = {
  encryptPassword,
  checkedPassword,
  createToken,
  verifyToken,
};

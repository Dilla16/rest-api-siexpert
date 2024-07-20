const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

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

const JWT_SECRET = "Siexpert2024";

exports.createToken = (payload) => {
  try {
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "1h" });
    return token;
  } catch (err) {
    throw new Error(err);
  }
};

const verifyToken = (token) => {
  return jwt.verify(token, JWT_SECRET_KEY);
};

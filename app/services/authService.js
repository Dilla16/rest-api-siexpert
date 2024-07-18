const bcrypt = require("bcryptjs");

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

// app/services/users.js
const userRepository = require("../repositories/users");
const authServices = require("./auth");
const ApplicationError = require("../../config/errors/ApplicationError");

const createUser = async (payload, isAdmin = false) => {
  const { sesa, name, email, password, role, level } = payload;

  if (!sesa || !password) {
    throw new ApplicationError("Please provide SESA and password", 400);
  }

  const encrypted_password = await authServices.encryptPassword(password);

  const user = await userRepository.create({
    sesa,
    name,
    email,
    password: encrypted_password,
    role: isAdmin ? "ADMIN" : "MEMBER",
    level,
  });

  return user;
};

const checkUser = async (credentials) => {
  const { sesa, password } = credentials;

  if (!sesa || !password) {
    throw new ApplicationError("Please provide SESA and password", 400);
  }

  const user = await userRepository.findUserBySesa(sesa);

  if (!user) {
    throw new ApplicationError("User not found", 404);
  }

  const isPasswordMatch = await authServices.checkedPassword(password, user.password);

  if (!isPasswordMatch) {
    throw new ApplicationError("Invalid password", 401);
  }

  const token = authServices.createToken({ sesa });

  return { user, token };
};

const listUser = async (sesa) => {
  if (sesa) {
    return await userRepository.findUserBySesa(sesa);
  } else {
    return await userRepository.getAllUsers();
  }
};

const getUserById = async (sesa) => {
  const user = await userRepository.findUserBySesa(sesa);
  if (!user) {
    throw new ApplicationError("User not found", 404);
  }
  return user;
};

module.exports = {
  createUser,
  checkUser,
  listUser,
  getUserById,
};

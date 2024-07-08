// app/repositories/user.js
const userModel = require("../models/userModel");

const createUser = async (payload) => {
  return await userModel.createUser(payload);
};

const findUserBySesa = async (sesa) => {
  return await userModel.findUserBySesa(sesa);
};

const getAllUsers = async () => {
  return await userModel.getAllUsers();
};

module.exports = {
  createUser,
  findUserBySesa,
  getAllUsers,
};

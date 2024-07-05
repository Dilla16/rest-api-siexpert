const User = require("../models/userModel");

exports.getAllUsers = (req, res) => {
  const users = User.getAllUsers();
  res.json(users);
};

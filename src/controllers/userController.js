const User = require("../models/userModel");
let users = [];

exports.createUser = (req, res) => {
  const user = new User(req.body.sesa, req.body.name, req.body.badge, req.body.email, req.body.password, req.body.role, req.body.avatar, req.body.created_by, req.body.created_at);
  users.push(user);
  res.status(201).send(user);
};

exports.getAllUsers = (req, res) => {
  res.status(200).send(users);
};

exports.getUserBySesa = (req, res) => {
  const user = users.find((u) => u.sesa === req.params.sesa);
  if (user) {
    res.status(200).send(user);
  } else {
    res.status(404).send({ message: "User not found" });
  }
};

exports.updateUser = (req, res) => {
  const userIndex = users.findIndex((u) => u.sesa === req.params.sesa);
  if (userIndex !== -1) {
    users[userIndex] = { ...users[userIndex], ...req.body };
    res.status(200).send(users[userIndex]);
  } else {
    res.status(404).send({ message: "User not found" });
  }
};

exports.deleteUser = (req, res) => {
  const userIndex = users.findIndex((u) => u.sesa === req.params.sesa);
  if (userIndex !== -1) {
    users.splice(userIndex, 1);
    res.status(204).send();
  } else {
    res.status(404).send({ message: "User not found" });
  }
};

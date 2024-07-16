const UserModel = require("../models/userModel");

const UserController = {
  async create(req, res) {
    const { sesa, name, email, encryptedPassword, token, role, level } = req.body;
    try {
      const user = await UserModel.createUser(sesa, name, email, encryptedPassword, token, role, level);
      res.status(201).json(user);
    } catch (error) {
      res.status(500).json({ error: "Internal Server Error" });
    }
  },

  async getAll(req, res) {
    try {
      const users = await UserModel.getUsers();
      res.status(200).json(users);
    } catch (error) {
      res.status(500).json({ error: "Internal Server Error" });
    }
  },
};

module.exports = UserController;

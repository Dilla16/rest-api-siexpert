const bcrypt = require("bcrypt");
const UserModel = require("../models/userModel");

const UserController = {
  async create(req, res) {
    const { sesa, name, email, password, role, level } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10); // 10 is the salt rounds

    try {
      const user = await UserModel.createUser(sesa, name, email, hashedPassword, role, level);
      res.status(201).json(user);
    } catch (error) {
      console.error("Error creating user:", error);
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

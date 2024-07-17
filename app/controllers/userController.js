const bcrypt = require("bcryptjs");
const UserModel = require("../models/userModel");

const UserController = {
  async create(req, res) {
    const { sesa, name, email, password, role, level } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10); // 10 is the salt rounds

    try {
      const user = await UserModel.createUser(sesa, name, email, hashedPassword, role, level);
      res.status(201).json(user);
    } catch (error) {
      // Log detailed error information
      console.error("Error creating user:", error.message || error);

      // Respond with a more detailed error message
      if (error.name === "ValidationError") {
        return res.status(400).json({ error: error.message });
      }

      if (error.code === "23505") {
        // PostgreSQL unique violation error
        return res.status(409).json({ error: "Email already exists." });
      }

      res.status(500).json({ error: "Internal Server Error", details: error.message });
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

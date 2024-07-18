const bcrypt = require("bcryptjs");
const UserModel = require("../models/userModel");
const authServices = require("../services/authService");

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

  async deleteBySesa(req, res) {
    const { sesa } = req.params; // Get sesa from the request parameters

    try {
      const result = await UserModel.deleteUserBySesa(sesa);

      if (result.rowCount === 0) {
        return res.status(404).json({ error: "User not found." });
      }

      res.status(204).send(); // No content to return on successful deletion
    } catch (error) {
      console.error("Error deleting user:", error.message || error);
      res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
  },

  async update(req, res) {
    const { sesa } = req.params;
    const { name, email, password, role, level } = req.body;

    let hashedPassword;
    if (password) {
      hashedPassword = await bcrypt.hash(password, 10); // Hash the password if provided
    }

    try {
      const user = await UserModel.updateUser(sesa, { name, email, hashedPassword, role, level });

      if (!user) {
        return res.status(404).json({ error: "User not found." });
      }

      res.status(200).json(user);
    } catch (error) {
      console.error("Error updating user:", error.message || error);

      if (error.name === "ValidationError") {
        return res.status(400).json({ error: error.message });
      }

      if (error.code === "23505") {
        return res.status(409).json({ error: "Email already exists." });
      }

      res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
  },

  async login(req, res) {
    const { sesa, password } = req.body;

    try {
      const user = await UserModel.findUserBySesa(sesa);

      if (!user) {
        return res.status(404).json({ error: "Sesa not found" });
      }

      const isPasswordValid = await authServices.checkedPassword(password, user.encrypted_password);

      if (!isPasswordValid) {
        return res.status(401).json({ error: "Password is incorrect" });
      }

      const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: "1h" });

      res.status(200).json({
        status: "OK",
        message: "Login successful",
        data: { ...user, token },
      });
    } catch (error) {
      console.error("Error logging in:", error.message || error);
      res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
  },
};

module.exports = UserController;

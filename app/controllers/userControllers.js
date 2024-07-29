const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const UserModel = require("../models/userModels");
const authServices = require("../services/authService");

const UserController = {
  async create(req, res) {
    const { sesa, name, email, password, role, department } = req.body;

    // Check if all required fields are provided and if department is an array
    if (!sesa || !name || !email || !password || !role || !Array.isArray(department) || department.length === 0) {
      return res.status(400).json({ error: "All fields are required and department must be a non-empty array" });
    }

    try {
      const hashedPassword = await authServices.encryptPassword(password);
      const user = await UserModel.createUser(sesa, name, email, hashedPassword, role, department);
      res.status(201).json(user);
    } catch (error) {
      console.error("Error creating user:", error.message || error);

      if (error.name === "ValidationError") {
        return res.status(400).json({ error: error.message });
      }

      if (error.code === "23505") {
        return res.status(409).json({ error: "User already exists." });
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

  async getUserBySesa(req, res) {
    try {
      const { sesa } = req.params;
      const user = await UserModel.getUserBySesa(sesa);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  },

  async deleteBySesa(req, res) {
    const { sesa } = req.params;

    if (!sesa) {
      return res.status(400).json({ error: "Sesa is required" });
    }

    try {
      const result = await UserModel.deleteUserBySesa(sesa);

      if (result.rowCount === 0) {
        return res.status(404).json({ error: "User not found." });
      }

      res.status(204).send();
    } catch (error) {
      console.error("Error deleting user:", error.message || error);
      res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
  },

  async update(req, res) {
    const { sesa } = req.params;
    const { name, email, role, department } = req.body; // Excluding password from update fields

    if (!sesa || !name || !email || !role || !Array.isArray(department) || department.length === 0) {
      return res.status(400).json({ error: "All fields are required and department must be a non-empty array" });
    }

    try {
      const existingUser = await UserModel.getUserBySesa(sesa);
      if (!existingUser) {
        return res.status(404).json({ error: "User not found." });
      }

      const updatedUser = await UserModel.updateUser(sesa, { name, email, role, department });

      res.status(200).json(updatedUser);
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

    if (!sesa || !password) {
      return res.status(400).json({ error: "Sesa and Password are required" });
    }

    try {
      const user = await UserModel.getUserBySesa(sesa);

      if (!user) {
        return res.status(404).json({
          status: "FAILED",
          message: "Sesa not found",
        });
      }

      const isPasswordValid = await authServices.checkedPassword(password, user.password);

      if (!isPasswordValid) {
        return res.status(401).json({ status: "FAILED", message: "Password is incorrect" });
      }

      const token = jwt.sign({ sesa: user.sesa }, process.env.JWT_SECRET, { expiresIn: "1h" });

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

  async getProfile(req, res) {
    const token = req.headers.authorization.split(" ")[1]; // Mendapatkan token dari header Authorization
    if (!token) {
      return res.status(401).json({ error: "Unauthorized: Token not provided" });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await UserModel.getUserBySesa(decoded.sesa);

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Pastikan department adalah array
      if (!Array.isArray(user.department)) {
        user.department = [user.department];
      }

      res.status(200).json(user);
    } catch (error) {
      console.error("Error fetching profile:", error.message || error);
      res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
  },
};

module.exports = UserController;

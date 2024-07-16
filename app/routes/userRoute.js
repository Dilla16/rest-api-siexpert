const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

// Rute untuk membuat pengguna baru
router.post("/createusers", userController.createUser);
router.get("/users", userController.getAllUsers);

module.exports = router;

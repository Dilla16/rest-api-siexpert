const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

// Rute untuk membuat pengguna baru
router.post("/users", userController.createUser);

module.exports = router;

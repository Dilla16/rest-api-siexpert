// src/routes/userRoutes.js

const express = require("express");
const userController = require("../controllers/userController");
const router = express.Router();

router.post("/users", userController.createUser);
router.get("/users", userController.getAllUsers);
router.get("/users/:sesa", userController.getUserBySesa);
router.put("/users/:sesa", userController.updateUser);
router.delete("/users/:sesa", userController.deleteUser);

module.exports = router;

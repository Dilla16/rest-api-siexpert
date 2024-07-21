const express = require("express");
const UserController = require("../controllers/userController");
const authMiddleware = require("./../middleware/auth");

const router = express.Router();

router.post("/login", UserController.login);
router.get("/profile", UserController.getProfile);
router.get("/users", UserController.getAll);
router.post("/create-user", UserController.create);
router.delete("/users/:sesa", UserController.deleteBySesa);
router.put("/users/:sesa", authMiddleware, UserController.update);

module.exports = router;

const express = require("express");
const UserController = require("../controllers/userController");
const authMiddleware = require("./../middleware/auth");

const router = express.Router();

router.post("/create-user", UserController.create);
router.get("/users", UserController.getAll);
router.delete("/users/:sesa", UserController.deleteBySesa);
router.put("/users/:sesa", UserController.update);
router.post("/login", UserController.login);
router.get("/profile", authMiddleware, UserController.getProfile);

module.exports = router;

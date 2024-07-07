const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

router.get("/users", userController.getAllUsers);
router.get("/users/:sesa", userController.getUserBySesa);
router.post("/users", userController.createUser);
router.put("/users/:sesa", userController.updateUser);
router.delete("/users/:sesa", userController.deleteUser);

module.exports = router;

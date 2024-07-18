const express = require("express");
const UserController = require("../controllers/userController");

const router = express.Router();

router.post("/create-user", UserController.create);
router.get("/users", UserController.getAll);
router.delete("/users/:sesa", UserController.deleteBySesa);
router.put("/users/:sesa", UserController.update);
router.post("/login", UserController.login);

module.exports = router;

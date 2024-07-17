const express = require("express");
const UserController = require("../controllers/userController");

const router = express.Router();

router.post("/create/user", UserController.create);
router.get("/users", UserController.getAll);

module.exports = router;

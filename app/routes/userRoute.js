const express = require("express");
const UserController = require("../controllers/userController");

const router = express.Router();

router.post("/users", UserController.create);
router.get("/users", UserController.getAll);

module.exports = router;

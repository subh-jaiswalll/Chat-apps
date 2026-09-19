const express = require("express");

const userController = require("../controller/userController.js");
const auth = require("../middleware/auth.js");

const router = express.Router();

router.post("/signup", userController.createUser);

router.post("/login", userController.loginUser);

// router.get("/profile", auth, userController.getProfile);

module.exports = router;
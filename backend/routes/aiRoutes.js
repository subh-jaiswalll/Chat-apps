const express = require("express");
const router = express.Router();

const { getSuggestions } = require("../controller/aiController.js");
const authMiddleware = require("../middleware/auth.js");

router.post("/suggestions", authMiddleware, getSuggestions);

module.exports = router;
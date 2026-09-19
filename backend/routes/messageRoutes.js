const express = require("express");

const messageController = require("../controller/messageController.js");
const auth = require("../middleware/auth.js");

const router = express.Router();

router.post("/send", auth, messageController.createMessage);

module.exports = router;
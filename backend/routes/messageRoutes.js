const express = require("express");

const messageController =
    require("../controller/messageController.js");

const auth =
    require("../middleware/auth.js");

const router = express.Router();


// Send message

router.post(
    "/send",
    auth,
    messageController.createMessage
);


// Get messages

router.get(
    "/",
    auth,
    messageController.getMessages
);


module.exports = router;
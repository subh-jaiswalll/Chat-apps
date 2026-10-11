const express = require("express");
const router = express.Router();

const groupController = require("../controller/groupController.js");

// Replace this path with the middleware already used by your
// existing message routes. It must set req.user from your JWT.
const authMiddleware = require("../middleware/auth.js");

router.post("/", authMiddleware, groupController.createGroup);

router.get("/", authMiddleware, groupController.getMyGroups);

router.post("/:groupId/join", authMiddleware, groupController.joinGroup);

router.get(
  "/:groupId/messages",
  authMiddleware,
  groupController.getGroupMessages,
);

router.get("/all", authMiddleware, groupController.getAllGroups);

module.exports = router;

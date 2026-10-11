const Group = require("../models/groupModels.js");
const GroupMember = require("../models/groupMembersModels.js");
const GroupMessage = require("../models/groupMessageModels.js");
const User = require("../models/userModels.js");

function groupChats(socket, io) {
  // JOIN GROUP ROOM
  socket.on("join_group", async function (data, callback) {
    try {
      const groupId = Number(data.groupId);
      const userId = socket.user.id;

      if (!Number.isInteger(groupId) || groupId <= 0) {
        return callback?.({
          success: false,
          message: "Invalid group ID",
        });
      }

      const group = await Group.findByPk(groupId);

      if (!group) {
        return callback?.({
          success: false,
          message: "Group not found",
        });
      }

      const membership = await GroupMember.findOne({
        where: { groupId, userId },
      });

      if (!membership) {
        return callback?.({
          success: false,
          message: "You are not a member of this group",
        });
      }

      socket.join(`group_${groupId}`);

      callback?.({
        success: true,
        message: "Joined group room",
      });
    } catch (error) {
      console.error("Join group socket error:", error.message);

      callback?.({
        success: false,
        message: "Could not join group",
      });
    }
  });

  // SEND GROUP MESSAGE
  socket.on("group_message", async function (data, callback) {
    try {
      const groupId = Number(data.groupId);
      const messageText = data.message;
      const senderId = socket.user.id;

      if (
        !Number.isInteger(groupId) ||
        groupId <= 0 ||
        typeof messageText !== "string" ||
        !messageText.trim() ||
        messageText.length > 2000
      ) {
        return callback?.({
          success: false,
          message: "Invalid group or message",
        });
      }

      const membership = await GroupMember.findOne({
        where: { groupId, userId: senderId },
      });

      if (!membership) {
        return callback?.({
          success: false,
          message: "You are not a member of this group",
        });
      }

      const sender = await User.findByPk(senderId);

      if (!sender) {
        return callback?.({
          success: false,
          message: "Sender not found",
        });
      }

      const savedMessage = await GroupMessage.create({
        groupId,
        senderId,
        message: messageText.trim(),
      });

      const responseMessage = {
        id: savedMessage.id,
        groupId,
        senderId,
        senderName: sender.name,
        message: savedMessage.message,
        createdAt: savedMessage.createdAt,
      };

      io.to(`group_${groupId}`).emit(
        "new_group_message",
        responseMessage
      );

      callback?.({
        success: true,
        data: responseMessage,
      });
    } catch (error) {
      console.error("Group message error:", error.message);

      callback?.({
        success: false,
        message: "Could not send group message",
      });
    }
  });
}

module.exports = groupChats;
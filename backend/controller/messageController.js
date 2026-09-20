const Message = require("../models/messageModels.js");
const User = require("../models/userModels.js");

// ========================================
// CREATE MESSAGE
// ========================================

const createMessage = async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({
      message: "Message is required",
    });
  }

  const newMessage = await Message.create({
    userId: req.user.id,

    message: message,
  });

  res.status(201).json({
    message: "Message sent successfully",

    data: newMessage,
  });
};

// ========================================
// GET ALL MESSAGES
// ========================================

const getMessages = async (req, res) => {
  const messages = await Message.findAll({
    order: [["createdAt", "ASC"]],
  });

  const messagesWithUser = await Promise.all(
    messages.map(async function (message) {
      const user = await User.findByPk(message.userId);

      return {
        id: message.id,

        userId: message.userId,

        userName: user ? user.name : "Unknown User",

        message: message.message,

        createdAt: message.createdAt,
      };
    }),
  );

  res.status(200).json({
    message: "Messages fetched successfully",

    data: messagesWithUser,
  });
};

module.exports = {
  createMessage,

  getMessages,
};

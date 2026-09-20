const User = require("../models/userModels.js");

const Message = require("../models/messageModels.js");

const socketMiddleware = require("../middleware/socketMiddleware.js");

// ========================================
// SETUP SOCKET.IO
// ========================================

function setupSocket(io) {
  // ========================================
  // SOCKET AUTHENTICATION
  // ========================================

  io.use(socketMiddleware);

  // ========================================
  // SOCKET CONNECTION
  // ========================================

  io.on("connection", function (socket) {
    console.log("User connected:", socket.id);

    console.log("User ID:", socket.user.id);

    console.log("User Email:", socket.user.email);

    // ========================================
    // SEND MESSAGE
    // ========================================

    socket.on("sendMessage", async function (data) {
      console.log("Message received:", data.message);

      // Find logged-in user

      const user = await User.findByPk(socket.user.id);

      if (!user) {
        return;
      }

      // Save message

      const newMessage = await Message.create({
        userId: socket.user.id,

        message: data.message,
      });

      // Send message to everyone

      io.emit("newMessage", {
        id: newMessage.id,

        userId: newMessage.userId,

        userName: user.name,

        message: newMessage.message,

        createdAt: newMessage.createdAt,
      });
    });

    // ========================================
    // DISCONNECT
    // ========================================

    socket.on("disconnect", function () {
      console.log("User disconnected:", socket.id);
    });
  });
}

module.exports = setupSocket;

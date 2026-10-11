const socketMiddleware = require("../middleware/socketMiddleware.js");

const personalChat = require("./personalChats.js");
const groupChats = require("./groupChats.js");

function setupSocket(io) {
  io.use(socketMiddleware);

  io.on("connection", function (socket) {
    console.log("User connected:", socket.id);
    console.log("User ID:", socket.user.id);

    // Existing one-to-one chat
    personalChat(socket, io);

    // New group chat
    groupChats(socket, io);

    socket.on("disconnect", function () {
      console.log("User disconnected:", socket.id);
    });
  });
}

module.exports = setupSocket;













// const socketMiddleware = require("../middleware/socketMiddleware.js");

// const personalChat = require("./personalChats.js");

// function setupSocket(io) {
//   // Socket authentication
//   io.use(socketMiddleware);

//   io.on("connection", function (socket) {
//     console.log("User connected:", socket.id);

//     console.log("User ID:", socket.user.id);

//     console.log("User Email:", socket.user.email);

//     // Personal chat
//     personalChat(socket, io);

//     // Disconnect
//     socket.on("disconnect", function () {
//       console.log("User disconnected:", socket.id);
//     });
//   });
// }

// module.exports = setupSocket;

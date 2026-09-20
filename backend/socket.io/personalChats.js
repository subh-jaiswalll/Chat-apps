const User = require("../models/userModels.js");
const Message = require("../models/messageModels.js");

function personalChat(socket, io) {

    // =========================
    // JOIN PERSONAL CHAT ROOM
    // =========================

    socket.on("join_room", async function (data) {

        const receiverId = data.userId;

        const senderId = socket.user.id;

        if (!receiverId) {
            return;
        }

        const roomId = [senderId, receiverId]
            .sort(function (a, b) {
                return a - b;
            })
            .join("_");

        socket.join(roomId);

        console.log(
            "User",
            senderId,
            "joined room",
            roomId
        );
    });


    // =========================
    // SEND NEW MESSAGE
    // =========================

    socket.on("new_message", async function (data) {

        const receiverId = data.receiverId;
        const messageText = data.message;

        const senderId = socket.user.id;

        if (!receiverId || !messageText) {
            return;
        }

        const sender = await User.findByPk(senderId);

        if (!sender) {
            return;
        }

        const receiver = await User.findByPk(receiverId);

        if (!receiver) {
            return;
        }

        const newMessage = await Message.create({
            senderId: senderId,
            receiverId: receiverId,
            message: messageText
        });

        const roomId = [senderId, receiverId]
            .sort(function (a, b) {
                return a - b;
            })
            .join("_");

        io.to(roomId).emit(
            "new_message",
            {
                id: newMessage.id,
                senderId: senderId,
                receiverId: receiverId,
                senderName: sender.name,
                message: newMessage.message,
                createdAt: newMessage.createdAt
            }
        );
    });
}

module.exports = personalChat;
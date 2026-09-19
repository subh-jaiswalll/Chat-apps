const Message = require("../models/messageModels.js");


// Send message

const createMessage = async (req, res) => {

    const { message } = req.body;

    if (!message) {
        return res.status(400).json({
            message: "Message is required"
        });
    }

    const newMessage = await Message.create({
        userId: req.user.id,
        message: message
    });

    res.status(201).json({
        message: "Message sent successfully",
        data: newMessage
    });
};


// Get all messages

const getMessages = async (req, res) => {

    const messages = await Message.findAll({
        order: [
            ["createdAt", "ASC"]
        ]
    });

    res.status(200).json({
        message: "Messages fetched successfully",
        data: messages
    });
};


module.exports = {
    createMessage,
    getMessages
};
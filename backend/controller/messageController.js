const Message = require("../models/messageModels.js");

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

module.exports = {
    createMessage
};
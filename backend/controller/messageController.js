const Message = require("../models/messageModels.js");
const User = require("../models/userModels.js");


const createMessage = async (req, res) => {

    const {
        receiverId,
        message
    } = req.body;


    if (!receiverId || !message) {

        return res.status(400).json({
            message: "Receiver and message are required"
        });

    }


    const receiver = await User.findByPk(
        receiverId
    );


    if (!receiver) {

        return res.status(404).json({
            message: "Receiver not found"
        });

    }


    const newMessage = await Message.create({
        senderId: req.user.id,
        receiverId: receiverId,
        message: message
    });


    res.status(201).json({

        message: "Message sent successfully",

        data: newMessage

    });
};


const getMessages = async (req, res) => {

    const receiverId =
        req.query.receiverId;


    if (!receiverId) {

        return res.status(400).json({
            message: "Receiver ID is required"
        });

    }


    const myId = req.user.id;


    const messages = await Message.findAll({

        where: {

            [require("sequelize").Op.or]: [

                {
                    senderId: myId,
                    receiverId: receiverId
                },

                {
                    senderId: receiverId,
                    receiverId: myId
                }

            ]

        },

        order: [
            ["createdAt", "ASC"]
        ]

    });


    const messagesWithUser =
        await Promise.all(

            messages.map(
                async function (message) {

                    const user =
                        await User.findByPk(
                            message.senderId
                        );


                    return {

                        id: message.id,

                        senderId:
                            message.senderId,

                        receiverId:
                            message.receiverId,

                        senderName:
                            user
                                ? user.name
                                : "Unknown User",

                        message:
                            message.message,

                        createdAt:
                            message.createdAt

                    };

                }
            )

        );


    res.status(200).json({

        message:
            "Messages fetched successfully",

        data:
            messagesWithUser

    });

};


module.exports = {
    createMessage,
    getMessages
};
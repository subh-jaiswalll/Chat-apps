const { DataTypes } = require("sequelize");
const Database = require("../utils/db.js");

const Message = Database.define("Message", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
    },

    senderId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },

    receiverId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },

    message: {
        type: DataTypes.TEXT,
        allowNull: false
    }
});

module.exports = Message;
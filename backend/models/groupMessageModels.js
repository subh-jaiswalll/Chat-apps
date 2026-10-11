const { DataTypes } = require("sequelize");
const Database = require("../utils/db.js");

const GroupMessage = Database.define("GroupMessage", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },

  groupId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },

  senderId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },

  message: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
});

module.exports = GroupMessage;
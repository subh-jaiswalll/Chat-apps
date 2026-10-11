const { DataTypes } = require("sequelize");
const Database = require("../utils/db.js");

const GroupMember = Database.define(
  "GroupMember",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    groupId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    indexes: [
      {
        unique: true,
        fields: ["groupId", "userId"],
      },
    ],
  }
);

module.exports = GroupMember;
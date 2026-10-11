const { DataTypes } = require("sequelize");
const Database = require("../utils/db.js");

const Group = Database.define("Group", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },

  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  createdBy: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
});

module.exports = Group;
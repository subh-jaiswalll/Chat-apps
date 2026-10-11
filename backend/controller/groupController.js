const Group = require("../models/groupModels.js");
const GroupMember = require("../models/groupMembersModels.js");
const GroupMessage = require("../models/groupMessageModels.js");
const User = require("../models/userModels.js");

const { Op } = require("sequelize");

// CREATE GROUP
const createGroup = async (req, res) => {
  try {
    const { name } = req.body;
    const userId = req.user.id;

    if (!name || !name.trim()) {
      return res.status(400).json({
        message: "Group name is required",
      });
    }

    const group = await Group.sequelize.transaction(async (transaction) => {
      const newGroup = await Group.create(
        {
          name: name.trim(),
          createdBy: userId,
        },
        { transaction }
      );

      await GroupMember.create(
        {
          groupId: newGroup.id,
          userId,
        },
        { transaction }
      );

      return newGroup;
    });

    res.status(201).json({
      message: "Group created successfully",
      data: group,
    });
  } catch (error) {
    console.error("Create group error:", error.message);

    res.status(500).json({
      message: "Could not create group",
    });
  }
};

// JOIN GROUP
const joinGroup = async (req, res) => {
  try {
    const groupId = req.params.groupId;
    const userId = req.user.id;

    const group = await Group.findByPk(groupId);

    if (!group) {
      return res.status(404).json({
        message: "Group not found",
      });
    }

    await GroupMember.findOrCreate({
      where: { groupId, userId },
      defaults: { groupId, userId },
    });

    res.status(200).json({
      message: "Joined group successfully",
      data: group,
    });
  } catch (error) {
    console.error("Join group error:", error.message);

    res.status(500).json({
      message: "Could not join group",
    });
  }
};

// GET GROUP MESSAGES
const getGroupMessages = async (req, res) => {
  try {
    const groupId = req.params.groupId;
    const userId = req.user.id;

    const membership = await GroupMember.findOne({
      where: { groupId, userId },
    });

    if (!membership) {
      return res.status(403).json({
        message: "You are not a member of this group",
      });
    }

    const messages = await GroupMessage.findAll({
      where: { groupId },
      order: [["createdAt", "ASC"]],
      limit: 100,
    });

    const data = await Promise.all(
      messages.map(async (message) => {
        const sender = await User.findByPk(message.senderId);

        return {
          id: message.id,
          groupId: message.groupId,
          senderId: message.senderId,
          senderName: sender ? sender.name : "Unknown User",
          message: message.message,
          createdAt: message.createdAt,
        };
      })
    );

    res.status(200).json({
      message: "Group messages fetched successfully",
      data,
    });
  } catch (error) {
    console.error("Get group messages error:", error.message);

    res.status(500).json({
      message: "Could not fetch group messages",
    });
  }
};


// GET MY GROUPS
const getMyGroups = async (req, res) => {
    try {
        const userId = req.user.id;

        // Find the groups this user is a member of
        const memberships = await GroupMember.findAll({
            where: {
                userId: userId
            }
        });

        // Get group IDs from membership records
        const groupIds = memberships.map(function (membership) {
            return membership.groupId;
        });

        // If the user has not joined any groups, return an empty list
        if (groupIds.length === 0) {
            return res.status(200).json({
                message: "Groups fetched successfully",
                data: []
            });
        }

        // Fetch groups without using Sequelize associations
        const groups = await Group.findAll({
            where: {
                id: {
                    [Op.in]: groupIds
                }
            }
        });

        return res.status(200).json({
            message: "Groups fetched successfully",
            data: groups
        });

    } catch (error) {
        console.error("Get my groups error:", error);

        return res.status(500).json({
            message: "Could not fetch groups",
            error: error.message
        });
    }
};



// GET ALL GROUPS
const getAllGroups = async (req, res) => {
    try {
        const userId = req.user.id;

        const groups = await Group.findAll();

        const memberships = await GroupMember.findAll({
            where: { userId: userId }
        });

        const joinedGroupIds = memberships.map(function (membership) {
            return Number(membership.groupId);
        });

        const data = groups.map(function (group) {
            const groupData = group.toJSON();

            groupData.isMember = joinedGroupIds.includes(
                Number(group.id)
            );

            return groupData;
        });

        res.status(200).json({
            message: "All groups fetched successfully",
            data: data
        });

    } catch (error) {
        console.error("Get all groups error:", error);

        res.status(500).json({
            message: "Could not fetch all groups"
        });
    }
};

module.exports = {
  createGroup,
  joinGroup,
  getGroupMessages,
  getMyGroups,
  getAllGroups
};
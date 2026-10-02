const { User } = require("../models");

// GET CURRENT USER PROFILE
const getProfile = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        message: "User not authenticated",
      });
    }

    const user = await User.findByPk(userId, {
      attributes: ["id", "name", "email", "role", "createdAt", "updatedAt"],
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    return res.status(200).json(user);
  } catch (error) {
    console.error("GET PROFILE ERROR:", error);

    return res.status(500).json({
      message: "Failed to fetch profile",
      error: error.message,
    });
  }
};

// GET ALL USERS
const getUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ["id", "name", "email", "role", "createdAt", "updatedAt"],
      order: [["id", "ASC"]],
    });

    return res.status(200).json(users);
  } catch (error) {
    console.error("GET USERS ERROR:", error);

    return res.status(500).json({
      message: "Failed to fetch users",
      error: error.message,
    });
  }
};

// GET USER BY ID
const getUserById = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: ["id", "name", "email", "role", "createdAt", "updatedAt"],
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    return res.status(200).json(user);
  } catch (error) {
    console.error("GET USER ERROR:", error);

    return res.status(500).json({
      message: "Failed to fetch user",
      error: error.message,
    });
  }
};

// UPDATE USER
const updateUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const { name, email, role } = req.body;

    if (name !== undefined && !name.trim()) {
      return res.status(400).json({
        message: "Name cannot be empty",
      });
    }

    if (email !== undefined) {
      const existingUser = await User.findOne({
        where: {
          email,
        },
      });

      if (existingUser && existingUser.id !== user.id) {
        return res.status(409).json({
          message: "Email already exists",
        });
      }
    }

    if (
      role !== undefined &&
      !["admin", "customer"].includes(role)
    ) {
      return res.status(400).json({
        message: "Invalid role",
      });
    }

    await user.update({
      name: name !== undefined ? name.trim() : user.name,
      email: email !== undefined ? email : user.email,
      role: role !== undefined ? role : user.role,
    });

    return res.status(200).json({
      message: "User updated successfully",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("UPDATE USER ERROR:", error);

    return res.status(500).json({
      message: "Failed to update user",
      error: error.message,
    });
  }
};

// DELETE USER
const deleteUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    await user.destroy();

    return res.status(200).json({
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("DELETE USER ERROR:", error);

    return res.status(500).json({
      message: "Failed to delete user",
      error: error.message,
    });
  }
};

module.exports = {
  getProfile,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
};
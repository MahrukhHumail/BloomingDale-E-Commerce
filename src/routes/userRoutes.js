const express = require("express");
const { User } = require("../models");
const authenticateToken = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const router = express.Router();

router.get("/profile", authenticateToken, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ["id", "name", "email", "role"],
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch profile",
      error: error.message,
    });
  }
});

router.get(
  "/admin",
  authenticateToken,
  authorizeRoles("admin"),
  (req, res) => {
    res.json({
      message: "Welcome Admin! You have admin access.",
    });
  }
);

module.exports = router;
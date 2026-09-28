const express = require("express");

const {
  getCategories,
  createCategory,
} = require("../controllers/categoryController");

const authenticateToken = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const router = express.Router();

// Public route
router.get("/", getCategories);

// Admin-only route
router.post(
  "/",
  authenticateToken,
  authorizeRoles("admin"),
  createCategory
);

module.exports = router;
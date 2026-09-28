const express = require("express");

const {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} = require("../controllers/categoryController");

const authenticateToken = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const router = express.Router();

// Public route
router.get("/", getCategories);

// Admin-only create route
router.post(
  "/",
  authenticateToken,
  authorizeRoles("admin"),
  createCategory
);

// Admin-only update route
router.put(
  "/:id",
  authenticateToken,
  authorizeRoles("admin"),
  updateCategory
);

// Admin-only delete route
router.delete(
  "/:id",
  authenticateToken,
  authorizeRoles("admin"),
  deleteCategory
);

module.exports = router;
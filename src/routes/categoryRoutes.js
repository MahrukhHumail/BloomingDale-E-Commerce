const express = require("express");
const router = express.Router();

const {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} = require("../controllers/categoryController");

const {
  authenticateToken,
  authorizeRoles,
} = require("../middleware/authMiddleware");

// Public routes
router.get("/", getCategories);
router.get("/:id", getCategoryById);

// Admin-only write routes
router.post(
  "/",
  authenticateToken,
  authorizeRoles("admin"),
  createCategory
);

router.put(
  "/:id",
  authenticateToken,
  authorizeRoles("admin"),
  updateCategory
);

router.delete(
  "/:id",
  authenticateToken,
  authorizeRoles("admin"),
  deleteCategory
);

module.exports = router;
const express = require("express");

const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");

const authenticateToken = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const router = express.Router();

// Public routes
router.get("/", getProducts);
router.get("/:id", getProductById);

// Admin-only routes
router.post(
  "/",
  authenticateToken,
  authorizeRoles("admin"),
  createProduct
);

router.put(
  "/:id",
  authenticateToken,
  authorizeRoles("admin"),
  updateProduct
);

router.delete(
  "/:id",
  authenticateToken,
  authorizeRoles("admin"),
  deleteProduct
);

module.exports = router;
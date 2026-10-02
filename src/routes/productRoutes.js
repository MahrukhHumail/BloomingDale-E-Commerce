const express = require("express");
const router = express.Router();

const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");

const {
  authenticateToken,
  authorizeRoles,
} = require("../middleware/authMiddleware");

// Public routes
router.get("/", getProducts);
router.get("/:id", getProductById);

// Admin-only write routes
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
const express = require("express");
const router = express.Router();

const {
  createVariant,
  getVariants,
  updateVariant,
  deleteVariant,
} = require("../controllers/variantController");

const {
  authenticateToken,
  authorizeRoles,
} = require("../middleware/authMiddleware");

// Public GET
router.get("/", getVariants);
router.get("/product/:productId", getVariants);

// Admin writes
router.post(
  "/",
  authenticateToken,
  authorizeRoles("admin"),
  createVariant
);

router.put(
  "/:id",
  authenticateToken,
  authorizeRoles("admin"),
  updateVariant
);

router.delete(
  "/:id",
  authenticateToken,
  authorizeRoles("admin"),
  deleteVariant
);

module.exports = router;
const express = require("express");
const router = express.Router();

const {
  createSKU,
  getSKUs,
  updateSKU,
  deleteSKU,
} = require("../controllers/skuController");

const {
  authenticateToken,
  authorizeRoles,
} = require("../middleware/authMiddleware");

// Public GET
router.get("/", getSKUs);
router.get("/variant/:variantId", getSKUs);

// Admin writes
router.post(
  "/",
  authenticateToken,
  authorizeRoles("admin"),
  createSKU
);

router.patch(
  "/:id",
  authenticateToken,
  authorizeRoles("admin"),
  updateSKU
);

router.delete(
  "/:id",
  authenticateToken,
  authorizeRoles("admin"),
  deleteSKU
);

module.exports = router;
const Product = require("./Product");
const Category = require("./Category");
const User = require("./User");
const Variant = require("./Variant");
const SKU = require("./SKU");

// Category → Product
Category.hasMany(Product, {
  foreignKey: "categoryId",
  onDelete: "RESTRICT",
  onUpdate: "CASCADE",
});

Product.belongsTo(Category, {
  foreignKey: "categoryId",
});

// Category → Subcategories
Category.hasMany(Category, {
  as: "subcategories",
  foreignKey: "parentId",
});

Category.belongsTo(Category, {
  as: "parent",
  foreignKey: "parentId",
});

// Product → Variant
Product.hasMany(Variant, {
  foreignKey: "productId",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

Variant.belongsTo(Product, {
  foreignKey: "productId",
});

// Variant → SKU
Variant.hasMany(SKU, {
  foreignKey: "variantId",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

SKU.belongsTo(Variant, {
  foreignKey: "variantId",
});

module.exports = {
  Product,
  Category,
  User,
  Variant,
  SKU,
};
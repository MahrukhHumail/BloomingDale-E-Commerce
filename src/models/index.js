const Product = require("./Product");
const Category = require("./Category");
const User = require("./User");

Category.hasMany(Product, {
  foreignKey: "categoryId",
});

Product.belongsTo(Category, {
  foreignKey: "categoryId",
});

Category.hasMany(Category, {
  as: "subcategories",
  foreignKey: "parentId",
});

Category.belongsTo(Category, {
  as: "parent",
  foreignKey: "parentId",
});

module.exports = {
  Product,
  Category,
  User,
};
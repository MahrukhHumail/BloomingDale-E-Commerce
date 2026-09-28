const Product = require("./Product");
const Category = require("./Category");
const User = require("./User");

Category.hasMany(Product, {
  foreignKey: "categoryId",
});

Product.belongsTo(Category, {
  foreignKey: "categoryId",
});

module.exports = {
  Product,
  Category,
  User,
};
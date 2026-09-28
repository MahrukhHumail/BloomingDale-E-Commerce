const { Category } = require("../models");

const getCategories = async (req, res) => {
  try {
    const categories = await Category.findAll();

    res.json(categories);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch categories",
      error: error.message,
    });
  }
};

const createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({
        message: "Category name is required",
      });
    }

    const category = await Category.create({
      name,
      description,
    });

    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({
      message: "Failed to create category",
      error: error.message,
    });
  }
};

module.exports = {
  getCategories,
  createCategory,
};
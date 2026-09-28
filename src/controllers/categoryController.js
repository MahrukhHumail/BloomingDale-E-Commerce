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

    // Required field validation
    if (!name || !name.trim()) {
      return res.status(400).json({
        message: "Category name is required",
      });
    }

    // Check for duplicate category name
    const existingCategory = await Category.findOne({
      where: {
        name: name.trim(),
      },
    });

    if (existingCategory) {
      return res.status(409).json({
        message: "Category already exists",
      });
    }

    const category = await Category.create({
      name: name.trim(),
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

const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);

    if (!category) {
      return res.status(404).json({
        message: "Category not found",
      });
    }

    await category.destroy();

    res.json({
      message: "Category deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete category",
      error: error.message,
    });
  }
};

module.exports = {
  getCategories,
  createCategory,
  deleteCategory,
};
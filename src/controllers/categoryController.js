const { Category } = require("../models");
const slugify = require("slugify");

// GET ALL CATEGORIES
const getCategories = async (req, res) => {
  try {
    const categories = await Category.findAll({
      order: [["id", "ASC"]],
    });

    return res.status(200).json(categories);
  } catch (error) {
    console.error("GET CATEGORIES ERROR:", error);

    return res.status(500).json({
      message: "Failed to fetch categories",
      error: error.message,
    });
  }
};

// GET CATEGORY BY ID
const getCategoryById = async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);

    if (!category) {
      return res.status(404).json({
        message: "Category not found",
      });
    }

    return res.status(200).json(category);
  } catch (error) {
    console.error("GET CATEGORY ERROR:", error);

    return res.status(500).json({
      message: "Failed to fetch category",
      error: error.message,
    });
  }
};

// CHECK CATEGORY HIERARCHY FOR CYCLES
const wouldCreateCycle = async (categoryId, newParentId) => {
  let currentParentId = newParentId;

  while (currentParentId !== null && currentParentId !== undefined) {
    if (Number(currentParentId) === Number(categoryId)) {
      return true;
    }

    const parentCategory = await Category.findByPk(currentParentId);

    if (!parentCategory) {
      return false;
    }

    currentParentId = parentCategory.parentId;
  }

  return false;
};

// CREATE CATEGORY
const createCategory = async (req, res) => {
  try {
    const { name, description, parentId, active = true } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        message: "Category name is required",
      });
    }

    const trimmedName = name.trim();

    const existingCategory = await Category.findOne({
      where: { name: trimmedName },
    });

    if (existingCategory) {
      return res.status(409).json({
        message: "Category already exists",
      });
    }

    if (parentId !== undefined && parentId !== null) {
      const parentCategory = await Category.findByPk(parentId);

      if (!parentCategory) {
        return res.status(404).json({
          message: "Parent category not found",
        });
      }
    }

    const baseSlug = slugify(trimmedName, {
      lower: true,
      strict: true,
    });

    let slug = baseSlug;
    let counter = 1;

    while (await Category.findOne({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    const category = await Category.create({
      name: trimmedName,
      slug,
      description: description || null,
      parentId: parentId ?? null,
      active,
    });

    return res.status(201).json({
      message: "Category created successfully",
      category,
    });
  } catch (error) {
    console.error("CREATE CATEGORY ERROR:", error);

    return res.status(500).json({
      message: "Failed to create category",
      error: error.message,
    });
  }
};

// UPDATE CATEGORY
const updateCategory = async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);

    if (!category) {
      return res.status(404).json({
        message: "Category not found",
      });
    }

    const { name, description, parentId, active } = req.body;

    if (name !== undefined && !name.trim()) {
      return res.status(400).json({
        message: "Category name cannot be empty",
      });
    }

    const updatedName =
      name !== undefined ? name.trim() : category.name;

    // Check duplicate category name
    if (name !== undefined) {
      const existingCategory = await Category.findOne({
        where: { name: updatedName },
      });

      if (
        existingCategory &&
        existingCategory.id !== category.id
      ) {
        return res.status(409).json({
          message: "Category already exists",
        });
      }
    }

    // Validate parent category and prevent hierarchy cycles
    if (parentId !== undefined && parentId !== null) {
      if (Number(parentId) === Number(category.id)) {
        return res.status(400).json({
          message: "Category cannot be its own parent",
        });
      }

      const parentCategory = await Category.findByPk(parentId);

      if (!parentCategory) {
        return res.status(404).json({
          message: "Parent category not found",
        });
      }

      const cycleDetected = await wouldCreateCycle(
        category.id,
        parentId
      );

      if (cycleDetected) {
        return res.status(400).json({
          message: "Category cannot become its own ancestor",
        });
      }
    }

    // Generate a new unique slug if name changes
    let updatedSlug = category.slug;

    if (name !== undefined && updatedName !== category.name) {
      const baseSlug = slugify(updatedName, {
        lower: true,
        strict: true,
      });

      updatedSlug = baseSlug;
      let counter = 1;

      while (
        await Category.findOne({
          where: { slug: updatedSlug },
        })
      ) {
        updatedSlug = `${baseSlug}-${counter}`;
        counter++;
      }
    }

    await category.update({
      name: updatedName,
      slug: updatedSlug,
      description:
        description !== undefined
          ? description
          : category.description,
      parentId:
        parentId !== undefined
          ? parentId
          : category.parentId,
      active:
        active !== undefined
          ? active
          : category.active,
    });

    return res.status(200).json({
      message: "Category updated successfully",
      category,
    });
  } catch (error) {
    console.error("UPDATE CATEGORY ERROR:", error);

    return res.status(500).json({
      message: "Failed to update category",
      error: error.message,
    });
  }
};

// DELETE CATEGORY
const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);

    if (!category) {
      return res.status(404).json({
        message: "Category not found",
      });
    }

    const productCount = await Category.sequelize.models.Product.count({
      where: { categoryId: category.id },
    });

    if (productCount > 0) {
      return res.status(409).json({
        message:
          "Cannot delete category because it contains products",
      });
    }

    const subcategoryCount = await Category.count({
      where: { parentId: category.id },
    });

    if (subcategoryCount > 0) {
      return res.status(409).json({
        message:
          "Cannot delete category because it contains subcategories",
      });
    }

    await category.destroy();

    return res.status(200).json({
      message: "Category deleted successfully",
    });
  } catch (error) {
    console.error("DELETE CATEGORY ERROR:", error);

    return res.status(500).json({
      message: "Failed to delete category",
      error: error.message,
    });
  }
};

module.exports = {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
};
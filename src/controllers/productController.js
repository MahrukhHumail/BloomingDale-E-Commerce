const { Product, Category } = require("../models");
const { Op } = require("sequelize");
const slugify = require("slugify");

// GET ALL PRODUCTS
const getProducts = async (req, res) => {
  try {
    const {
      search,
      categoryId,
      status,
      page = 1,
      limit = 10,
      sortBy = "id",
      order = "ASC",
    } = req.query;

    const where = {};

    if (search) {
      where.name = {
        [Op.iLike]: `%${search}%`,
      };
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (status) {
      where.status = status;
    }

    const allowedSortFields = [
      "id",
      "name",
      "price",
      "stock",
      "createdAt",
    ];

    const safeSortBy = allowedSortFields.includes(sortBy)
      ? sortBy
      : "id";

    const safeOrder =
      order.toUpperCase() === "DESC" ? "DESC" : "ASC";

    const safeLimit = Math.min(Number(limit) || 10, 50);
    const safePage = Math.max(Number(page) || 1, 1);
    const offset = (safePage - 1) * safeLimit;

    const { count, rows } = await Product.findAndCountAll({
      where,
      include: [
        {
          model: Category,
          attributes: ["id", "name", "slug"],
        },
      ],
      order: [[safeSortBy, safeOrder]],
      limit: safeLimit,
      offset,
    });

    return res.status(200).json({
      products: rows,
      pagination: {
        total: count,
        page: safePage,
        limit: safeLimit,
        totalPages: Math.ceil(count / safeLimit),
      },
    });
  } catch (error) {
    console.error("GET PRODUCTS ERROR:", error);

    return res.status(500).json({
      message: "Failed to fetch products",
      error: error.message,
    });
  }
};

// GET PRODUCT BY ID
const getProductById = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id, {
      include: [
        {
          model: Category,
          attributes: ["id", "name", "slug"],
        },
      ],
    });

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    return res.status(200).json(product);
  } catch (error) {
    console.error("GET PRODUCT ERROR:", error);

    return res.status(500).json({
      message: "Failed to fetch product",
      error: error.message,
    });
  }
};

// CREATE PRODUCT
const createProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      stock = 0,
      categoryId,
      image,
      status = "draft",
    } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        message: "Product name is required",
      });
    }

    if (price === undefined || price === null || Number(price) <= 0) {
      return res.status(400).json({
        message: "Price must be greater than 0",
      });
    }

    if (Number(stock) < 0) {
      return res.status(400).json({
        message: "Stock cannot be negative",
      });
    }

    if (!categoryId) {
      return res.status(400).json({
        message: "Category ID is required",
      });
    }

    const category = await Category.findByPk(categoryId);

    if (!category) {
      return res.status(404).json({
        message: "Category not found",
      });
    }

    if (!["draft", "active", "archived"].includes(status)) {
      return res.status(400).json({
        message: "Invalid product status",
      });
    }

    const trimmedName = name.trim();

    const existingName = await Product.findOne({
      where: { name: trimmedName },
    });

    if (existingName) {
      return res.status(409).json({
        message: "Product already exists",
      });
    }

    const baseSlug = slugify(trimmedName, {
      lower: true,
      strict: true,
    });

    let slug = baseSlug;
    let counter = 1;

    while (await Product.findOne({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    const product = await Product.create({
      name: trimmedName,
      slug,
      description: description || null,
      status,
      price: Number(price),
      stock: Number(stock),
      categoryId: Number(categoryId),
      image: image || null,
    });

    return res.status(201).json({
      message: "Product created successfully",
      product,
    });
  } catch (error) {
    console.error("CREATE PRODUCT ERROR:", error);

    return res.status(500).json({
      message: "Failed to create product",
      error: error.message,
    });
  }
};

// UPDATE PRODUCT
const updateProduct = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    const {
      name,
      description,
      price,
      stock,
      categoryId,
      image,
      status,
    } = req.body;

    if (price !== undefined && Number(price) <= 0) {
      return res.status(400).json({
        message: "Price must be greater than 0",
      });
    }

    if (stock !== undefined && Number(stock) < 0) {
      return res.status(400).json({
        message: "Stock cannot be negative",
      });
    }

    if (
      status !== undefined &&
      !["draft", "active", "archived"].includes(status)
    ) {
      return res.status(400).json({
        message: "Invalid product status",
      });
    }

    if (categoryId !== undefined) {
      const category = await Category.findByPk(categoryId);

      if (!category) {
        return res.status(404).json({
          message: "Category not found",
        });
      }
    }

    let updatedName = product.name;
    let updatedSlug = product.slug;

    if (name !== undefined) {
      if (!name.trim()) {
        return res.status(400).json({
          message: "Product name cannot be empty",
        });
      }

      updatedName = name.trim();

      const existingProduct = await Product.findOne({
        where: {
          name: updatedName,
          id: {
            [Op.ne]: product.id,
          },
        },
      });

      if (existingProduct) {
        return res.status(409).json({
          message: "Product already exists",
        });
      }

      if (updatedName !== product.name) {
        const baseSlug = slugify(updatedName, {
          lower: true,
          strict: true,
        });

        updatedSlug = baseSlug;
        let counter = 1;

        while (
          await Product.findOne({
            where: {
              slug: updatedSlug,
              id: {
                [Op.ne]: product.id,
              },
            },
          })
        ) {
          updatedSlug = `${baseSlug}-${counter}`;
          counter++;
        }
      }
    }

    await product.update({
      name: updatedName,
      slug: updatedSlug,
      description:
        description !== undefined
          ? description
          : product.description,
      price:
        price !== undefined
          ? Number(price)
          : product.price,
      stock:
        stock !== undefined
          ? Number(stock)
          : product.stock,
      categoryId:
        categoryId !== undefined
          ? Number(categoryId)
          : product.categoryId,
      image:
        image !== undefined
          ? image
          : product.image,
      status:
        status !== undefined
          ? status
          : product.status,
    });

    return res.status(200).json({
      message: "Product updated successfully",
      product,
    });
  } catch (error) {
    console.error("UPDATE PRODUCT ERROR:", error);

    return res.status(500).json({
      message: "Failed to update product",
      error: error.message,
    });
  }
};

// DELETE PRODUCT
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    await product.destroy();

    return res.status(200).json({
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error("DELETE PRODUCT ERROR:", error);

    return res.status(500).json({
      message: "Failed to delete product",
      error: error.message,
    });
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
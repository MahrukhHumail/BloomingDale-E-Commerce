const { Variant, Product } = require("../models");

const createVariant = async (req, res) => {
  try {
    const { productId, name, options } = req.body;

    if (!productId || !name || !options) {
      return res.status(400).json({
        message: "Product ID, name and options are required",
      });
    }

    const product = await Product.findByPk(productId);

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    if (typeof options !== "object" || Array.isArray(options)) {
      return res.status(400).json({
        message: "Options must be an object",
      });
    }

    const variant = await Variant.create({
      productId,
      name: name.trim(),
      options,
    });

    return res.status(201).json({
      message: "Variant created successfully",
      variant,
    });
  } catch (error) {
    console.error("CREATE VARIANT ERROR:", error);

    return res.status(500).json({
      message: "Failed to create variant",
      error: error.message,
    });
  }
};

const getVariants = async (req, res) => {
  try {
    const where = {};

    if (req.params.productId) {
      where.productId = req.params.productId;
    }

    const variants = await Variant.findAll({
      where,
      include: [
        {
          model: Product,
          attributes: ["id", "name", "slug"],
        },
      ],
      order: [["id", "ASC"]],
    });

    return res.status(200).json(variants);
  } catch (error) {
    console.error("GET VARIANTS ERROR:", error);

    return res.status(500).json({
      message: "Failed to fetch variants",
      error: error.message,
    });
  }
};

const updateVariant = async (req, res) => {
  try {
    const variant = await Variant.findByPk(req.params.id);

    if (!variant) {
      return res.status(404).json({
        message: "Variant not found",
      });
    }

    const { name, options, active } = req.body;

    if (name !== undefined && !name.trim()) {
      return res.status(400).json({
        message: "Name cannot be empty",
      });
    }

    if (options !== undefined) {
      if (
        typeof options !== "object" ||
        Array.isArray(options)
      ) {
        return res.status(400).json({
          message: "Options must be an object",
        });
      }
    }

    await variant.update({
      name: name !== undefined ? name.trim() : variant.name,
      options: options !== undefined ? options : variant.options,
      active: active !== undefined ? active : variant.active,
    });

    return res.status(200).json({
      message: "Variant updated successfully",
      variant,
    });
  } catch (error) {
    console.error("UPDATE VARIANT ERROR:", error);

    return res.status(500).json({
      message: "Failed to update variant",
      error: error.message,
    });
  }
};

const deleteVariant = async (req, res) => {
  try {
    const variant = await Variant.findByPk(req.params.id);

    if (!variant) {
      return res.status(404).json({
        message: "Variant not found",
      });
    }

    await variant.destroy();

    return res.status(200).json({
      message: "Variant deleted successfully",
    });
  } catch (error) {
    console.error("DELETE VARIANT ERROR:", error);

    return res.status(500).json({
      message: "Failed to delete variant",
      error: error.message,
    });
  }
};

module.exports = {
  createVariant,
  getVariants,
  updateVariant,
  deleteVariant,
};
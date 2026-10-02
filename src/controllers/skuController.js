const { SKU, Variant } = require("../models");

const createSKU = async (req, res) => {
  try {
    const { variantId, code, price, stock, active } = req.body;

    if (!variantId || !code || price === undefined) {
      return res.status(400).json({
        message: "Variant ID, code and price are required",
      });
    }

    if (Number(price) <= 0) {
      return res.status(400).json({
        message: "Price must be greater than 0",
      });
    }

    if (stock !== undefined && Number(stock) < 0) {
      return res.status(400).json({
        message: "Stock cannot be negative",
      });
    }

    const variant = await Variant.findByPk(variantId);

    if (!variant) {
      return res.status(404).json({
        message: "Variant not found",
      });
    }

    const existingSKU = await SKU.findOne({
      where: {
        code: code.trim(),
      },
    });

    if (existingSKU) {
      return res.status(409).json({
        message: "SKU code already exists",
      });
    }

    const sku = await SKU.create({
      variantId,
      code: code.trim(),
      price,
      stock: stock === undefined ? 0 : stock,
      active: active === undefined ? true : active,
    });

    return res.status(201).json({
      message: "SKU created successfully",
      sku,
    });
  } catch (error) {
    console.error("CREATE SKU ERROR:", error);

    return res.status(500).json({
      message: "Failed to create SKU",
      error: error.message,
    });
  }
};

const getSKUs = async (req, res) => {
  try {
    const where = {};

    if (req.params.variantId) {
      where.variantId = req.params.variantId;
    }

    const skus = await SKU.findAll({
      where,
      include: [
        {
          model: Variant,
          attributes: ["id", "productId", "name", "options"],
        },
      ],
      order: [["id", "ASC"]],
    });

    return res.status(200).json(skus);
  } catch (error) {
    console.error("GET SKUS ERROR:", error);

    return res.status(500).json({
      message: "Failed to fetch SKUs",
      error: error.message,
    });
  }
};

const updateSKU = async (req, res) => {
  try {
    const sku = await SKU.findByPk(req.params.id);

    if (!sku) {
      return res.status(404).json({
        message: "SKU not found",
      });
    }

    const { code, price, stock, active } = req.body;

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

    if (code !== undefined) {
      if (!code.trim()) {
        return res.status(400).json({
          message: "SKU code cannot be empty",
        });
      }

      const existingSKU = await SKU.findOne({
        where: {
          code: code.trim(),
        },
      });

      if (existingSKU && existingSKU.id !== sku.id) {
        return res.status(409).json({
          message: "SKU code already exists",
        });
      }
    }

    await sku.update({
      code: code !== undefined ? code.trim() : sku.code,
      price: price !== undefined ? price : sku.price,
      stock: stock !== undefined ? stock : sku.stock,
      active: active !== undefined ? active : sku.active,
    });

    return res.status(200).json({
      message: "SKU updated successfully",
      sku,
    });
  } catch (error) {
    console.error("UPDATE SKU ERROR:", error);

    return res.status(500).json({
      message: "Failed to update SKU",
      error: error.message,
    });
  }
};

const deleteSKU = async (req, res) => {
  try {
    const sku = await SKU.findByPk(req.params.id);

    if (!sku) {
      return res.status(404).json({
        message: "SKU not found",
      });
    }

    await sku.destroy();

    return res.status(200).json({
      message: "SKU deleted successfully",
    });
  } catch (error) {
    console.error("DELETE SKU ERROR:", error);

    return res.status(500).json({
      message: "Failed to delete SKU",
      error: error.message,
    });
  }
};

module.exports = {
  createSKU,
  getSKUs,
  updateSKU,
  deleteSKU,
};
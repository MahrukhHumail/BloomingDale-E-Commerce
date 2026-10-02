"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("skus", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },

      variantId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "variants",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },

      code: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },

      price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },

      stock: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },

      active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },

      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn("NOW"),
      },

      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn("NOW"),
      },
    });

    await queryInterface.addConstraint("skus", {
      fields: ["stock"],
      type: "check",
      where: {
        stock: {
          [Sequelize.Op.gte]: 0,
        },
      },
      name: "skus_stock_non_negative",
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("skus");
  },
};
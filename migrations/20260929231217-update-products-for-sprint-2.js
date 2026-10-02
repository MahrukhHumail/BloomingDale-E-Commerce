"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("products", "slug", {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn("products", "status", {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: "draft",
    });

    // Give existing products unique slugs
    const [products] = await queryInterface.sequelize.query(
      'SELECT id, name FROM "products" ORDER BY id'
    );

    for (const product of products) {
      const slug = product.name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

      await queryInterface.sequelize.query(
        'UPDATE "products" SET "slug" = :slug WHERE "id" = :id',
        {
          replacements: {
            slug: `${slug}-${product.id}`,
            id: product.id,
          },
        }
      );
    }

    await queryInterface.changeColumn("products", "slug", {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn("products", "slug");
    await queryInterface.removeColumn("products", "status");
  },
};
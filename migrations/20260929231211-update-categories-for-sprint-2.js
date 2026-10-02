"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("categories", "parentId", {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: "categories",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    });

    await queryInterface.addColumn("categories", "slug", {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn("categories", "active", {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    });

    // Give existing categories unique slugs
    const [categories] = await queryInterface.sequelize.query(
      'SELECT id, name FROM "categories" ORDER BY id'
    );

    for (const category of categories) {
      const slug = category.name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

      await queryInterface.sequelize.query(
        'UPDATE "categories" SET "slug" = :slug WHERE "id" = :id',
        {
          replacements: {
            slug: `${slug}-${category.id}`,
            id: category.id,
          },
        }
      );
    }

    await queryInterface.changeColumn("categories", "slug", {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn("categories", "parentId");
    await queryInterface.removeColumn("categories", "slug");
    await queryInterface.removeColumn("categories", "active");
  },
};
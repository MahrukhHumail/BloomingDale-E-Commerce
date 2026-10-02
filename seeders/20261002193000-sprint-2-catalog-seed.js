"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();

    // =====================================================
    // CATEGORIES
    // =====================================================

    let [indoor] = await queryInterface.sequelize.query(
      `SELECT id FROM categories
       WHERE slug = 'indoor-plants' OR name = 'Indoor Plants'
       ORDER BY id ASC
       LIMIT 1`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (!indoor) {
      await queryInterface.sequelize.query(`
        INSERT INTO categories
        ("name", "slug", "description", "parentId", "active", "createdAt", "updatedAt")
        VALUES
        ('Indoor Plants', 'indoor-plants',
         'Plants suitable for indoor spaces',
         NULL, true, NOW(), NOW())
        ON CONFLICT DO NOTHING;
      `);

      [indoor] = await queryInterface.sequelize.query(
        `SELECT id FROM categories
         WHERE slug = 'indoor-plants' OR name = 'Indoor Plants'
         ORDER BY id ASC
         LIMIT 1`,
        { type: Sequelize.QueryTypes.SELECT }
      );
    }

    let [outdoor] = await queryInterface.sequelize.query(
      `SELECT id FROM categories
       WHERE slug = 'outdoor-plants' OR name = 'Outdoor Plants'
       ORDER BY id ASC
       LIMIT 1`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (!outdoor) {
      await queryInterface.sequelize.query(`
        INSERT INTO categories
        ("name", "slug", "description", "parentId", "active", "createdAt", "updatedAt")
        VALUES
        ('Outdoor Plants', 'outdoor-plants',
         'Plants suitable for outdoor spaces',
         NULL, true, NOW(), NOW())
        ON CONFLICT DO NOTHING;
      `);

      [outdoor] = await queryInterface.sequelize.query(
        `SELECT id FROM categories
         WHERE slug = 'outdoor-plants' OR name = 'Outdoor Plants'
         ORDER BY id ASC
         LIMIT 1`,
        { type: Sequelize.QueryTypes.SELECT }
      );
    }

    let [plantPots] = await queryInterface.sequelize.query(
      `SELECT id FROM categories
       WHERE slug = 'plant-pots' OR name = 'Plant Pots'
       ORDER BY id ASC
       LIMIT 1`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (!plantPots) {
      await queryInterface.sequelize.query(`
        INSERT INTO categories
        ("name", "slug", "description", "parentId", "active", "createdAt", "updatedAt")
        VALUES
        ('Plant Pots', 'plant-pots',
         'Pots and containers for plants',
         ${indoor.id}, true, NOW(), NOW())
        ON CONFLICT DO NOTHING;
      `);

      [plantPots] = await queryInterface.sequelize.query(
        `SELECT id FROM categories
         WHERE slug = 'plant-pots' OR name = 'Plant Pots'
         ORDER BY id ASC
         LIMIT 1`,
        { type: Sequelize.QueryTypes.SELECT }
      );
    }

    // Safety check
    if (!indoor || !outdoor) {
      throw new Error("Required categories could not be found.");
    }

    // =====================================================
    // PRODUCTS
    // =====================================================

    let [snakePlant] = await queryInterface.sequelize.query(
      `SELECT id FROM products
       WHERE slug = 'snake-plant-seed' OR name = 'Snake Plant'
       ORDER BY id ASC
       LIMIT 1`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (!snakePlant) {
      await queryInterface.sequelize.query(`
        INSERT INTO products
        ("name", "slug", "description", "status", "price", "stock",
         "categoryId", "image", "createdAt", "updatedAt")
        VALUES
        ('Snake Plant', 'snake-plant-seed',
         'Low maintenance indoor plant',
         'active', 1500.00, 10,
         ${indoor.id}, NULL, NOW(), NOW())
        ON CONFLICT DO NOTHING;
      `);

      [snakePlant] = await queryInterface.sequelize.query(
        `SELECT id FROM products
         WHERE slug = 'snake-plant-seed' OR name = 'Snake Plant'
         ORDER BY id ASC
         LIMIT 1`,
        { type: Sequelize.QueryTypes.SELECT }
      );
    }

    let [peaceLily] = await queryInterface.sequelize.query(
      `SELECT id FROM products
       WHERE slug = 'peace-lily-seed' OR name = 'Peace Lily'
       ORDER BY id ASC
       LIMIT 1`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (!peaceLily) {
      await queryInterface.sequelize.query(`
        INSERT INTO products
        ("name", "slug", "description", "status", "price", "stock",
         "categoryId", "image", "createdAt", "updatedAt")
        VALUES
        ('Peace Lily', 'peace-lily-seed',
         'Beautiful flowering indoor plant',
         'active', 1800.00, 8,
         ${indoor.id}, NULL, NOW(), NOW())
        ON CONFLICT DO NOTHING;
      `);

      [peaceLily] = await queryInterface.sequelize.query(
        `SELECT id FROM products
         WHERE slug = 'peace-lily-seed' OR name = 'Peace Lily'
         ORDER BY id ASC
         LIMIT 1`,
        { type: Sequelize.QueryTypes.SELECT }
      );
    }

    let [rosePlant] = await queryInterface.sequelize.query(
      `SELECT id FROM products
       WHERE slug = 'rose-plant-seed' OR name = 'Rose Plant'
       ORDER BY id ASC
       LIMIT 1`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (!rosePlant) {
      await queryInterface.sequelize.query(`
        INSERT INTO products
        ("name", "slug", "description", "status", "price", "stock",
         "categoryId", "image", "createdAt", "updatedAt")
        VALUES
        ('Rose Plant', 'rose-plant-seed',
         'Outdoor flowering plant',
         'active', 1200.00, 12,
         ${outdoor.id}, NULL, NOW(), NOW())
        ON CONFLICT DO NOTHING;
      `);

      [rosePlant] = await queryInterface.sequelize.query(
        `SELECT id FROM products
         WHERE slug = 'rose-plant-seed' OR name = 'Rose Plant'
         ORDER BY id ASC
         LIMIT 1`,
        { type: Sequelize.QueryTypes.SELECT }
      );
    }

    if (!snakePlant || !peaceLily || !rosePlant) {
      throw new Error("Required products could not be found.");
    }

    // =====================================================
    // VARIANTS
    // =====================================================

    let [smallGreen] = await queryInterface.sequelize.query(
      `SELECT id FROM variants
       WHERE name = 'Small Green'
       AND "productId" = ${snakePlant.id}
       LIMIT 1`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (!smallGreen) {
      await queryInterface.sequelize.query(`
        INSERT INTO variants
        ("productId", "name", "options", "active", "createdAt", "updatedAt")
        VALUES
        (${snakePlant.id}, 'Small Green',
         '{"size":"Small","color":"Green"}',
         true, NOW(), NOW())
        ON CONFLICT DO NOTHING;
      `);

      [smallGreen] = await queryInterface.sequelize.query(
        `SELECT id FROM variants
         WHERE name = 'Small Green'
         AND "productId" = ${snakePlant.id}
         LIMIT 1`,
        { type: Sequelize.QueryTypes.SELECT }
      );
    }

    let [largeGreen] = await queryInterface.sequelize.query(
      `SELECT id FROM variants
       WHERE name = 'Large Green'
       AND "productId" = ${snakePlant.id}
       LIMIT 1`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (!largeGreen) {
      await queryInterface.sequelize.query(`
        INSERT INTO variants
        ("productId", "name", "options", "active", "createdAt", "updatedAt")
        VALUES
        (${snakePlant.id}, 'Large Green',
         '{"size":"Large","color":"Green"}',
         true, NOW(), NOW())
        ON CONFLICT DO NOTHING;
      `);

      [largeGreen] = await queryInterface.sequelize.query(
        `SELECT id FROM variants
         WHERE name = 'Large Green'
         AND "productId" = ${snakePlant.id}
         LIMIT 1`,
        { type: Sequelize.QueryTypes.SELECT }
      );
    }

    let [standard] = await queryInterface.sequelize.query(
      `SELECT id FROM variants
       WHERE name = 'Standard'
       AND "productId" = ${peaceLily.id}
       LIMIT 1`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (!standard) {
      await queryInterface.sequelize.query(`
        INSERT INTO variants
        ("productId", "name", "options", "active", "createdAt", "updatedAt")
        VALUES
        (${peaceLily.id}, 'Standard',
         '{"size":"Standard"}',
         true, NOW(), NOW())
        ON CONFLICT DO NOTHING;
      `);

      [standard] = await queryInterface.sequelize.query(
        `SELECT id FROM variants
         WHERE name = 'Standard'
         AND "productId" = ${peaceLily.id}
         LIMIT 1`,
        { type: Sequelize.QueryTypes.SELECT }
      );
    }

    let [red] = await queryInterface.sequelize.query(
      `SELECT id FROM variants
       WHERE name = 'Red'
       AND "productId" = ${rosePlant.id}
       LIMIT 1`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (!red) {
      await queryInterface.sequelize.query(`
        INSERT INTO variants
        ("productId", "name", "options", "active", "createdAt", "updatedAt")
        VALUES
        (${rosePlant.id}, 'Red',
         '{"color":"Red"}',
         true, NOW(), NOW())
        ON CONFLICT DO NOTHING;
      `);

      [red] = await queryInterface.sequelize.query(
        `SELECT id FROM variants
         WHERE name = 'Red'
         AND "productId" = ${rosePlant.id}
         LIMIT 1`,
        { type: Sequelize.QueryTypes.SELECT }
      );
    }

    if (!smallGreen || !largeGreen || !standard || !red) {
      throw new Error("Required variants could not be found.");
    }

    // =====================================================
    // SKUs
    // =====================================================

    const skuData = [
      {
        variantId: smallGreen.id,
        code: "SNAKE-S-GREEN",
        price: 1500.0,
        stock: 10,
        active: true,
      },
      {
        variantId: largeGreen.id,
        code: "SNAKE-L-GREEN",
        price: 2200.0,
        stock: 5,
        active: true,
      },
      {
        variantId: standard.id,
        code: "PEACE-STANDARD",
        price: 1800.0,
        stock: 8,
        active: true,
      },
      {
        variantId: red.id,
        code: "ROSE-RED",
        price: 1200.0,
        stock: 0,
        active: false,
      },
    ];

    for (const sku of skuData) {
      await queryInterface.sequelize.query(`
        INSERT INTO skus
        ("variantId", "code", "price", "stock", "active",
         "createdAt", "updatedAt")
        VALUES
        (${sku.variantId},
         '${sku.code}',
         ${sku.price},
         ${sku.stock},
         ${sku.active},
         NOW(), NOW())
        ON CONFLICT DO NOTHING;
      `);
    }

    console.log("Sprint 2 catalog seed completed successfully.");
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("skus", {
      code: {
        [Sequelize.Op.in]: [
          "SNAKE-S-GREEN",
          "SNAKE-L-GREEN",
          "PEACE-STANDARD",
          "ROSE-RED",
        ],
      },
    });

    await queryInterface.bulkDelete("variants", {
      name: {
        [Sequelize.Op.in]: [
          "Small Green",
          "Large Green",
          "Standard",
          "Red",
        ],
      },
    });

    await queryInterface.bulkDelete("products", {
      slug: {
        [Sequelize.Op.in]: [
          "snake-plant-seed",
          "peace-lily-seed",
          "rose-plant-seed",
        ],
      },
    });

    await queryInterface.bulkDelete("categories", {
      slug: {
        [Sequelize.Op.in]: [
          "plant-pots",
          "indoor-plants",
          "outdoor-plants",
        ],
      },
    });

    console.log("Sprint 2 catalog seed rollback completed.");
  },
};
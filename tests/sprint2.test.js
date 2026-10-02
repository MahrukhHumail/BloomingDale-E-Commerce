const request = require("supertest");
const app = require("../src/app");
const {
  User,
  Category,
  Product,
  Variant,
  SKU,
} = require("../src/models");
const sequelize = require("../src/config/database");

let adminToken;
let customerToken;

describe("Sprint 2 - Catalog API", () => {
  beforeAll(async () => {
    await sequelize.authenticate();

    const adminEmail = `admin${Date.now()}@test.com`;
    const customerEmail = `customer${Date.now()}@test.com`;

    const adminRegister = await request(app)
      .post("/api/auth/register")
      .send({
        name: "Sprint Admin",
        email: adminEmail,
        password: "Admin123!",
        role: "admin",
      });

    expect([200, 201]).toContain(adminRegister.statusCode);

    const customerRegister = await request(app)
      .post("/api/auth/register")
      .send({
        name: "Sprint Customer",
        email: customerEmail,
        password: "Customer123!",
        role: "customer",
      });

    expect([200, 201]).toContain(customerRegister.statusCode);

    const adminLogin = await request(app)
      .post("/api/auth/login")
      .send({
        email: adminEmail,
        password: "Admin123!",
      });

    expect(adminLogin.statusCode).toBe(200);

    adminToken =
      adminLogin.body.token ||
      adminLogin.body.accessToken ||
      adminLogin.body.access_token;

    const customerLogin = await request(app)
      .post("/api/auth/login")
      .send({
        email: customerEmail,
        password: "Customer123!",
      });

    expect(customerLogin.statusCode).toBe(200);

    customerToken =
      customerLogin.body.token ||
      customerLogin.body.accessToken ||
      customerLogin.body.access_token;
  });

  // ==================================================
  // AUTHENTICATION
  // ==================================================

  test("register admin user", async () => {
    const response = await request(app)
      .post("/api/auth/register")
      .send({
        name: `Test Admin ${Date.now()}`,
        email: `testadmin${Date.now()}@test.com`,
        password: "Admin123!",
        role: "admin",
      });

    expect([200, 201]).toContain(response.statusCode);
  });

  test("register customer user", async () => {
    const response = await request(app)
      .post("/api/auth/register")
      .send({
        name: `Test Customer ${Date.now()}`,
        email: `testcustomer${Date.now()}@test.com`,
        password: "Customer123!",
        role: "customer",
      });

    expect([200, 201]).toContain(response.statusCode);
  });

  test("admin can login", async () => {
    const email = `loginadmin${Date.now()}@test.com`;

    await request(app)
      .post("/api/auth/register")
      .send({
        name: "Login Admin",
        email,
        password: "Admin123!",
        role: "admin",
      });

    const response = await request(app)
      .post("/api/auth/login")
      .send({
        email,
        password: "Admin123!",
      });

    expect(response.statusCode).toBe(200);

    expect(
      response.body.token ||
        response.body.accessToken ||
        response.body.access_token
    ).toBeTruthy();
  });

  test("customer can login", async () => {
    const email = `logincustomer${Date.now()}@test.com`;

    await request(app)
      .post("/api/auth/register")
      .send({
        name: "Login Customer",
        email,
        password: "Customer123!",
        role: "customer",
      });

    const response = await request(app)
      .post("/api/auth/login")
      .send({
        email,
        password: "Customer123!",
      });

    expect(response.statusCode).toBe(200);

    expect(
      response.body.token ||
        response.body.accessToken ||
        response.body.access_token
    ).toBeTruthy();
  });

  // ==================================================
  // CATEGORIES
  // ==================================================

  test("get categories", async () => {
    const response = await request(app)
      .get("/api/categories");

    expect(response.statusCode).toBe(200);
  });

  test("unauthenticated user cannot create category", async () => {
    const response = await request(app)
      .post("/api/categories")
      .send({
        name: `Unauthorized Category ${Date.now()}`,
      });

    expect(response.statusCode).toBe(401);
  });

  test("customer cannot create category", async () => {
    const response = await request(app)
      .post("/api/categories")
      .set("Authorization", `Bearer ${customerToken}`)
      .send({
        name: `Customer Category ${Date.now()}`,
      });

    expect(response.statusCode).toBe(403);
  });

  test("admin can create category", async () => {
    const response = await request(app)
      .post("/api/categories")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        name: `Admin Category ${Date.now()}`,
      });

    expect(response.statusCode).toBe(201);
    expect(response.body.category).toBeDefined();
  });

  test("admin cannot create a category cycle", async () => {
    const timestamp = Date.now();

    const parentCategory = await Category.create({
      name: `Cycle Parent ${timestamp}`,
      slug: `cycle-parent-${timestamp}`,
      active: true,
    });

    const childCategory = await Category.create({
      name: `Cycle Child ${timestamp}`,
      slug: `cycle-child-${timestamp}`,
      parentId: parentCategory.id,
      active: true,
    });

    const response = await request(app)
      .put(`/api/categories/${parentCategory.id}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        parentId: childCategory.id,
      });

    expect(response.statusCode).toBe(400);

    expect(response.body.message).toBe(
      "Category cannot become its own ancestor"
    );
  });

  // ==================================================
  // PRODUCTS
  // ==================================================

  test("get products with pagination", async () => {
    const response = await request(app)
      .get("/api/products?page=1&limit=10");

    expect(response.statusCode).toBe(200);
  });

  test("unauthenticated user cannot create product", async () => {
    const response = await request(app)
      .post("/api/products")
      .send({
        name: `Unauthorized Product ${Date.now()}`,
        price: 100,
        stock: 10,
        categoryId: 1,
      });

    expect(response.statusCode).toBe(401);
  });

  test("customer cannot create product", async () => {
    const response = await request(app)
      .post("/api/products")
      .set("Authorization", `Bearer ${customerToken}`)
      .send({
        name: `Customer Product ${Date.now()}`,
        price: 100,
        stock: 10,
        categoryId: 1,
      });

    expect(response.statusCode).toBe(403);
  });

  test("product with negative price is rejected", async () => {
    const response = await request(app)
      .post("/api/products")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        name: `Negative Price ${Date.now()}`,
        price: -100,
        stock: 10,
        categoryId: 1,
      });

    expect(response.statusCode).toBe(400);
  });

  test("product with negative stock is rejected", async () => {
    const response = await request(app)
      .post("/api/products")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        name: `Negative Stock ${Date.now()}`,
        price: 100,
        stock: -10,
        categoryId: 1,
      });

    expect(response.statusCode).toBe(400);
  });

  test("duplicate product slug is rejected", async () => {
    const slug = `duplicate-product-${Date.now()}`;

    const firstProduct = await request(app)
      .post("/api/products")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        name: `Duplicate Product One ${Date.now()}`,
        slug,
        price: 100,
        stock: 10,
        categoryId: 1,
      });

    expect(firstProduct.statusCode).toBe(201);

    const secondProduct = await request(app)
      .post("/api/products")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        name: `Duplicate Product Two ${Date.now()}`,
        slug,
        price: 200,
        stock: 20,
        categoryId: 1,
      });

    expect([400, 409]).toContain(secondProduct.statusCode);
  });

  test("admin can create product", async () => {
    const response = await request(app)
      .post("/api/products")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        name: `Admin Product ${Date.now()}`,
        price: 500,
        stock: 20,
        categoryId: 1,
        status: "active",
      });

    expect(response.statusCode).toBe(201);
    expect(response.body.product).toBeDefined();
  });

  // ==================================================
  // VARIANTS
  // ==================================================

  test("unauthenticated user cannot create variant", async () => {
    const product = await Product.findOne();

    const response = await request(app)
      .post("/api/variants")
      .send({
        productId: product.id,
        name: `Unauthorized Variant ${Date.now()}`,
        options: {
          size: "Small",
        },
      });

    expect(response.statusCode).toBe(401);
  });

  test("customer cannot create variant", async () => {
    const product = await Product.findOne();

    const response = await request(app)
      .post("/api/variants")
      .set("Authorization", `Bearer ${customerToken}`)
      .send({
        productId: product.id,
        name: `Customer Variant ${Date.now()}`,
        options: {
          size: "Small",
        },
      });

    expect(response.statusCode).toBe(403);
  });

  test("admin can create variant", async () => {
    const product = await Product.findOne();

    const response = await request(app)
      .post("/api/variants")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        productId: product.id,
        name: `Admin Variant ${Date.now()}`,
        options: {
          size: "Medium",
          color: "Green",
        },
      });

    expect(response.statusCode).toBe(201);
    expect(response.body.variant).toBeDefined();
  });

  test("variant with invalid product is rejected", async () => {
    const response = await request(app)
      .post("/api/variants")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        productId: 999999,
        name: `Invalid Product Variant ${Date.now()}`,
        options: {
          size: "Small",
        },
      });

    expect(response.statusCode).toBe(404);
  });

  // ==================================================
  // SKUS
  // ==================================================

  test("unauthenticated user cannot create SKU", async () => {
    const variant = await Variant.findOne();

    const response = await request(app)
      .post("/api/skus")
      .send({
        variantId: variant.id,
        code: `UNAUTH-${Date.now()}`,
        price: 100,
        stock: 10,
      });

    expect(response.statusCode).toBe(401);
  });

  test("customer cannot create SKU", async () => {
    const variant = await Variant.findOne();

    const response = await request(app)
      .post("/api/skus")
      .set("Authorization", `Bearer ${customerToken}`)
      .send({
        variantId: variant.id,
        code: `CUSTOMER-${Date.now()}`,
        price: 100,
        stock: 10,
      });

    expect(response.statusCode).toBe(403);
  });

  test("SKU with invalid variant is rejected", async () => {
    const response = await request(app)
      .post("/api/skus")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        variantId: 999999,
        code: `INVALID-VARIANT-${Date.now()}`,
        price: 100,
        stock: 10,
      });

    expect(response.statusCode).toBe(404);
  });

  test("SKU with negative stock is rejected", async () => {
    const variant = await Variant.findOne();

    const response = await request(app)
      .post("/api/skus")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        variantId: variant.id,
        code: `NEGATIVE-STOCK-${Date.now()}`,
        price: 100,
        stock: -5,
      });

    expect(response.statusCode).toBe(400);
  });

  test("admin can create SKU", async () => {
    const variant = await Variant.findOne();

    const response = await request(app)
      .post("/api/skus")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        variantId: variant.id,
        code: `TEST-SKU-${Date.now()}`,
        price: 150,
        stock: 10,
      });

    expect(response.statusCode).toBe(201);
    expect(response.body.sku).toBeDefined();
  });

  test("duplicate SKU code is rejected", async () => {
    const variant = await Variant.findOne();
    const code = `DUPLICATE-SKU-${Date.now()}`;

    const firstSku = await request(app)
      .post("/api/skus")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        variantId: variant.id,
        code,
        price: 100,
        stock: 10,
      });

    expect(firstSku.statusCode).toBe(201);

    const secondSku = await request(app)
      .post("/api/skus")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        variantId: variant.id,
        code,
        price: 200,
        stock: 20,
      });

    expect(secondSku.statusCode).toBe(409);
  });

  test("get SKUs", async () => {
    const response = await request(app)
      .get("/api/skus");

    expect(response.statusCode).toBe(200);
  });

  test("admin can update SKU stock", async () => {
    const sku = await SKU.findOne();

    const response = await request(app)
      .patch(`/api/skus/${sku.id}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        stock: 25,
      });

    expect(response.statusCode).toBe(200);
    expect(Number(response.body.sku.stock)).toBe(25);
  });
});

afterAll(async () => {
  await sequelize.close();
});
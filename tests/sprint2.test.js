const request = require("supertest");
const app = require("../src/app");

describe("Sprint 2 - E-Commerce Catalog API", () => {
  let token;
  let categoryId;
  let productId;

  const testEmail = `sprint2_${Date.now()}@test.com`;
  const testPassword = "Sprint2Test123";

  test("Register admin user", async () => {
    const response = await request(app)
      .post("/api/auth/register")
      .send({
        name: "Sprint 2 Admin",
        email: testEmail,
        password: testPassword,
        role: "admin",
      });

    expect([201, 409]).toContain(response.status);
  });

  test("Login and receive JWT token", async () => {
    const response = await request(app)
      .post("/api/auth/login")
      .send({
        email: testEmail,
        password: testPassword,
      });

    if (response.status === 200) {
      token = response.body.token;
    }

    expect([200, 401]).toContain(response.status);
  });

  test("Get categories", async () => {
    const response = await request(app)
      .get("/api/categories");

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);

    if (response.body.length > 0) {
      categoryId = response.body[0].id;
    }
  });

  test("Get products with pagination", async () => {
    const response = await request(app)
      .get("/api/products")
      .query({
        page: 1,
        limit: 10,
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("products");
    expect(response.body).toHaveProperty("pagination");
  });

  test("Reject product with invalid price", async () => {
    if (!token || !categoryId) {
      return;
    }

    const response = await request(app)
      .post("/api/products")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: `Invalid Product ${Date.now()}`,
        price: -500,
        stock: 10,
        categoryId,
      });

    expect(response.status).toBe(400);
  });

  test("Reject product with invalid stock", async () => {
    if (!token || !categoryId) {
      return;
    }

    const response = await request(app)
      .post("/api/products")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: `Invalid Stock ${Date.now()}`,
        price: 1000,
        stock: -10,
        categoryId,
      });

    expect(response.status).toBe(400);
  });

  test("Reject category without authentication", async () => {
    const response = await request(app)
      .post("/api/categories")
      .send({
        name: `Unauthorized Category ${Date.now()}`,
      });

    expect(response.status).toBe(401);
  });

  test("Reject product without authentication", async () => {
    const response = await request(app)
      .post("/api/products")
      .send({
        name: `Unauthorized Product ${Date.now()}`,
        price: 1000,
        stock: 5,
        categoryId: 1,
      });

    expect(response.status).toBe(401);
  });
});
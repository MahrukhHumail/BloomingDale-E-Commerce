# BloomingDale E-Commerce API
## Sprint 2 — Catalog, Validation & Data Integrity

---

## 1. Sprint Goal and Scope

The main goal of Sprint 2 was to improve the BloomingDale E-Commerce API by strengthening product and category management, adding catalog validation, introducing category hierarchy, improving product search and pagination, and protecting administrative operations through authentication.

### Sprint 2 Scope

The following features were implemented:

- Category hierarchy using parent-child relationships
- Category slugs
- Category active/inactive status
- Product slugs
- Product status management
- Product search and filtering
- Product pagination and sorting
- Product price and stock validation
- Duplicate category and product validation
- Parent category validation
- Category deletion protection
- JWT-based authentication for protected catalog operations
- Automated Sprint 2 API tests

---

## 2. Sprint 1 Decisions Reused or Changed

### Reused from Sprint 1

The following Sprint 1 decisions were retained:

- Node.js and Express are used for the backend API.
- PostgreSQL is used as the database.
- Sequelize is used as the ORM.
- JWT is used for authentication.
- bcrypt is used for password hashing.
- REST-style API routes are used.
- Products belong to categories through `categoryId`.

### Changed or Extended in Sprint 2

Sprint 2 extended the original catalog implementation with:

- Category parent-child relationships.
- Unique slugs for categories and products.
- Product lifecycle status.
- Category active status.
- Additional request validation.
- Search, filtering, pagination and sorting for products.
- Protected create, update and delete operations.
- Data-integrity checks before deleting categories.

---

## 3. Updated Data Model and Data Dictionary

### 3.1 Categories

| Field | Type | Rules |
|---|---|---|
| id | Integer | Primary key, auto-increment |
| parentId | Integer | Nullable, references categories.id |
| name | String | Required |
| slug | String | Required, unique |
| description | Text | Optional |
| active | Boolean | Required, default true |
| createdAt | DateTime | Automatically generated |
| updatedAt | DateTime | Automatically updated |

### 3.2 Products

| Field | Type | Rules |
|---|---|---|
| id | Integer | Primary key, auto-increment |
| name | String | Required |
| slug | String | Required, unique |
| description | Text | Optional |
| status | String | draft, active or archived |
| price | Decimal | Required, greater than 0 |
| stock | Integer | Required, minimum 0 |
| categoryId | Integer | Required, references categories.id |
| image | String | Optional |
| createdAt | DateTime | Automatically generated |
| updatedAt | DateTime | Automatically updated |

### 3.3 Users

Users are used for authentication and authorization.

Important fields include:

- id
- name
- email
- password
- role

Supported roles include:

- admin
- customer

Passwords are stored using bcrypt hashing rather than plain text.

---

## 4. Relationships and Referential Integrity

### Category → Category

A category can have a parent category.

Relationship:

```text
Category
   |
   └── parentId
         |
         └── Category.id
```

The `parentId` field is nullable, which allows root categories.

Example:

```text
Indoor Plants
    |
    └── Plant Pots
```

In this example, `Plant Pots` has `parentId = 1`.

### Category → Product

A category can contain multiple products.

```text
Category 1 ────────< Product
```

Each product must belong to an existing category.

### Delete Policy

A category cannot be deleted if:

- It contains products, or
- It contains subcategories.

This prevents accidental removal of categories that are still being used by the catalog.

---

## 5. Validation and Data Integrity Rules

The API validates important business rules before saving data.

### Category Validation

- Category name is required.
- Duplicate category names are rejected.
- Parent category must exist.
- A category cannot be its own parent.
- Category slugs are generated automatically.
- Category slugs must be unique.

### Product Validation

- Product name is required.
- Product names must be unique.
- Price must be greater than zero.
- Stock cannot be negative.
- Category must exist.
- Product status must be one of:

```text
draft
active
archived
```

- Product slugs are generated automatically and must be unique.

### Authentication Validation

Create, update and delete catalog operations require an access token.

Requests without a valid token receive:

```json
{
  "message": "Access token required"
}
```

---

## 6. Administration and Catalog Routes

### Authentication Routes

| Method | Route | Purpose | Authentication |
|---|---|---|---|
| POST | `/api/auth/register` | Register user | No |
| POST | `/api/auth/login` | Login user and receive JWT | No |

### Category Routes

| Method | Route | Purpose | Authentication |
|---|---|---|---|
| GET | `/api/categories` | Get all categories | No |
| GET | `/api/categories/:id` | Get category by ID | No |
| POST | `/api/categories` | Create category | Yes |
| PUT | `/api/categories/:id` | Update category | Yes |
| DELETE | `/api/categories/:id` | Delete category | Yes |

### Product Routes

| Method | Route | Purpose | Authentication |
|---|---|---|---|
| GET | `/api/products` | Get products | No |
| GET | `/api/products/:id` | Get product by ID | No |
| POST | `/api/products` | Create product | Yes |
| PUT | `/api/products/:id` | Update product | Yes |
| DELETE | `/api/products/:id` | Delete product | Yes |

---

## 7. Product Search, Filtering and Pagination

The product listing endpoint supports:

### Search

Products can be searched by name.

Example:

```text
GET /api/products?search=snake
```

### Category Filtering

Products can be filtered by category:

```text
GET /api/products?categoryId=1
```

### Status Filtering

Products can be filtered by status:

```text
GET /api/products?status=active
```

### Pagination

The API supports:

```text
GET /api/products?page=1&limit=10
```

The response includes:

- total products
- current page
- page limit
- total pages

### Sorting

Products can be sorted using fields such as:

- id
- name
- price
- stock
- createdAt

Supported order values:

```text
ASC
DESC
```

---

## 8. Sprint 2 Demonstration Data

The implemented database contains catalog demonstration data.

Example categories include:

- Indoor Plants
- Outdoor Plants
- Succulents
- Plant Pots

The category hierarchy was demonstrated using:

```text
Indoor Plants Updated
    |
    └── Plant Pots
```

Example products include:

- Snake Plant
- Peace Lily

Example product data included prices, stock quantities, images and product status.

---

## 9. Demonstrated Rejection Paths

The following invalid operations were tested successfully.

### Invalid Product Price

Request:

```json
{
  "price": -500
}
```

Result:

```text
400 Bad Request
Price must be greater than 0
```

### Invalid Product Stock

Request:

```json
{
  "stock": -10
}
```

Result:

```text
400 Bad Request
Stock cannot be negative
```

### Invalid Parent Category

A category was created with a non-existing parent category ID.

Result:

```text
404 Parent category not found
```

### Duplicate Category

Creating a category with an existing name resulted in:

```text
409 Category already exists
```

### Category Deletion Protection

A category containing products was requested for deletion.

Result:

```text
409 Conflict
```

The category was not deleted because it was still referenced by products.

### Unauthorized Catalog Operation

A protected create operation was attempted without an access token.

Result:

```text
401 Access token required
```

---

## 10. Automated Test Strategy

Jest and Supertest were used for Sprint 2 API testing.

Test file:

```text
tests/sprint2.test.js
```

The automated tests cover:

1. Admin user registration
2. Admin login and JWT token generation
3. Category retrieval
4. Product pagination
5. Invalid product price rejection
6. Invalid product stock rejection
7. Unauthorized category creation rejection
8. Unauthorized product creation rejection

### Test Command

```bash
npm test -- --runInBand tests/sprint2.test.js
```

### Test Result

```text
Test Suites: 1 passed, 1 total
Tests:       8 passed, 8 total
```

Therefore, all eight Sprint 2 automated tests passed successfully.

---

## 11. API Documentation

Swagger/OpenAPI documentation is available through:

```text
http://localhost:5000/api-docs
```

The Swagger interface provides interactive documentation and testing for the implemented API endpoints.

Protected endpoints can be tested by providing the JWT access token through the Swagger authorization feature.

---

## 12. Database Migration Changes

Sprint 2 database changes were implemented through Sequelize migrations.

### Category Migration

The category migration added:

- `parentId`
- `slug`
- `active`

Existing category records were also assigned generated slugs.

### Product Migration

The product migration added:

- `slug`
- `status`

Existing product records were assigned generated slugs.

These changes allow the Sprint 2 model and API requirements to work with the existing Sprint 1 data.

---

## 13. Known Limitations and Sprint 3 Backlog

The following features can be considered for future development:

- Advanced role-based authorization for every administrative endpoint
- Product image upload instead of image filename/URL storage
- Inventory transaction management
- Shopping cart functionality
- Customer orders
- Order status management
- Payment integration
- Product reviews and ratings
- Advanced category tree responses
- Automated database cleanup after integration tests
- Expanded automated test coverage
- Frontend integration

---

## 14. Sprint 2 Completion Summary

Sprint 2 successfully extended the BloomingDale E-Commerce API from a basic catalog into a more structured and validated catalog management system.

The sprint implemented:

- Hierarchical categories
- Unique slugs
- Product status
- Product filtering and pagination
- Validation rules
- Authentication-protected catalog operations
- Referential integrity checks
- Delete protection
- Swagger API documentation
- Automated API testing

The Sprint 2 automated test suite completed with:

```text
8/8 tests passed
```

This confirms that the main Sprint 2 catalog, validation and authentication scenarios were successfully demonstrated.

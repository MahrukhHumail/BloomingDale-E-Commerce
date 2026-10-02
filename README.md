
# BloomingDale E-Commerce API

BloomingDale is a plant and gardening e-commerce backend API built with Node.js, Express, PostgreSQL, and Sequelize.

The project provides authentication, role-based authorization, category management, product management, product variants, and SKU management.

## Technologies

- Node.js
- Express.js
- PostgreSQL
- Sequelize ORM
- JWT Authentication
- bcryptjs
- Jest
- Supertest
- Swagger/OpenAPI

## Project Structure

```text
ecommerce-catalog/
│
├── config/
├── migrations/
├── seeders/
├── src/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   └── utils/
│
├── tests/
├── docs/
├── .env
├── .gitignore
├── package.json
└── server.js
```

Requirements
Before running the project, install:

- Node.js
- PostgreSQL
- npm
  Recommended Node.js version: Node 20+
  Installation
  Clone the repository and enter the project directory:
  git clone https://github.com/MahrukhHumail/BloomingDale-E-Commerce.git
  cd BloomingDale-E-Commerce

Install dependencies:
npm install

Environment Variables
Create a .env file in the project root.
Example:
PORT=5000

DB_HOST=localhost
DB_PORT=5432
DB_NAME=ecommerce_catalog
DB_USER=postgres
DB_PASSWORD=your_database_password

JWT_SECRET=your_jwt_secret

Do not commit .env or real passwords/secrets to GitHub.
Database Setup
Create a PostgreSQL database with the same name used in DB_NAME.
Then run the migrations:
npx sequelize-cli db:migrate

To check migration status:
npx sequelize-cli db:migrate:status

Seed Demo Data
Run the Sprint 2 catalog seed:
npx sequelize-cli db:seed:all

The seed provides:

- Categories
- A two-level category hierarchy
- Multiple products
- Product variants
- Multiple SKUs
- A multi-variant product
- An unavailable SKU combination
  The seed is designed to be safe to run again without creating duplicate catalog records.
  Run the API
  Start the development server:
  npm run dev

Or start the server normally:
npm start

The API runs on:
http://localhost:5000

Main API Routes
Authentication
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me

Categories
GET    /api/categories
GET    /api/categories/:id
POST   /api/categories
PUT    /api/categories/:id
DELETE /api/categories/:id

Products
GET    /api/products
GET    /api/products/:id
POST   /api/products
PUT    /api/products/:id
DELETE /api/products/:id

Variants
GET    /api/variants
GET    /api/variants/:id
GET    /api/variants/product/:productId
POST   /api/variants
PUT    /api/variants/:id
DELETE /api/variants/:id

SKUs
GET    /api/skus
GET    /api/skus/:id
GET    /api/skus/variant/:variantId
POST   /api/skus
PUT    /api/skus/:id
DELETE /api/skus/:id

Authentication and Authorization
The API uses JWT-based authentication.
Protected endpoints require an access token in the Authorization header:
Authorization: Bearer <access-token></access>

The system supports role-based access control.
Current roles include:

- Admin
- Customer
- Staff
  Administrative catalog operations require appropriate authorization.
  Unauthenticated requests receive:
  401 Unauthorized

Authenticated users without the required role receive:
403 Forbidden

Catalog Model
The Sprint 2 catalog uses the following structure:
Category
   ↓
Product
   ↓
Variant
   ↓
SKU

Category
A category organizes products and can optionally have a parent category.
Category slugs are unique.
Category hierarchy prevents a category from becoming its own ancestor.
Product
A product represents the main plant/catalog item.
Products contain:

- Name
- Slug
- Description
- Price
- Stock
- Status
- Category
- Image
  Variant
  A variant represents a selectable product variation.
  Examples:
  Small Green
  Large Green
  Red
  Standard

SKU
A SKU represents a concrete sellable combination.
Each SKU has:

- Unique code
- Price
- Stock
- Active status
- Variant relationship
  SKU stock cannot be negative.
  SKU codes must be unique.
  Validation
  The API validates important catalog rules including:
- Required product fields
- Positive product price
- Non-negative product stock
- Unique product slug
- Valid category
- Required variant fields
- Valid product for variants
- Required SKU fields
- Positive SKU price
- Non-negative SKU stock
- Unique SKU code
- Valid variant for SKU
- Valid category parent
- Category hierarchy cycle prevention
  Testing
  The project uses Jest and Supertest for automated API testing.
  Run the complete test suite:
  npm test -- --runInBand

The tests cover:

- User registration
- User login
- Authentication
- Role-based authorization
- Category access
- Product access
- Product validation
- Variant authorization
- SKU authorization
- Invalid relationships
- Negative stock validation
- Duplicate SKU validation
- Catalog creation and updates
  Sprint 2 Documentation
  Detailed Sprint 2 documentation is available at:
  docs/SPRINT_2.md

It contains:

- Sprint scope
- Data model
- ERD
- API routes
- Validation rules
- Authentication and authorization
- Business rules
- Seed data
- Automated testing
- Migration details
- Sprint 3 foundation
  API Documentation
  If Swagger/OpenAPI is enabled in the application, the API documentation can be accessed through the configured Swagger endpoint.
  Protected endpoints use Bearer token authentication.
  Development Notes
  The project uses Sequelize migrations for database structure changes.
  Database schema changes should be made through migrations rather than manually modifying the database.
  Demo catalog data should be added through seeders.
  Sensitive information such as database passwords, JWT secrets, and environment-specific credentials must remain in .env and must not be committed to the repository.
  Sprint 2 Status
  Sprint 2 focuses on catalog management and the foundation required for future cart and order functionality.
  Implemented:
- Category hierarchy
- Product management
- Product variants
- SKU management
- Admin authorization
- Catalog validation
- Database migrations
- Demo seed data
- Automated API tests
- Category hierarchy cycle prevention
- Sprint 2 documentation

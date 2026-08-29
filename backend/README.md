# BizGuide AI — Backend (Step 1: Inventory Management)

Node.js + Express + MySQL (Sequelize) backend implementing the schema and
first module from the planning chat: **Auth → Businesses → Products (Inventory Management)**.

This has been built, installed, and tested end-to-end (register → login →
create business → add/list/search/update/delete products → access-control
checks) against a live MySQL-compatible database.

## Stack
- **Backend:** Node.js + Express
- **Database:** MySQL (works with MySQL 8 or MariaDB — same client library, `mysql2`)
- **ORM:** Sequelize
- **Auth:** JWT + bcrypt password hashing

## Project structure
```
backend/
  server.js                # entry point: connects DB, syncs models, starts Express
  src/
    app.js                 # Express app, route mounting, error handling
    config/db.js            # Sequelize connection
    models/                 # one file per table + index.js wiring associations
    controllers/             # business logic per resource
    routes/                 # Express routers
    middleware/auth.js       # JWT verification middleware
```

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env` and fill in your MySQL credentials:
   ```bash
   cp .env.example .env
   ```

3. Create the database (MySQL / MariaDB):
   ```sql
   CREATE DATABASE bizguide_ai;
   ```

4. Start the server:
   ```bash
   npm run dev     # with nodemon, auto-restart
   # or
   npm start
   ```

   On boot, the server connects to MySQL and calls `sequelize.sync()`, which
   creates all 11 tables (users, businesses, products, suppliers, customers,
   purchases, purchase_items, sales, sale_items, notes, reminders) if they
   don't exist yet, matching the schema from planning.

## API Reference

All endpoints are prefixed with `/api`. Protected routes require:
`Authorization: Bearer <token>`

### Auth
| Method | Route | Body | Notes |
|---|---|---|---|
| POST | `/auth/register` | `{ name, email, password }` | Returns JWT + user |
| POST | `/auth/login` | `{ email, password }` | Returns JWT + user |
| GET | `/auth/me` | — | Requires token |

### Businesses (requires token)
| Method | Route | Body |
|---|---|---|
| POST | `/businesses` | `{ business_name, business_type }` |
| GET | `/businesses` | — (lists only businesses owned by you) |
| GET | `/businesses/:businessId` | — |
| PUT | `/businesses/:businessId` | `{ business_name?, business_type? }` |
| DELETE | `/businesses/:businessId` | — |

### Products — Inventory Management (requires token; nested under a business)
| Method | Route | Body / Query |
|---|---|---|
| POST | `/businesses/:businessId/products` | `{ product_name, category?, quantity?, buy_price?, selling_price? }` |
| GET | `/businesses/:businessId/products` | `?search=&category=&page=&limit=` |
| GET | `/businesses/:businessId/products/:productId` | — |
| PUT | `/businesses/:businessId/products/:productId` | any subset of product fields |
| DELETE | `/businesses/:businessId/products/:productId` | — |

Every product/business route checks that the resource actually belongs to
the logged-in user (via `user_id` → `business_id` ownership), so one user
can never see or edit another user's data — this was verified in testing.

## Example flow (curl)

```bash
# 1. Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Amana","email":"amana@example.com","password":"secret123"}'
# → { token, user }

TOKEN="<paste token here>"

# 2. Create a business
curl -X POST http://localhost:5000/api/businesses \
  -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN" \
  -d '{"business_name":"Amana Hardware Store","business_type":"hardware_store"}'
# → { business: { business_id: 1, ... } }

# 3. Add a product
curl -X POST http://localhost:5000/api/businesses/1/products \
  -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN" \
  -d '{"product_name":"Cement","category":"Building Materials","quantity":50,"buy_price":2000,"selling_price":2300}'

# 4. Search products
curl "http://localhost:5000/api/businesses/1/products?search=cem" \
  -H "Authorization: Bearer $TOKEN"
```

## What's next (per the original plan)
1. **Suppliers & Customers CRUD** — same pattern as Products.
2. **Purchases** (increase stock) and **Sales** (decrease stock) — these
   need transactional logic (e.g. a sale reduces `products.quantity`, wrapped
   in a DB transaction so partial failures don't corrupt stock counts).
3. **Notes & Reminders** — simple CRUD, same pattern already established.
4. **Frontend** — React + Material UI, calling this API.
5. **AI Service** — once real data exists, add an endpoint that lets the AI
   query sales/inventory data and answer questions in natural language.

The controllers/models here already follow a consistent pattern
(`ensureBusinessAccess` → CRUD), so extending to Suppliers, Customers,
Purchases, Sales, Notes, and Reminders is mostly copy-and-adapt from
`productController.js`.

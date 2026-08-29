# BizGuide

A small-business management app: React (Material UI) frontend talking to a
Node.js + Express + MySQL backend. This stage covers **Auth → Businesses →
Inventory** (add/view/edit/delete/search products), fully built and tested.

```
bizguide/
  backend/     Express API + MySQL (Sequelize) — see backend/README.md
  frontend/    React + MUI app — this README covers it below
```

## Run it locally

### 1. Backend
```bash
cd backend
npm install
cp .env.example .env      # fill in your MySQL credentials
# create the database first: CREATE DATABASE bizguide;
npm run dev                # http://localhost:5000
```

### 2. Frontend
```bash
cd frontend
npm install
cp .env.example .env       # VITE_API_URL, defaults to http://localhost:5000/api
npm run dev                 # http://localhost:5173
```

Open the frontend URL, register an account, create a business, and start
adding products — every action goes through the real API (nothing is mocked).

## What's in the UI

- **Login / Register** — JWT auth, token stored client-side, attached to
  every API call automatically.
- **Choose a business** — pick an existing business or create a new one;
  the selection is remembered as you navigate.
- **Inventory** — a searchable, sortable-by-nature product table: add,
  edit, and delete products, with a live low-stock indicator. Search is
  debounced and hits the backend's `?search=` query directly.

## Design notes

BizGuide's look is meant to feel like a digital ledger rather than a
generic SaaS dashboard: a warm parchment background, navy "ink" structure,
a single amber accent reserved for actions, and monospaced tabular figures
for every price and stock count (in `src/theme.js`, see `numeralSx`) so
numbers line up the way they would in a paper ledger. The sidebar nav uses
small colored "ledger tabs" to mark each section — currently just
Inventory, with room for Suppliers, Customers, Sales, and Reminders as
those modules ship.

## Next steps
1. Suppliers & Customers pages (same CRUD + search pattern as Inventory).
2. Purchases (increase stock) and Sales (decrease stock) — with a
   dedicated screen for recording a sale/purchase against existing products.
3. Notes & Reminders.
4. The AI assistant layer described in the original plan, once there's
   real transactional data to ask questions about.

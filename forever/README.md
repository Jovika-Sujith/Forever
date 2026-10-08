# E-Commerce Store (MERN Stack)

Three separate apps that work together:
- **backend** — Express + MongoDB API
- **frontend** — the customer-facing store (browse, cart, checkout via Cash on Delivery)
- **admin** — a separate dashboard for managing products and orders

This is based on a public open-source project, but I found and fixed several real
bugs in it before handing it to you (see "Bugs found and fixed" below) — it did
not work correctly out of the box.

## What works

- Customer registration/login, browsing products, adding to cart (with size
  selection), placing an order via **Cash on Delivery**
- Customer order history with a **Print Bill** button that opens a proper
  itemized receipt (items, quantities, total, delivery address) for printing
- Admin login (separate dashboard, separate URL) to add/edit/remove products
  and view + update order status (Order Placed → Shipped → Delivered)
- Product images upload via Cloudinary (free tier — see below)

## What does NOT work (by design, per your request)

- **Razorpay and Stripe online payment are not implemented** — those buttons/functions
  exist as empty stubs in the original project and were never finished. Cash on
  Delivery is the only working payment method, which is why the "Print Bill" feature
  exists as the practical way to give a customer proof of their order.

## Bugs found and fixed before handing this to you

1. **`userController.js`** — the login error handler referenced a variable that
   didn't exist (`error` instead of `err`), which would have crashed instead of
   showing a clean error message.
2. **`middleware/auth.js`** — the response parameter was misnamed (`resizeBy`
   instead of `res`), causing a crash on any expired or invalid login token —
   this would have affected every logged-in customer action.
3. **"Add to Cart" was completely broken** — the cart route was wired to the
   admin's "create new product" function instead of the actual add-to-cart logic.
   Clicking "Add to Cart" would have failed outright.
4. **7 separate broken API URLs** across the admin and customer apps — inconsistent
   use of a leading `/` when building request URLs, meaning depending on how you
   set `VITE_BACKEND_URL`, several key actions (including **admin login**) could
   have silently failed.
5. **Customer's most recent order was hidden** — the "My Orders" page skipped the
   first (newest) order due to an off-by-one array slice. I rewrote this page to
   show all orders correctly, grouped properly per order (not flattened), plus
   added the Print Bill feature.

## Setup

### 1. MongoDB Atlas
- Create a free M0 cluster at https://www.mongodb.com/cloud/atlas/register
- Database Access → create a user + password
- Network Access → Allow Access from Anywhere (0.0.0.0/0) for local dev
- Connect → Drivers → copy the connection string

**Important**: `backend/config/mongodb.js` appends `/e-commerce` to whatever you
put in `MONGODB_URI` to form the final database name. Atlas's default connection
string ends in `/?retryWrites=true&w=majority`, which will break this. Paste
**only up to `.mongodb.net`**, with nothing after it, e.g.:
```
mongodb+srv://myuser:mypassword@cluster0.xxxxx.mongodb.net
```

### 2. Cloudinary (free, for product images)
- Sign up at https://cloudinary.com (no credit card needed)
- Free tier: 25 monthly credits, more than enough for a class project
- From your dashboard, copy: Cloud Name, API Key, API Secret

### 3. Backend
```
cd backend
npm install
```
Fill in `backend/.env` (already created with placeholders — see comments inside
for exactly what each value means and where to get it).

Run it:
```
node server.js
```
You should see "Connected to MongoDB" and "Server started on port: 4000".

### 4. Customer-facing store
```
cd frontend
npm install
npm run dev
```
Opens at http://localhost:5173 (Vite's default port). Register a new account
and start shopping.

### 5. Admin dashboard
```
cd admin
npm install
npm run dev
```
Opens on a different port (Vite will tell you which, usually 5174 since 5173
is taken by the frontend). Log in using the `ADMIN_EMAIL` / `ADMIN_PASSWORD`
you set in `backend/.env` — this is not a separate database account, just a
hardcoded credential check on the backend.

## What I verified directly vs. what I could not

I built and fixed this in a sandboxed environment with restricted network access
(only npm, GitHub, PyPI are reachable — not MongoDB's or Cloudinary's servers).

**Verified directly:**
- All three apps (`backend`, `frontend`, `admin`) run `npm install` cleanly
- Every backend file passes a Node syntax check
- Both frontend apps (`frontend`, `admin`) compile successfully with `npm run build`
  using their real Vite toolchain — including after every fix I made
- Traced the actual code paths for the 5 bugs listed above by reading the source,
  not just running a linter — each one is a genuine logic error, not a style nitpick

**NOT verified (network restriction, not a code concern):**
- I could not connect to a live MongoDB or Cloudinary account from this environment,
  so I never clicked through the running app in a browser against real data. Register/
  login/cart/checkout/admin flows are correct as far as static code review can confirm,
  but you'll be the first to click through them for real. If something misbehaves
  once you connect your own database, tell me the exact error and I'll debug it with you.

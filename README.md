# OrlaTrends E-Commerce & Admin Panel

Firebase Hosting + Cloud Functions e-commerce storefront and admin panel.

## Workspace Architecture

```text
firebase.json
frontend/storefront/
  index.html, product.html, cart.html, checkout.html, payment.html
  js/customer-auth.js, js/customer-addresses.js, js/checkout.js, js/commerce-flow.js
  admin/admin.html, admin/login.html, admin/css/style.css, admin/js/app.js
backend/
  index.js
  package.json
docs/
```

## Firebase Project

Project ID: `orlatrends-6ac85`

Hosting serves `frontend/storefront`. API requests under `/api/**` are rewritten to the `api` Cloud Function from `backend/index.js`. `/admin` opens `frontend/storefront/admin/admin.html`.

Headers and rewrites belong in `firebase.json`; root `_headers` and `_redirects` files are not used by Firebase Hosting.

## Environment

Production auth secrets must be configured before deploy. Do not rely on local fallback secrets in production.

```bash
cd backend
npm install
firebase functions:secrets:set JWT_SECRET
firebase functions:secrets:set REFRESH_TOKEN_SECRET
```

For local emulator development, fallback secrets and the default admin can be used. To disable the local default admin:

```powershell
$env:ALLOW_DEFAULT_ADMIN = "false"
```

## Commands

Run from `backend/`:

```bash
npm run lint
npm run serve
npm run deploy
```

Or from the repository root:

```bash
firebase emulators:start --only hosting,functions
firebase deploy --only hosting,functions
```

## Test Checklist

- `/` opens the storefront.
- `/admin` redirects unauthenticated users to `/admin/login.html`.
- Admin login works with a Firestore admin account in production.
- Customer can register, log in, refresh session, log out, and log in again.
- Account page can add, edit, delete, and list saved addresses.
- Checkout can select a saved address or save/use a new address.
- Payment places an order through `/api/v1/customer/orders`.
- Admin dashboard/orders/products/customers/settings endpoints return Firestore data without exposing `password_hash`.
- `npm run lint` passes in `backend/`.

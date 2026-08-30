# OrlaTrends E-Commerce & Admin Panel

Welcome to the OrlaTrends workspace. This repository has been structured locally into clean, modular Frontend and Backend applications.

---

## ?? Workspace Architecture

```
orlaupdated--main/
+-- README.md                      # Project documentation & local setup guide
+-- firebase.json                  # Firebase configuration (Local Emulator & Hosting routes)
+-- .firebaserc                    # Firebase project link
¦
+-- frontend/                      # ALL FRONTEND APPLICATIONS
¦   +-- storefront/                # Customer E-Commerce Storefront & Admin UI
¦       +-- index.html, product.html, cart.html, checkout.html, etc.
¦       +-- assets/                # Product, category, banner images & brand logos
¦       +-- css/                   # customer.css
¦       +-- js/                    # Storefront scripts (auth, checkout, flow)
¦       +-- admin/                 # Admin Panel SPA (admin.html, css/style.css, js/app.js)
¦
+-- backend/                       # ACTIVE BACKEND API (Firestore Integration)
¦   +-- index.js                   # Node.js / Express API Server for Cloud Functions
¦   +-- package.json               # Backend dependencies
¦   +-- package-lock.json
¦
+-- legacy/                        # ARCHIVED LEGACY CODE
¦   +-- mysql-backend/             # Original MySQL Express backend & database schema.sql
¦
+-- docs/                          # DOCUMENTATION & REPORTS
    +-- GEO_SWITCHER_TEST_REPORT.md
    +-- COPY_TO_PENDRIVE_GUIDE.txt
    +-- ROOT_MAP_ORLATRENDS.md
```

---

## ?? Local Development & Running

### 1. Backend API (`backend/`)
To install backend dependencies locally:
```bash
cd backend
npm install
```

### 2. Local Firebase Emulator (Optional)
To run the local Firebase emulator for both Hosting and Functions:
```bash
firebase emulators:start
```

---

## ?? Environment & Database
- **Database**: Connected to Google Cloud Firestore.
- **Admin Authentication**: Uses JWT Access & Refresh Token authentication with bcrypt password hashing.
- **Default Admin Account**: admin@orlatrends.com / Admin@123.


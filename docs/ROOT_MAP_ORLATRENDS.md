# OrlaTrends Professional Root Map

Root Path:
C:\orlatrends

ACTIVE PROJECT LAYOUT

C:\orlatrends
  index.html                         Customer storefront homepage
  product.html                       Customer product page fallback
  variant-deeplink.js                Customer variant URL + schema sync
  customer-login.html               Customer sign-in page
  register.html                     Minimal customer registration page
  account.html                      Customer My Address Book dashboard
  checkout.html                     Checkout delivery address selection
  customer.css                      Customer auth/account/checkout styles
  customer-auth.js                  Customer JWT/API helper
  customer-addresses.js             Address book UI logic
  checkout.js                       Checkout address UI logic
  robots.txt                         Crawl rules
  _redirects                         Netlify redirects
  _headers                           Netlify/CDN cache headers
  .htaccess                          cPanel/Apache cache/compression headers
  ROOT_MAP_ORLATRENDS.md             This folder map
  COPY_TO_PENDRIVE_GUIDE.txt         Backup/copy guide

  assets/
    images/
      brand/                         Logo and brand assets
        orlalogo1.jpg
      banners/                       Homepage/banner images
        Banner1.png
        Banner2.png
        Banner3.png
      categories/                    Category tile images
        Abayas.png
        Dresses.png
        Jalabiyas.png
        Jeans.png
        Lignerie & Nightwear.png
        Newin.png
        Pants.png
        shirts.png
        Skirts.png
        Sports.png
        Tops & Tees.png
      products/                      Product gallery/feed images
        Product1.jpg ... Product12.jpg

  orlatrends-admin/                  Main admin software
    backend/                         Node.js + Express API server
      server.js                      Main backend entry
      uploads/                       Uploaded media files
    database/
      schema.sql                     MySQL schema + seed/update scripts
    frontend/                        Admin UI files served by Node
      admin.html                     Admin shell
      app.js                         Admin dashboard/catalog/orders logic
      style.css                      Admin design system
      product.html                   Storefront product page fallback
      variant-deeplink.js            Variant URL + schema sync
    package.json                     Node dependencies/scripts
    package-lock.json                Dependency lock file
    .env                             Local environment values
    .env.example                     Safe env template
    README.md                        Setup instructions

  _archive/                          Old duplicate folders moved out of active root

WHAT TO COPY TO PENDRIVE
1. Full project backup / live update package:
   C:\orlatrends

2. Admin development only:
   C:\orlatrends\orlatrends-admin
   Important: keep C:\orlatrends\assets also if product images must work locally.

WHAT TO EDIT
- Customer homepage: C:\orlatrends\index.html
- Customer product fallback: C:\orlatrends\product.html
- Customer variant/schema behavior: C:\orlatrends\variant-deeplink.js
- Customer login/register/account/checkout: C:\orlatrends\customer-login.html, register.html, account.html, checkout.html
- Customer address frontend logic: C:\orlatrends\customer-auth.js, customer-addresses.js, checkout.js
- Admin frontend: C:\orlatrends\orlatrends-admin\frontend
- Backend/API/feed/SEO: C:\orlatrends\orlatrends-admin\backend\server.js
- Database structure/seed: C:\orlatrends\orlatrends-admin\database\schema.sql
- Images: C:\orlatrends\assets\images

WHAT NOT TO EDIT CASUALLY
- _archive folder: safety backup only
- node_modules folders if present: generated dependency files
- package-lock.json unless dependencies are changed
- database schema without taking a DB backup first

LOCAL TEST LINKS
Admin:
http://localhost:5000/admin.html

Catalog:
http://localhost:5000/admin.html?module=catalog

Product test:
http://localhost:5000/smart-pro-mobile.html?variant=ot-mb-2013-bk-128

Image test:
http://localhost:5000/assets/images/products/Product6.jpg

Health:
http://localhost:5000/health

GEO-SWITCHER
- Config: C:\orlatrends\orlatrends-admin\backend\config\geoSwitcher.js
- Middleware/API integration: C:\orlatrends\orlatrends-admin\backend\server.js
- Test report: C:\orlatrends\GEO_SWITCHER_TEST_REPORT.md

Geo country mapping now includes: IN, SC, ZA, AE, SA, KW, QA, OM, BH. Note: SA = Saudi Arabia; ZA = South Africa.

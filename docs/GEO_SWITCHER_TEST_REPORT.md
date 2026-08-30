# OrlaTrends Geo-Switcher Implementation Report

## Technology Stack
- Server-side middleware: Node.js + Express
- Country detection: Cloudflare `CF-IPCountry` header
- Local testing override: `x-orla-country-test` header in non-production only
- Bot bypass: User-Agent bot detection with best-effort Google reverse DNS + forward DNS verification
- UI injection: Server-side HTML injection for a lightweight soft banner and manual country selector
- Cookie preference: `store_country_preference`

## Country Mapping
- `IN`: India default store, `/`
- `SC`: Seychelles store, `/sc`
- `ZA`: South Africa store, `/za`
- `AE`: United Arab Emirates store, `/ae`
- `SA`: Saudi Arabia store, `/sa`
- `KW`: Kuwait store, `/kw`
- `QA`: Qatar store, `/qa`
- `OM`: Oman store, `/om`
- `BH`: Bahrain store, `/bh`
## Core Rules Implemented
- No forced IP-based redirect
- Redirect only after user clicks a switch/manual country option
- Existing `store_country_preference` cookie overrides GeoIP detection
- Search/ad crawlers bypass banner/selector logic
- Regional URLs return `200 OK`
- Hreflang and canonical tags are injected server-side
- `/sitemap.xml` includes regional URLs and hreflang alternates

## Test Summary
Passed locally on `http://localhost:5000`:
- India visitor on India default URL: no banner, cookie set to `IN`
- Seychelles visitor on India URL: Seychelles suggestion banner shown
- South Africa visitor on Seychelles URL: South Africa suggestion banner shown
- Existing cookie preference: no banner
- Googlebot: no banner, no selector, 200 OK
- AdsBot-Google: no banner, no selector, 200 OK
- AdsBot-Google-Mobile: no banner, no selector, 200 OK
- Bingbot: no banner, no selector, 200 OK
- AdIdxBot: no banner, no selector, 200 OK
- Regional product page `/sc/smart-pro-mobile.html`: 200 OK with regional canonical
- `/sitemap.xml`: includes `/sc` and `/za` regional URLs
- AE visitor on India URL: UAE banner shown
- SA visitor on UAE URL: Saudi Arabia banner shown
- KW visitor on Qatar URL: Kuwait banner shown
- OM visitor on Bahrain product URL: Oman banner shown
- Bahrain visitor on Bahrain URL: no banner
- `/sitemap.xml`: includes `/ae`, `/sa`, `/kw`, `/qa`, `/om`, `/bh` regional URLs

## Production Deployment Notes
- If using Cloudflare, enable/request `CF-IPCountry` header.
- Set `COOKIE_SECURE=true` in production so cookies are sent with `Secure` flag on HTTPS.
- Do not cache personalized banner HTML globally. Cache rules must vary or bypass on `Cookie` and `CF-IPCountry` for HTML pages.
- No third-party real-time IP API is used.
- MaxMind fallback is not bundled yet; Cloudflare header is the active production method.

## Files Changed
- `orlatrends-admin/backend/config/geoSwitcher.js`
- `orlatrends-admin/backend/server.js`
- `ROOT_MAP_ORLATRENDS.md`
- `GEO_SWITCHER_TEST_REPORT.md`
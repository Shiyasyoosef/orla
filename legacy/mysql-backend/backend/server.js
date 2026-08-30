const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mysql = require("mysql2/promise");
const multer = require("multer");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const app = express();
app.set("etag", "strong");
app.set("trust proxy", 1);
app.disable("x-powered-by");

const PORT = Number(process.env.PORT || 5000);
const DB_NAME = process.env.DB_NAME || "orlatrends_admin";
const JWT_SECRET = process.env.JWT_SECRET || "orlatrends_local_access_secret_change_me";
const REFRESH_SECRET = process.env.REFRESH_TOKEN_SECRET || "orlatrends_local_refresh_secret_change_me";
const uploadDir = path.join(__dirname, "uploads");
fs.mkdirSync(uploadDir, { recursive: true });

const CACHE_TTL = {
  PRODUCT_DATA: Number(process.env.PRODUCT_CACHE_SECONDS || 300),
  PRODUCT_HTML: Number(process.env.PRODUCT_HTML_CACHE_SECONDS || 300),
  STOREFRONT_LIST: Number(process.env.STOREFRONT_LIST_CACHE_SECONDS || 300),
  MERCHANT_FEED: Number(process.env.MERCHANT_FEED_CACHE_SECONDS || 900),
  ROBOTS: Number(process.env.ROBOTS_CACHE_SECONDS || 3600)
};
const CACHE_MAX_ITEMS = Number(process.env.CACHE_MAX_ITEMS || 500);
const performanceCache = new Map();
let pool;

function cacheId(namespace, key) { return `${namespace}:${key}`; }
function cacheGet(namespace, key) {
  if (process.env.DISABLE_SERVER_CACHE === "true") return null;
  const id = cacheId(namespace, key);
  const item = performanceCache.get(id);
  if (!item) return null;
  if (item.expiresAt <= Date.now()) { performanceCache.delete(id); return null; }
  return item.value;
}
function cacheSet(namespace, key, value, ttlSeconds) {
  if (process.env.DISABLE_SERVER_CACHE === "true" || ttlSeconds <= 0) return;
  performanceCache.set(cacheId(namespace, key), { value, expiresAt: Date.now() + ttlSeconds * 1000 });
  if (performanceCache.size > CACHE_MAX_ITEMS) {
    const overflow = performanceCache.size - Math.floor(CACHE_MAX_ITEMS * 0.8);
    [...performanceCache.entries()].sort((a, b) => a[1].expiresAt - b[1].expiresAt).slice(0, overflow).forEach(([id]) => performanceCache.delete(id));
  }
}
function clearCacheNamespace(namespace) {
  for (const key of performanceCache.keys()) if (key.startsWith(`${namespace}:`)) performanceCache.delete(key);
}
function clearStorefrontCache() {
  ["productData", "productHtml", "storefrontList", "merchantFeed", "robots"].forEach(clearCacheNamespace);
}
function setPublicCacheHeaders(res, { browserSeconds = 60, cdnSeconds = 300, staleSeconds = 60, immutable = false } = {}) {
  const immutablePart = immutable ? ", immutable" : "";
  res.set("Cache-Control", `public, max-age=${browserSeconds}, s-maxage=${cdnSeconds}, stale-while-revalidate=${staleSeconds}${immutablePart}`);
  res.set("CDN-Cache-Control", `public, max-age=${cdnSeconds}, stale-while-revalidate=${staleSeconds}${immutablePart}`);
  res.set("Surrogate-Control", `max-age=${cdnSeconds}, stale-while-revalidate=${staleSeconds}`);
  res.set("Vary", "Accept-Encoding");
}
function setStaticCacheHeaders(res, filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if ([".png", ".jpg", ".jpeg", ".webp", ".gif", ".svg", ".ico", ".woff", ".woff2", ".ttf"].includes(ext)) {
    setPublicCacheHeaders(res, { browserSeconds: 31536000, cdnSeconds: 31536000, staleSeconds: 604800, immutable: true });
  } else if ([".css", ".js", ".mjs"].includes(ext)) {
    setPublicCacheHeaders(res, { browserSeconds: 86400, cdnSeconds: 604800, staleSeconds: 86400 });
  } else if (ext === ".html") {
    res.set("Cache-Control", "public, max-age=60, s-maxage=300, stale-while-revalidate=60");
  }
}

app.use(helmet({ contentSecurityPolicy: false, crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: "8mb" }));
app.use(express.urlencoded({ extended: true, limit: "8mb" }));
app.use(cookieParser());
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 600, standardHeaders: true, legacyHeaders: false }));
app.use("/uploads", express.static(uploadDir, { etag: true, maxAge: "30d", immutable: true, setHeaders: setStaticCacheHeaders }));

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => cb(null, `${Date.now()}-${crypto.randomBytes(6).toString("hex")}${path.extname(file.originalname)}`)
});
const upload = multer({ storage, limits: { fileSize: 6 * 1024 * 1024 } });

function ok(res, data = {}, message = "OK") { res.json({ success: true, message, data }); }
function fail(res, status, message, details = null) { res.status(status).json({ success: false, message, details }); }
function asyncHandler(fn) { return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next); }
function hashToken(token) { return crypto.createHash("sha256").update(token).digest("hex"); }
function publicAdmin(row, permissions = []) {
  if (!row) return null;
  return { id: row.id, fullName: row.full_name, email: row.email, roleId: row.role_id, role: row.role_name, status: row.status, lastLogin: row.last_login, permissions };
}
function slugify(value) {
  return String(value || "").toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || crypto.randomBytes(4).toString("hex");
}
function numberValue(value, fallback = 0) { const n = Number(value); return Number.isFinite(n) ? n : fallback; }
function paging(req) {
  const page = Math.max(1, parseInt(req.query.page || "1", 10));
  const limit = Math.min(100, Math.max(5, parseInt(req.query.limit || "12", 10)));
  return { page, limit, offset: (page - 1) * limit };
}
async function logActivity(adminId, action, module) {
  try { await pool.query("INSERT INTO activity_logs (admin_id, action, module) VALUES (?,?,?)", [adminId || null, action, module]); } catch (_) {}
}
async function getPermissions(adminId) {
  const [rows] = await pool.query(`SELECT p.permission_name FROM admins a JOIN role_permissions rp ON rp.role_id=a.role_id JOIN permissions p ON p.id=rp.permission_id WHERE a.id=?`, [adminId]);
  return rows.map((r) => r.permission_name);
}
async function findAdminById(id) {
  const [rows] = await pool.query(`SELECT a.*, r.role_name FROM admins a JOIN staff_roles r ON r.id=a.role_id WHERE a.id=? LIMIT 1`, [id]);
  return rows[0] || null;
}
async function findAdminByEmail(email) {
  const [rows] = await pool.query(`SELECT a.*, r.role_name FROM admins a JOIN staff_roles r ON r.id=a.role_id WHERE a.email=? LIMIT 1`, [String(email || "").toLowerCase().trim()]);
  return rows[0] || null;
}
function signAccess(admin) {
  return jwt.sign({ sub: admin.id, email: admin.email, role: admin.role_name }, JWT_SECRET, { expiresIn: "15m" });
}
async function issueRefresh(admin, req, rememberMe, oldHash = null) {
  if (oldHash) await pool.query("UPDATE admin_sessions SET revoked_at=NOW() WHERE refresh_token_hash=?", [oldHash]);
  const refreshToken = jwt.sign({ sub: admin.id, nonce: crypto.randomBytes(12).toString("hex") }, REFRESH_SECRET, { expiresIn: rememberMe ? "30d" : "7d" });
  const expires = rememberMe ? 30 : 7;
  await pool.query(`INSERT INTO admin_sessions (admin_id, refresh_token_hash, user_agent, ip_address, expires_at) VALUES (?,?,?,?, DATE_ADD(NOW(), INTERVAL ? DAY))`, [admin.id, hashToken(refreshToken), req.headers["user-agent"] || "Browser", req.ip, expires]);
  return refreshToken;
}
async function authRequired(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return fail(res, 401, "Login required");
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const admin = await findAdminById(decoded.sub);
    if (!admin || admin.status !== "active") return fail(res, 401, "Account is not active");
    const permissions = await getPermissions(admin.id);
    req.admin = { ...admin, permissions };
    next();
  } catch (_) { return fail(res, 401, "Session expired. Please login again."); }
}
function requirePermission(permission) {
  return (req, res, next) => {
    if (!req.admin?.permissions?.includes(permission)) return fail(res, 403, "You do not have permission for this action");
    next();
  };
}
async function initDatabase() {
  const root = await mysql.createConnection({ host: process.env.DB_HOST || "localhost", port: Number(process.env.DB_PORT || 3306), user: process.env.DB_USER || "root", password: process.env.DB_PASSWORD || "", multipleStatements: true });
  await root.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
  await root.end();
  pool = mysql.createPool({ host: process.env.DB_HOST || "localhost", port: Number(process.env.DB_PORT || 3306), user: process.env.DB_USER || "root", password: process.env.DB_PASSWORD || "", database: DB_NAME, waitForConnections: true, connectionLimit: 10, multipleStatements: true });
  const schemaPath = path.join(__dirname, "..", "database", "schema.sql");
  await pool.query(fs.readFileSync(schemaPath, "utf8").replace(/^\uFEFF/, ""));
  await ensureProductColumns();
  await ensurePerformanceIndexes();
  await ensureDefaultAdmin();
}
async function ensureColumn(table, column, definition) {
  const [rows] = await pool.query("SELECT COUNT(*) total FROM information_schema.columns WHERE table_schema=? AND table_name=? AND column_name=?", [DB_NAME, table, column]);
  if (Number(rows[0]?.total || 0) === 0) await pool.query(`ALTER TABLE \`${table}\` ADD COLUMN \`${column}\` ${definition}`);
}
async function ensureProductColumns() {
  const columns = [["google_product_category","VARCHAR(255) NULL"],["gtin","VARCHAR(64) NULL"],["mpn","VARCHAR(64) NULL"],["product_condition","VARCHAR(32) NULL"],["gender","VARCHAR(32) NULL"],["age_group","VARCHAR(32) NULL"],["product_attributes_json","JSON NULL"]];
  for (const [column, definition] of columns) await ensureColumn("products", column, definition);
}
async function ensureIndex(table, indexName, columnsSql) {
  const [rows] = await pool.query("SELECT COUNT(*) total FROM information_schema.statistics WHERE table_schema=? AND table_name=? AND index_name=?", [DB_NAME, table, indexName]);
  if (Number(rows[0]?.total || 0) === 0) await pool.query(`ALTER TABLE \`${table}\` ADD INDEX \`${indexName}\` (${columnsSql})`);
}
async function ensurePerformanceIndexes() {
  const indexes = [
    ["products", "idx_products_status_slug", "`status`,`slug`"],
    ["products", "idx_products_status_id", "`status`,`id`"],
    ["products", "idx_products_status_created", "`status`,`created_at`"],
    ["product_variants", "idx_variants_product_id", "`product_id`,`id`"],
    ["product_variants", "idx_variants_variant_key", "`variant_key`"],
    ["orders", "idx_orders_created_status", "`created_at`,`status`"],
    ["activity_logs", "idx_activity_created", "`created_at`"],
    ["notifications", "idx_notifications_created", "`created_at`"]
  ];
  for (const [table, indexName, columnsSql] of indexes) {
    try { await ensureIndex(table, indexName, columnsSql); } catch (err) { console.warn(`Index ${indexName} skipped: ${err.message}`); }
  }
}
async function ensureDefaultAdmin() {
  const admin = await findAdminByEmail("admin@orlatrends.com");
  if (admin) return;
  const hash = await bcrypt.hash("Admin@123", 12);
  const [[role]] = await pool.query("SELECT id FROM staff_roles WHERE role_name='Super Admin' LIMIT 1");
  await pool.query("INSERT INTO admins (full_name,email,password_hash,role_id,status) VALUES (?,?,?,?, 'active')", ["OrlaTrends Super Admin", "admin@orlatrends.com", hash, role.id]);
  await logActivity(null, "Default super admin created", "Auth");
}

app.get("/health", asyncHandler(async (_req, res) => {
  await pool.query("SELECT 1");
  ok(res, { status: "healthy", app: "OrlaTrends Admin", database: DB_NAME });
}));

app.post("/api/auth/login", asyncHandler(async (req, res) => {
  const email = String(req.body.email || "").toLowerCase().trim();
  const password = String(req.body.password || "");
  const rememberMe = Boolean(req.body.rememberMe);
  if (!email || !password) return fail(res, 422, "Email and password are required");
  const admin = await findAdminByEmail(email);
  if (!admin) {
    await pool.query("INSERT INTO login_logs (email, ip_address, device, status) VALUES (?,?,?, 'failed')", [email, req.ip, req.headers["user-agent"] || "Browser"]);
    return fail(res, 401, "Invalid email or password");
  }
  if (admin.locked_until && new Date(admin.locked_until) > new Date()) {
    await pool.query("INSERT INTO login_logs (admin_id,email,ip_address,device,status) VALUES (?,?,?,?, 'locked')", [admin.id, email, req.ip, req.headers["user-agent"] || "Browser"]);
    return fail(res, 423, "Account is temporarily locked. Try again later.");
  }
  if (admin.status !== "active") return fail(res, 403, "Account is not active");
  const valid = await bcrypt.compare(password, admin.password_hash);
  if (!valid) {
    const attempts = Number(admin.failed_login_attempts || 0) + 1;
    const lockSql = attempts >= 5 ? ", locked_until=DATE_ADD(NOW(), INTERVAL 15 MINUTE)" : "";
    await pool.query(`UPDATE admins SET failed_login_attempts=?${lockSql} WHERE id=?`, [attempts, admin.id]);
    await pool.query("INSERT INTO login_logs (admin_id,email,ip_address,device,status) VALUES (?,?,?,?, 'failed')", [admin.id, email, req.ip, req.headers["user-agent"] || "Browser"]);
    return fail(res, 401, attempts >= 5 ? "Too many attempts. Account locked for 15 minutes." : "Invalid email or password");
  }
  await pool.query("UPDATE admins SET failed_login_attempts=0, locked_until=NULL, last_login=NOW() WHERE id=?", [admin.id]);
  await pool.query("INSERT INTO login_logs (admin_id,email,ip_address,device,status) VALUES (?,?,?,?, 'success')", [admin.id, email, req.ip, req.headers["user-agent"] || "Browser"]);
  await pool.query("INSERT INTO device_logs (admin_id,ip_address,device,last_seen) VALUES (?,?,?,NOW())", [admin.id, req.ip, req.headers["user-agent"] || "Browser"]);
  const freshAdmin = await findAdminById(admin.id);
  const permissions = await getPermissions(admin.id);
  const accessToken = signAccess(freshAdmin);
  const refreshToken = await issueRefresh(freshAdmin, req, rememberMe);
  res.cookie("orla_refresh", refreshToken, { httpOnly: true, sameSite: "lax", secure: process.env.COOKIE_SECURE === "true", maxAge: (rememberMe ? 30 : 7) * 86400000 });
  await logActivity(admin.id, "Logged in", "Auth");
  ok(res, { accessToken, refreshToken, admin: publicAdmin(freshAdmin, permissions) }, "Login successful");
}));

app.post("/api/auth/refresh", asyncHandler(async (req, res) => {
  const refreshToken = req.cookies.orla_refresh || req.body.refreshToken;
  if (!refreshToken) return fail(res, 401, "Refresh token required");
  let decoded;
  try { decoded = jwt.verify(refreshToken, REFRESH_SECRET); } catch (_) { return fail(res, 401, "Invalid refresh token"); }
  const tokenHash = hashToken(refreshToken);
  const [sessions] = await pool.query("SELECT * FROM admin_sessions WHERE refresh_token_hash=? AND revoked_at IS NULL AND expires_at>NOW() LIMIT 1", [tokenHash]);
  if (!sessions[0]) return fail(res, 401, "Refresh session expired");
  const admin = await findAdminById(decoded.sub);
  if (!admin || admin.status !== "active") return fail(res, 401, "Account inactive");
  const rememberMe = new Date(sessions[0].expires_at).getTime() - Date.now() > 10 * 86400000;
  const accessToken = signAccess(admin);
  const newRefreshToken = await issueRefresh(admin, req, rememberMe, tokenHash);
  const permissions = await getPermissions(admin.id);
  res.cookie("orla_refresh", newRefreshToken, { httpOnly: true, sameSite: "lax", secure: process.env.COOKIE_SECURE === "true", maxAge: (rememberMe ? 30 : 7) * 86400000 });
  ok(res, { accessToken, refreshToken: newRefreshToken, admin: publicAdmin(admin, permissions) });
}));

app.post("/api/auth/logout", authRequired, asyncHandler(async (req, res) => {
  const refreshToken = req.cookies.orla_refresh || req.body.refreshToken;
  if (refreshToken) await pool.query("UPDATE admin_sessions SET revoked_at=NOW() WHERE refresh_token_hash=?", [hashToken(refreshToken)]);
  res.clearCookie("orla_refresh");
  await logActivity(req.admin.id, "Logged out", "Auth");
  ok(res, {}, "Logged out");
}));

app.get("/api/auth/me", authRequired, asyncHandler(async (req, res) => ok(res, { admin: publicAdmin(req.admin, req.admin.permissions) })));

app.post("/api/auth/forgot-password", asyncHandler(async (req, res) => {
  const admin = await findAdminByEmail(req.body.email);
  if (admin) {
    const token = crypto.randomBytes(32).toString("hex");
    await pool.query("UPDATE admins SET password_reset_token_hash=?, reset_token_expires_at=DATE_ADD(NOW(), INTERVAL 30 MINUTE) WHERE id=?", [hashToken(token), admin.id]);
    await logActivity(admin.id, "Password reset requested", "Auth");
    return ok(res, { resetToken: process.env.NODE_ENV === "production" ? undefined : token }, "Reset link generated. In production this should be emailed.");
  }
  ok(res, {}, "If the email exists, reset instructions will be sent.");
}));

app.post("/api/auth/reset-password", asyncHandler(async (req, res) => {
  const token = String(req.body.token || "");
  const password = String(req.body.password || "");
  if (!token || password.length < 8) return fail(res, 422, "Valid token and 8+ character password required");
  const [rows] = await pool.query("SELECT * FROM admins WHERE password_reset_token_hash=? AND reset_token_expires_at>NOW() LIMIT 1", [hashToken(token)]);
  if (!rows[0]) return fail(res, 400, "Invalid or expired reset token");
  await pool.query("UPDATE admins SET password_hash=?, password_reset_token_hash=NULL, reset_token_expires_at=NULL WHERE id=?", [await bcrypt.hash(password, 12), rows[0].id]);
  await pool.query("UPDATE admin_sessions SET revoked_at=NOW() WHERE admin_id=?", [rows[0].id]);
  ok(res, {}, "Password reset successful");
}));

app.get("/api/dashboard/overview", authRequired, requirePermission("dashboard.read"), asyncHandler(async (_req, res) => {
  const [[stats]] = await pool.query(`SELECT
    (SELECT COALESCE(SUM(total),0) FROM orders WHERE payment_status='paid') AS revenue,
    (SELECT COUNT(*) FROM orders) AS ordersCount,
    (SELECT COUNT(*) FROM customers) AS customersCount,
    (SELECT COUNT(*) FROM products WHERE status='active') AS productsCount,
    (SELECT COUNT(*) FROM products WHERE stock_quantity <= low_stock_threshold) AS lowStockCount,
    (SELECT COALESCE(SUM(amount),0) FROM payments WHERE status='paid' AND DATE(paid_at)=CURDATE()) AS todayRevenue`);
  const [sales] = await pool.query(`SELECT DATE(created_at) label, COALESCE(SUM(total),0) value FROM orders WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 6 DAY) GROUP BY DATE(created_at) ORDER BY label`);
  const [visitors] = await pool.query("SELECT report_date label, visitors, sessions, conversion_rate FROM visitor_analytics ORDER BY report_date DESC LIMIT 7");
  visitors.reverse();
  const [orders] = await pool.query(`SELECT o.id,o.order_number,o.status,o.payment_status,o.total,o.currency,o.created_at,c.full_name customer_name FROM orders o LEFT JOIN customers c ON c.id=o.customer_id ORDER BY o.created_at DESC LIMIT 8`);
  const [topProducts] = await pool.query(`SELECT p.id,p.name,p.sku,p.image_url,COALESCE(SUM(oi.quantity),0) units,COALESCE(SUM(oi.total),0) revenue,p.stock_quantity FROM products p LEFT JOIN order_items oi ON oi.product_id=p.id GROUP BY p.id ORDER BY units DESC, revenue DESC LIMIT 6`);
  const [lowStock] = await pool.query("SELECT id,name,sku,stock_quantity,low_stock_threshold,image_url FROM products WHERE stock_quantity <= low_stock_threshold ORDER BY stock_quantity ASC LIMIT 6");
  const [activities] = await pool.query(`SELECT al.action,al.module,al.created_at,a.full_name admin_name FROM activity_logs al LEFT JOIN admins a ON a.id=al.admin_id ORDER BY al.created_at DESC LIMIT 10`);
  const [notifications] = await pool.query("SELECT * FROM notifications ORDER BY created_at DESC LIMIT 8");
  ok(res, { stats, sales, visitors, orders, topProducts, lowStock, activities, notifications });
}));

app.get("/api/search", authRequired, asyncHandler(async (req, res) => {
  const q = `%${String(req.query.q || "").trim()}%`;
  if (q === "%%") return ok(res, { results: [] });
  const [products] = await pool.query("SELECT 'Product' type,id,name title,sku meta FROM products WHERE name LIKE ? OR sku LIKE ? LIMIT 6", [q, q]);
  const [orders] = await pool.query("SELECT 'Order' type,id,order_number title,status meta FROM orders WHERE order_number LIKE ? LIMIT 6", [q]);
  const [customers] = await pool.query("SELECT 'Customer' type,id,full_name title,email meta FROM customers WHERE full_name LIKE ? OR email LIKE ? LIMIT 6", [q, q]);
  ok(res, { results: [...products, ...orders, ...customers] });
}));

app.get("/api/products", authRequired, requirePermission("catalog.read"), asyncHandler(async (req, res) => {
  const { page, limit, offset } = paging(req);
  const where = [];
  const params = [];
  if (req.query.q) { where.push("(p.name LIKE ? OR p.sku LIKE ? OR p.slug LIKE ?)"); const q = `%${req.query.q}%`; params.push(q, q, q); }
  if (req.query.status) { where.push("p.status=?"); params.push(req.query.status); }
  if (req.query.categoryId) { where.push("p.category_id=?"); params.push(req.query.categoryId); }
  if (req.query.brandId) { where.push("p.brand_id=?"); params.push(req.query.brandId); }
  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";
  const [[count]] = await pool.query(`SELECT COUNT(*) total FROM products p ${whereSql}`, params);
  const [rows] = await pool.query(`SELECT p.*,c.name category_name,b.name brand_name FROM products p LEFT JOIN categories c ON c.id=p.category_id LEFT JOIN brands b ON b.id=p.brand_id ${whereSql} ORDER BY p.created_at DESC LIMIT ? OFFSET ?`, [...params, limit, offset]);
  ok(res, { rows, pagination: { page, limit, total: count.total, pages: Math.ceil(count.total / limit) } });
}));

app.get("/api/products/:id", authRequired, requirePermission("catalog.read"), asyncHandler(async (req, res) => {
  const [rows] = await pool.query("SELECT * FROM products WHERE id=? LIMIT 1", [req.params.id]);
  if (!rows[0]) return fail(res, 404, "Product not found");
  const [variants] = await pool.query("SELECT * FROM product_variants WHERE product_id=? ORDER BY id", [req.params.id]);
  ok(res, { product: rows[0], variants });
}));

async function saveVariants(productId, variants = []) {
  await pool.query("DELETE FROM product_variants WHERE product_id=?", [productId]);
  for (const variant of variants) {
    if (!variant.variant_name && !variant.name) continue;
    await pool.query("INSERT INTO product_variants (product_id,variant_key,variant_name,sku,price,compare_at_price,stock_quantity,image_url,availability,gtin,ean,barcode,mpn,product_condition,gender,age_group,attributes_json) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)", [productId, normalizeParamValue(variant.variant_key || variant.variantKey || variant.sku || `${productId}-${slugify(variant.variant_name || variant.name)}`), variant.variant_name || variant.name, variant.sku || `${productId}-${slugify(variant.variant_name || variant.name)}`, numberValue(variant.price), numberValue(variant.compare_at_price ?? variant.compareAtPrice), numberValue(variant.stock_quantity ?? variant.stock), variant.image_url || variant.imageUrl || "", variant.availability || (numberValue(variant.stock_quantity ?? variant.stock) > 0 ? "in_stock" : "out_of_stock"), variant.gtin || "", variant.ean || variant.gtin || "", variant.barcode || variant.gtin || "", variant.mpn || variant.sku || "", variant.product_condition || variant.condition || "new", variant.gender || "", variant.age_group || variant.ageGroup || "", JSON.stringify(variant.attributes || {})]);
  }
}
function normalizeAvailability(value, stockQuantity = 0) {
  const normalized = String(value || "").toLowerCase().trim().replace(/[\s-]+/g, "_");
  if (["in_stock", "out_of_stock", "preorder"].includes(normalized)) return normalized;
  return Number(stockQuantity || 0) > 0 ? "in_stock" : "out_of_stock";
}
function productPayload(body) {
  const name = String(body.name || "").trim();
  if (!name) throw new Error("Product name is required");
  const stockQuantity = Math.max(0, Math.round(numberValue(body.stock_quantity ?? body.stockQuantity)));
  return {
    name,
    sku: String(body.sku || `OT-${Date.now()}`).trim(),
    slug: String(body.slug || slugify(name)).trim(),
    description: body.description || "",
    price: numberValue(body.price),
    compare_at_price: numberValue(body.compare_at_price ?? body.compareAtPrice),
    cost_price: numberValue(body.cost_price ?? body.costPrice),
    stock_quantity: stockQuantity,
    availability: normalizeAvailability(body.availability || body.stock_status || body.stockStatus, stockQuantity),
    low_stock_threshold: Math.round(numberValue(body.low_stock_threshold ?? body.lowStockThreshold, 5)),
    status: body.status || "draft",
    category_id: body.category_id || body.categoryId || null,
    brand_id: body.brand_id || body.brandId || null,
    image_url: body.image_url || body.imageUrl || "",
    seo_title: body.seo_title || body.seoTitle || "",
    seo_description: body.seo_description || body.seoDescription || "",
    google_product_category: body.google_product_category || body.googleProductCategory || "",
    gtin: body.gtin || "",
    mpn: body.mpn || "",
    product_condition: body.product_condition || body.condition || "new",
    gender: body.gender || "",
    age_group: body.age_group || body.ageGroup || "",
    scheduled_at: body.scheduled_at || body.scheduledAt || null,
    product_attributes_json: JSON.stringify(body.product_attributes || body.productAttributes || {})
  };
}

app.post("/api/products", authRequired, requirePermission("catalog.write"), asyncHandler(async (req, res) => {
  let data;
  try { data = productPayload(req.body); } catch (e) { return fail(res, 422, e.message); }
  const productFields = Object.keys(data);
  const [result] = await pool.query(`INSERT INTO products (${productFields.join(",")}) VALUES (${productFields.map(() => "?").join(",")})`, productFields.map((field) => data[field]));
  await saveVariants(result.insertId, req.body.variants || []);
  clearStorefrontCache();
  await logActivity(req.admin.id, `Created product ${data.name}`, "Catalog");
  ok(res, { id: result.insertId }, "Product created");
}));

app.put("/api/products/:id", authRequired, requirePermission("catalog.write"), asyncHandler(async (req, res) => {
  let data;
  try { data = productPayload(req.body); } catch (e) { return fail(res, 422, e.message); }
  const productFields = Object.keys(data);
  await pool.query(`UPDATE products SET ${productFields.map((field) => `${field}=?`).join(",")} WHERE id=?`, [...productFields.map((field) => data[field]), req.params.id]);
  if (Array.isArray(req.body.variants)) await saveVariants(req.params.id, req.body.variants);
  clearStorefrontCache();
  await logActivity(req.admin.id, `Updated product ${data.name}`, "Catalog");
  ok(res, {}, "Product updated");
}));

app.delete("/api/products/:id", authRequired, requirePermission("catalog.delete"), asyncHandler(async (req, res) => {
  await pool.query("DELETE FROM products WHERE id=?", [req.params.id]);
  clearStorefrontCache();
  await logActivity(req.admin.id, `Deleted product #${req.params.id}`, "Catalog");
  ok(res, {}, "Product deleted");
}));

app.post("/api/products/bulk", authRequired, requirePermission("catalog.write"), asyncHandler(async (req, res) => {
  const products = Array.isArray(req.body.products) ? req.body.products : [];
  let created = 0;
  for (const item of products) {
    const data = productPayload(item);
    const productFields = Object.keys(data);
    await pool.query(`INSERT INTO products (${productFields.join(",")}) VALUES (${productFields.map(() => "?").join(",")})`, productFields.map((field) => data[field]));
    created += 1;
  }
  clearStorefrontCache();
  await logActivity(req.admin.id, `Bulk uploaded ${created} products`, "Catalog");
  ok(res, { created }, "Bulk upload complete");
}));

function crudRoutes({ route, table, fields, permissionRead, permissionWrite, permissionDelete, searchFields = ["name"], order = "id DESC" }) {
  app.get(`/api/${route}`, authRequired, requirePermission(permissionRead), asyncHandler(async (req, res) => {
    const { page, limit, offset } = paging(req);
    const where = [];
    const params = [];
    if (req.query.q && searchFields.length) { where.push(`(${searchFields.map((f) => `${f} LIKE ?`).join(" OR ")})`); searchFields.forEach(() => params.push(`%${req.query.q}%`)); }
    const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";
    const [[count]] = await pool.query(`SELECT COUNT(*) total FROM ${table} ${whereSql}`, params);
    const [rows] = await pool.query(`SELECT * FROM ${table} ${whereSql} ORDER BY ${order} LIMIT ? OFFSET ?`, [...params, limit, offset]);
    ok(res, { rows, pagination: { page, limit, total: count.total, pages: Math.ceil(count.total / limit) } });
  }));
  app.post(`/api/${route}`, authRequired, requirePermission(permissionWrite), asyncHandler(async (req, res) => {
    const payload = fields.map((f) => req.body[f] ?? (f === "slug" ? slugify(req.body.name || req.body.title) : null));
    const [result] = await pool.query(`INSERT INTO ${table} (${fields.join(",")}) VALUES (${fields.map(() => "?").join(",")})`, payload);
    if (["categories", "brands", "attributes", "collections"].includes(route)) clearStorefrontCache();
    await logActivity(req.admin.id, `Created ${route}`, route);
    ok(res, { id: result.insertId }, "Created");
  }));
  app.put(`/api/${route}/:id`, authRequired, requirePermission(permissionWrite), asyncHandler(async (req, res) => {
    const payload = fields.map((f) => req.body[f] ?? (f === "slug" ? slugify(req.body.name || req.body.title) : null));
    await pool.query(`UPDATE ${table} SET ${fields.map((f) => `${f}=?`).join(",")} WHERE id=?`, [...payload, req.params.id]);
    if (["categories", "brands", "attributes", "collections"].includes(route)) clearStorefrontCache();
    await logActivity(req.admin.id, `Updated ${route} #${req.params.id}`, route);
    ok(res, {}, "Updated");
  }));
  app.delete(`/api/${route}/:id`, authRequired, requirePermission(permissionDelete || permissionWrite), asyncHandler(async (req, res) => {
    await pool.query(`DELETE FROM ${table} WHERE id=?`, [req.params.id]);
    if (["categories", "brands", "attributes", "collections"].includes(route)) clearStorefrontCache();
    await logActivity(req.admin.id, `Deleted ${route} #${req.params.id}`, route);
    ok(res, {}, "Deleted");
  }));
}

crudRoutes({ route: "categories", table: "categories", fields: ["name", "slug", "parent_id", "status", "sort_order"], permissionRead: "catalog.read", permissionWrite: "catalog.write", permissionDelete: "catalog.delete", searchFields: ["name", "slug"], order: "sort_order ASC, name ASC" });
crudRoutes({ route: "brands", table: "brands", fields: ["name", "slug", "logo_url", "status"], permissionRead: "catalog.read", permissionWrite: "catalog.write", permissionDelete: "catalog.delete", searchFields: ["name", "slug"], order: "name ASC" });
crudRoutes({ route: "attributes", table: "attributes", fields: ["name", "slug", "type", "status"], permissionRead: "catalog.read", permissionWrite: "catalog.write", permissionDelete: "catalog.delete", searchFields: ["name", "slug"], order: "name ASC" });
crudRoutes({ route: "collections", table: "collections", fields: ["name", "slug", "description", "status"], permissionRead: "catalog.read", permissionWrite: "catalog.write", permissionDelete: "catalog.delete", searchFields: ["name", "slug"], order: "created_at DESC" });

app.get("/api/media", authRequired, requirePermission("catalog.read"), asyncHandler(async (req, res) => {
  const [rows] = await pool.query("SELECT * FROM media_assets ORDER BY created_at DESC LIMIT 80");
  ok(res, { rows });
}));
app.post("/api/media/upload", authRequired, requirePermission("catalog.write"), upload.single("file"), asyncHandler(async (req, res) => {
  if (!req.file) return fail(res, 422, "File is required");
  const fileUrl = `/uploads/${req.file.filename}`;
  const [result] = await pool.query("INSERT INTO media_assets (file_name,file_url,file_type,size_bytes,uploaded_by) VALUES (?,?,?,?,?)", [req.file.originalname, fileUrl, req.file.mimetype, req.file.size, req.admin.id]);
  ok(res, { id: result.insertId, fileUrl }, "Uploaded");
}));

app.get("/api/orders", authRequired, requirePermission("orders.read"), asyncHandler(async (req, res) => {
  const { page, limit, offset } = paging(req);
  const where = [];
  const params = [];
  if (req.query.q) { where.push("(o.order_number LIKE ? OR c.full_name LIKE ? OR c.email LIKE ?)"); const q = `%${req.query.q}%`; params.push(q, q, q); }
  if (req.query.status) { where.push("o.status=?"); params.push(req.query.status); }
  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";
  const [[count]] = await pool.query(`SELECT COUNT(*) total FROM orders o LEFT JOIN customers c ON c.id=o.customer_id ${whereSql}`, params);
  const [rows] = await pool.query(`SELECT o.*,c.full_name customer_name,c.email customer_email FROM orders o LEFT JOIN customers c ON c.id=o.customer_id ${whereSql} ORDER BY o.created_at DESC LIMIT ? OFFSET ?`, [...params, limit, offset]);
  ok(res, { rows, pagination: { page, limit, total: count.total, pages: Math.ceil(count.total / limit) } });
}));

app.post("/api/orders", authRequired, requirePermission("orders.write"), asyncHandler(async (req, res) => {
  const orderNumber = req.body.order_number || `OT-${Date.now().toString().slice(-6)}`;
  const items = Array.isArray(req.body.items) ? req.body.items : [];
  const subtotal = items.reduce((sum, item) => sum + numberValue(item.quantity, 1) * numberValue(item.unit_price ?? item.price), 0);
  const tax = numberValue(req.body.tax, subtotal * 0.05);
  const shipping = numberValue(req.body.shipping, 0);
  const total = numberValue(req.body.total, subtotal + tax + shipping);
  const [result] = await pool.query("INSERT INTO orders (order_number,customer_id,status,payment_status,fulfillment_status,subtotal,tax,shipping,total,currency,channel) VALUES (?,?,?,?,?,?,?,?,?,?,?)", [orderNumber, req.body.customer_id || null, req.body.status || "pending", req.body.payment_status || "pending", req.body.fulfillment_status || "unfulfilled", subtotal, tax, shipping, total, req.body.currency || "AED", req.body.channel || "Admin"]);
  for (const item of items) {
    await pool.query("INSERT INTO order_items (order_id,product_id,product_name,sku,quantity,unit_price,total) VALUES (?,?,?,?,?,?,?)", [result.insertId, item.product_id || null, item.product_name || item.name, item.sku || "", numberValue(item.quantity, 1), numberValue(item.unit_price ?? item.price), numberValue(item.quantity, 1) * numberValue(item.unit_price ?? item.price)]);
  }
  await logActivity(req.admin.id, `Created order ${orderNumber}`, "Orders");
  ok(res, { id: result.insertId, orderNumber }, "Order created");
}));

app.put("/api/orders/:id", authRequired, requirePermission("orders.write"), asyncHandler(async (req, res) => {
  await pool.query("UPDATE orders SET status=COALESCE(?,status), payment_status=COALESCE(?,payment_status), fulfillment_status=COALESCE(?,fulfillment_status), channel=COALESCE(?,channel) WHERE id=?", [req.body.status || null, req.body.payment_status || null, req.body.fulfillment_status || null, req.body.channel || null, req.params.id]);
  await logActivity(req.admin.id, `Updated order #${req.params.id}`, "Orders");
  ok(res, {}, "Order updated");
}));

app.delete("/api/orders/:id", authRequired, requirePermission("orders.write"), asyncHandler(async (req, res) => {
  await pool.query("DELETE FROM orders WHERE id=?", [req.params.id]);
  await logActivity(req.admin.id, `Deleted order #${req.params.id}`, "Orders");
  ok(res, {}, "Order deleted");
}));

app.get("/api/customers", authRequired, requirePermission("customers.read"), asyncHandler(async (req, res) => {
  const { page, limit, offset } = paging(req);
  const params = [];
  let whereSql = "";
  if (req.query.q) { whereSql = "WHERE full_name LIKE ? OR email LIKE ? OR phone LIKE ?"; const q = `%${req.query.q}%`; params.push(q, q, q); }
  const [[count]] = await pool.query(`SELECT COUNT(*) total FROM customers ${whereSql}`, params);
  const [rows] = await pool.query(`SELECT * FROM customers ${whereSql} ORDER BY created_at DESC LIMIT ? OFFSET ?`, [...params, limit, offset]);
  ok(res, { rows, pagination: { page, limit, total: count.total, pages: Math.ceil(count.total / limit) } });
}));

app.post("/api/customers", authRequired, requirePermission("customers.write"), asyncHandler(async (req, res) => {
  if (!req.body.full_name || !req.body.email) return fail(res, 422, "Customer name and email are required");
  const [result] = await pool.query("INSERT INTO customers (full_name,email,phone,country,status) VALUES (?,?,?,?,?)", [req.body.full_name, req.body.email, req.body.phone || "", req.body.country || "United Arab Emirates", req.body.status || "active"]);
  await logActivity(req.admin.id, `Created customer ${req.body.full_name}`, "Customers");
  ok(res, { id: result.insertId }, "Customer created");
}));

app.put("/api/customers/:id", authRequired, requirePermission("customers.write"), asyncHandler(async (req, res) => {
  await pool.query("UPDATE customers SET full_name=?,email=?,phone=?,country=?,status=? WHERE id=?", [req.body.full_name, req.body.email, req.body.phone || "", req.body.country || "United Arab Emirates", req.body.status || "active", req.params.id]);
  await logActivity(req.admin.id, `Updated customer #${req.params.id}`, "Customers");
  ok(res, {}, "Customer updated");
}));

app.get("/api/inventory", authRequired, requirePermission("inventory.read"), asyncHandler(async (_req, res) => {
  const [rows] = await pool.query("SELECT id,name,sku,image_url,stock_quantity,availability,low_stock_threshold,status FROM products ORDER BY stock_quantity ASC, name ASC");
  const [logs] = await pool.query(`SELECT il.*,p.name product_name,a.full_name admin_name FROM inventory_logs il LEFT JOIN products p ON p.id=il.product_id LEFT JOIN admins a ON a.id=il.admin_id ORDER BY il.created_at DESC LIMIT 12`);
  ok(res, { rows, logs });
}));

app.put("/api/inventory/:productId", authRequired, requirePermission("inventory.write"), asyncHandler(async (req, res) => {
  const [[product]] = await pool.query("SELECT stock_quantity FROM products WHERE id=?", [req.params.productId]);
  if (!product) return fail(res, 404, "Product not found");
  const nextStock = Math.max(0, Math.round(numberValue(req.body.stock_quantity ?? req.body.stock, product.stock_quantity)));
  await pool.query("UPDATE products SET stock_quantity=? WHERE id=?", [nextStock, req.params.productId]);
  clearStorefrontCache();
  await pool.query("INSERT INTO inventory_logs (product_id,change_type,quantity_before,quantity_after,note,admin_id) VALUES (?,?,?,?,?,?)", [req.params.productId, req.body.change_type || "manual", product.stock_quantity, nextStock, req.body.note || "Manual stock update", req.admin.id]);
  await logActivity(req.admin.id, `Updated inventory for product #${req.params.productId}`, "Inventory");
  ok(res, {}, "Inventory updated");
}));

app.get("/api/payments", authRequired, requirePermission("payments.read"), asyncHandler(async (_req, res) => {
  const [rows] = await pool.query(`SELECT p.*,o.order_number,c.full_name customer_name FROM payments p LEFT JOIN orders o ON o.id=p.order_id LEFT JOIN customers c ON c.id=o.customer_id ORDER BY p.created_at DESC LIMIT 80`);
  ok(res, { rows });
}));

app.get("/api/shipping", authRequired, requirePermission("shipping.read"), asyncHandler(async (_req, res) => {
  const [rows] = await pool.query(`SELECT s.*,o.order_number,o.status order_status,c.full_name customer_name FROM shipping_shipments s LEFT JOIN orders o ON o.id=s.order_id LEFT JOIN customers c ON c.id=o.customer_id ORDER BY s.created_at DESC LIMIT 80`);
  ok(res, { rows });
}));
app.put("/api/shipping/:id", authRequired, requirePermission("shipping.write"), asyncHandler(async (req, res) => {
  await pool.query("UPDATE shipping_shipments SET carrier=COALESCE(?,carrier),tracking_number=COALESCE(?,tracking_number),status=COALESCE(?,status),cost=COALESCE(?,cost) WHERE id=?", [req.body.carrier || null, req.body.tracking_number || null, req.body.status || null, req.body.cost ?? null, req.params.id]);
  await logActivity(req.admin.id, `Updated shipment #${req.params.id}`, "Shipping");
  ok(res, {}, "Shipment updated");
}));

app.get("/api/analytics", authRequired, requirePermission("analytics.read"), asyncHandler(async (_req, res) => {
  const [[summary]] = await pool.query(`SELECT (SELECT SUM(total) FROM orders) grossSales,(SELECT AVG(total) FROM orders) avgOrderValue,(SELECT COUNT(*) FROM orders WHERE status='delivered') deliveredOrders,(SELECT AVG(conversion_rate) FROM visitor_analytics) avgConversion`);
  const [countries] = await pool.query("SELECT country,COUNT(*) customers,SUM(total_spent) revenue FROM customers GROUP BY country ORDER BY revenue DESC");
  ok(res, { summary, countries });
}));

app.get("/api/ai/insights", authRequired, requirePermission("ai.read"), asyncHandler(async (_req, res) => {
  const [[risk]] = await pool.query("SELECT COUNT(*) lowStock FROM products WHERE stock_quantity <= low_stock_threshold");
  const [[sales]] = await pool.query("SELECT COALESCE(SUM(total),0) revenue FROM orders WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)");
  const [recommendations] = await pool.query("SELECT name,sku,stock_quantity FROM products WHERE stock_quantity <= low_stock_threshold ORDER BY stock_quantity ASC LIMIT 5");
  ok(res, { risk, sales, recommendations, forecast: Number(sales.revenue || 0) * 4.1 });
}));

crudRoutes({ route: "campaigns", table: "campaigns", fields: ["name", "channel", "status", "budget", "starts_at", "ends_at"], permissionRead: "marketing.read", permissionWrite: "marketing.write", searchFields: ["name", "channel"], order: "created_at DESC" });
crudRoutes({ route: "cms-pages", table: "cms_pages", fields: ["title", "slug", "status", "seo_title"], permissionRead: "cms.read", permissionWrite: "cms.write", searchFields: ["title", "slug"], order: "updated_at DESC" });

app.get("/api/reviews", authRequired, requirePermission("reviews.read"), asyncHandler(async (_req, res) => {
  const [rows] = await pool.query(`SELECT r.*,p.name product_name,c.full_name customer_name FROM product_reviews r LEFT JOIN products p ON p.id=r.product_id LEFT JOIN customers c ON c.id=r.customer_id ORDER BY r.created_at DESC`);
  ok(res, { rows });
}));
app.put("/api/reviews/:id", authRequired, requirePermission("reviews.write"), asyncHandler(async (req, res) => {
  await pool.query("UPDATE product_reviews SET status=? WHERE id=?", [req.body.status || "approved", req.params.id]);
  await logActivity(req.admin.id, `Moderated review #${req.params.id}`, "Reviews");
  ok(res, {}, "Review updated");
}));

app.get("/api/support/tickets", authRequired, requirePermission("support.read"), asyncHandler(async (_req, res) => {
  const [rows] = await pool.query(`SELECT t.*,c.full_name customer_name,c.email customer_email FROM support_tickets t LEFT JOIN customers c ON c.id=t.customer_id ORDER BY t.created_at DESC`);
  ok(res, { rows });
}));
app.put("/api/support/tickets/:id", authRequired, requirePermission("support.write"), asyncHandler(async (req, res) => {
  await pool.query("UPDATE support_tickets SET priority=COALESCE(?,priority),status=COALESCE(?,status),subject=COALESCE(?,subject) WHERE id=?", [req.body.priority || null, req.body.status || null, req.body.subject || null, req.params.id]);
  await logActivity(req.admin.id, `Updated support ticket #${req.params.id}`, "Support");
  ok(res, {}, "Ticket updated");
}));

app.get("/api/settings", authRequired, requirePermission("settings.read"), asyncHandler(async (_req, res) => {
  const [rows] = await pool.query("SELECT * FROM app_settings ORDER BY setting_key ASC");
  ok(res, { rows });
}));
app.put("/api/settings", authRequired, requirePermission("settings.write"), asyncHandler(async (req, res) => {
  const entries = Object.entries(req.body.settings || req.body || {});
  for (const [key, value] of entries) await pool.query("INSERT INTO app_settings (setting_key,setting_value) VALUES (?,?) ON DUPLICATE KEY UPDATE setting_value=VALUES(setting_value)", [key, String(value)]);
  await logActivity(req.admin.id, "Updated store settings", "Settings");
  ok(res, {}, "Settings saved");
}));

app.get("/api/staff", authRequired, requirePermission("staff.read"), asyncHandler(async (_req, res) => {
  const [admins] = await pool.query(`SELECT a.id,a.full_name,a.email,a.status,a.last_login,a.created_at,r.role_name FROM admins a JOIN staff_roles r ON r.id=a.role_id ORDER BY a.created_at DESC`);
  const [roles] = await pool.query("SELECT * FROM staff_roles ORDER BY id");
  ok(res, { admins, roles });
}));
app.post("/api/staff", authRequired, requirePermission("staff.write"), asyncHandler(async (req, res) => {
  if (!req.body.full_name || !req.body.email || !req.body.password || !req.body.role_id) return fail(res, 422, "Name, email, password and role are required");
  const [result] = await pool.query("INSERT INTO admins (full_name,email,password_hash,role_id,status) VALUES (?,?,?,?,?)", [req.body.full_name, String(req.body.email).toLowerCase(), await bcrypt.hash(req.body.password, 12), req.body.role_id, req.body.status || "active"]);
  await logActivity(req.admin.id, `Created staff ${req.body.email}`, "Staff");
  ok(res, { id: result.insertId }, "Staff created");
}));

app.get("/api/security", authRequired, requirePermission("security.read"), asyncHandler(async (_req, res) => {
  const [loginLogs] = await pool.query("SELECT * FROM login_logs ORDER BY login_time DESC LIMIT 80");
  const [deviceLogs] = await pool.query("SELECT dl.*,a.email FROM device_logs dl JOIN admins a ON a.id=dl.admin_id ORDER BY dl.last_seen DESC LIMIT 80");
  const [sessions] = await pool.query("SELECT s.id,s.admin_id,a.email,s.ip_address,s.user_agent,s.expires_at,s.revoked_at,s.created_at FROM admin_sessions s JOIN admins a ON a.id=s.admin_id ORDER BY s.created_at DESC LIMIT 80");
  ok(res, { loginLogs, deviceLogs, sessions });
}));

app.get("/api/logs", authRequired, requirePermission("logs.read"), asyncHandler(async (_req, res) => {
  const [activity] = await pool.query(`SELECT al.*,a.email admin_email FROM activity_logs al LEFT JOIN admins a ON a.id=al.admin_id ORDER BY al.created_at DESC LIMIT 100`);
  ok(res, { activity, system: { node: process.version, uptimeSeconds: Math.round(process.uptime()), db: DB_NAME } });
}));

app.get("/api/notifications", authRequired, asyncHandler(async (_req, res) => {
  const [rows] = await pool.query("SELECT * FROM notifications ORDER BY created_at DESC LIMIT 20");
  ok(res, { rows });
}));
app.put("/api/notifications/:id/read", authRequired, asyncHandler(async (req, res) => {
  await pool.query("UPDATE notifications SET is_read=1 WHERE id=?", [req.params.id]);
  ok(res, {}, "Notification marked read");
}));


// ORLATRENDS STOREFRONT VARIANT DEEPLINKING
const STORE_DOMAIN = String(process.env.STORE_DOMAIN || process.env.PUBLIC_STORE_URL || "https://orlatrendsin.netlify.app").replace(/\/+$/, "");
const TRACKING_PARAMS = new Set(["utm_source", "utm-source", "utm_medium", "utm-medium", "utm_campaign", "utm-campaign", "utm_term", "utm-term", "utm_content", "utm-content", "utm_id", "utm-id", "gclid", "gbraid", "wbraid", "fbclid", "msclkid"]);
const ATTRIBUTE_ORDER = ["variant", "color", "size", "shoe-size", "ram", "storage", "processor", "screen-size", "capacity", "model", "connectivity", "warranty", "fabric", "pattern", "style", "fit", "sleeve-type", "heel-size", "material", "gender", "age-group"];
const RESERVED_PRODUCT_SLUGS = new Set(["admin", "login", "dashboard", "catalog", "orders", "customers", "inventory", "index", "product", "robots", "sitemap"]);

function normalizeParamValue(value) {
  return String(value || "").toLowerCase().trim().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}
function normalizeAttrKey(key) { return normalizeParamValue(key); }
function normalizedPublicQuery(query = {}) {
  const params = new URLSearchParams();
  Object.entries(query || {}).forEach(([key, raw]) => {
    const safeKey = normalizeAttrKey(key);
    if (TRACKING_PARAMS.has(safeKey) || ["slug", "product"].includes(safeKey)) return;
    const values = Array.isArray(raw) ? raw : [raw];
    values.map((value) => normalizeParamValue(value)).filter(Boolean).sort().forEach((value) => params.append(safeKey, value));
  });
  params.sort();
  return params.toString();
}
function productCacheKey(slug, query = {}) {
  const queryKey = normalizedPublicQuery(query);
  return `${normalizeParamValue(slug)}${queryKey ? `?${queryKey}` : ""}`;
}
function parseAttributes(raw) {
  if (!raw) return {};
  if (typeof raw === "object") return raw;
  try { return JSON.parse(raw); } catch (_) { return {}; }
}
function normalizedAttributes(raw) {
  const attrs = parseAttributes(raw);
  return Object.fromEntries(Object.entries(attrs).filter(([, v]) => v !== null && v !== undefined && String(v).trim() !== "").map(([k, v]) => [normalizeAttrKey(k), String(v).trim()]));
}
function availabilityFor(row) {
  if (row.availability === "preorder") return "preorder";
  if (row.availability === "out_of_stock") return "out_of_stock";
  return Number(row.stock_quantity || 0) > 0 ? "in_stock" : "out_of_stock";
}
function schemaAvailability(value) {
  if (value === "preorder") return "https://schema.org/PreOrder";
  return value === "in_stock" ? "https://schema.org/InStock" : "https://schema.org/OutOfStock";
}
function absoluteStoreUrl(pathValue) {
  if (!pathValue) return STORE_DOMAIN;
  if (/^https?:\/\//i.test(pathValue)) return pathValue.replace(/^http:\/\//i, "https://");
  return `${STORE_DOMAIN}${String(pathValue).startsWith("/") ? "" : "/"}${pathValue}`;
}
function imageUrlFor(row, product) {
  return absoluteStoreUrl(row.image_url || product.image_url || "/assets/images/products/Product1.jpg");
}
function queryForAttributes(attrs) {
  const entries = Object.entries(attrs || {}).map(([key, value]) => [normalizeAttrKey(key), normalizeParamValue(value)]).filter(([, value]) => value);
  entries.sort((a, b) => {
    const ai = ATTRIBUTE_ORDER.indexOf(a[0]);
    const bi = ATTRIBUTE_ORDER.indexOf(b[0]);
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi) || a[0].localeCompare(b[0]);
  });
  const params = new URLSearchParams();
  entries.forEach(([key, value]) => params.set(key, value));
  return params.toString();
}
function variantUrl(product, variant) {
  const params = new URLSearchParams();
  const key = normalizeParamValue(variant.variantKey || variant.variant_key || variant.sku || "");
  if (key) params.set("variant", key);
  const attrQuery = queryForAttributes(variant.attributes || {});
  if (attrQuery) new URLSearchParams(attrQuery).forEach((value, attrKey) => params.set(attrKey, value));
  const query = params.toString();
  return `${STORE_DOMAIN}/${product.slug}.html${query ? `?${query}` : ""}`;
}
function variantView(product, row) {
  const attrs = normalizedAttributes(row.attributes_json);
  const available = availabilityFor(row);
  const sku = row.sku || product.sku;
  const variantKey = normalizeParamValue(row.variant_key || row.variantKey || sku || row.id);
  const view = {
    id: row.id || null,
    variantKey,
    productId: product.id,
    itemGroupId: product.sku,
    name: row.variant_name || product.name,
    sku,
    gtin: row.gtin || row.ean || row.barcode || product.gtin || "",
    ean: row.ean || row.gtin || product.gtin || "",
    barcode: row.barcode || row.gtin || product.gtin || "",
    mpn: row.mpn || product.mpn || sku,
    condition: row.product_condition || product.product_condition || "new",
    gender: row.gender || product.gender || attrs.gender || "",
    ageGroup: row.age_group || product.age_group || attrs["age-group"] || "",
    price: Number(row.price ?? product.price ?? 0),
    compareAtPrice: Number(row.compare_at_price ?? product.compare_at_price ?? 0),
    stockQuantity: Number(row.stock_quantity ?? product.stock_quantity ?? 0),
    availability: available,
    attributes: attrs,
    imageUrl: imageUrlFor(row, product)
  };
  view.url = variantUrl(product, view);
  return view;
}
function parentVariantView(product) {
  const row = { id: null, variant_name: product.name, sku: product.sku, price: product.price, compare_at_price: product.compare_at_price, stock_quantity: product.stock_quantity, availability: normalizeAvailability(product.availability, product.stock_quantity), attributes_json: {}, image_url: product.image_url };
  return variantView(product, row);
}
function selectedParamsFromQuery(query, variants) {
  const keys = new Set();
  variants.forEach((variant) => Object.keys(variant.attributes || {}).forEach((key) => keys.add(key)));
  const selected = {};
  Object.entries(query || {}).forEach(([key, raw]) => {
    const safeKey = normalizeAttrKey(key);
    if (!keys.has(safeKey) || TRACKING_PARAMS.has(safeKey) || ["slug", "product", "variant"].includes(safeKey)) return;
    selected[safeKey] = normalizeParamValue(Array.isArray(raw) ? raw[0] : raw);
  });
  return selected;
}
function chooseVariant(variants, query) {
  if (!variants.length) return null;
  const exactToken = normalizeParamValue(query.variant || query.variant_id || query.variantKey || query.sku || query.id || "");
  if (exactToken) {
    const byToken = variants.find((variant) => [variant.variantKey, variant.sku, String(variant.id || "")].some((value) => normalizeParamValue(value) === exactToken));
    if (byToken) return { variant: byToken, selected: byToken.attributes || {} };
  }
  const selected = selectedParamsFromQuery(query, variants);
  const selectedKeys = Object.keys(selected);
  if (selectedKeys.length) {
    const exact = variants.find((variant) => selectedKeys.every((key) => normalizeParamValue(variant.attributes[key]) === selected[key]));
    if (exact) return { variant: exact, selected };
    const partial = variants.find((variant) => selectedKeys.some((key) => normalizeParamValue(variant.attributes[key]) === selected[key]));
    if (partial) return { variant: partial, selected: partial.attributes };
  }
  return { variant: variants.find((variant) => variant.availability === "in_stock") || variants[0], selected: variants[0].attributes || {} };
}
function optionMatrix(variants) {
  const matrix = {};
  variants.forEach((variant) => {
    Object.entries(variant.attributes || {}).forEach(([key, label]) => {
      matrix[key] ||= new Map();
      const value = normalizeParamValue(label);
      const existing = matrix[key].get(value) || { value, label, available: false };
      existing.available = existing.available || variant.availability === "in_stock";
      matrix[key].set(value, existing);
    });
  });
  return Object.fromEntries(Object.entries(matrix).sort(([a], [b]) => {
    const ai = ATTRIBUTE_ORDER.indexOf(a); const bi = ATTRIBUTE_ORDER.indexOf(b);
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi) || a.localeCompare(b);
  }).map(([key, values]) => [key, [...values.values()]]));
}
function schemaCondition(value) {
  if (value === "used") return "https://schema.org/UsedCondition";
  if (value === "refurbished") return "https://schema.org/RefurbishedCondition";
  return "https://schema.org/NewCondition";
}
function schemaVariesBy(keys) {
  const map = {
    color: "https://schema.org/color",
    size: "https://schema.org/size",
    material: "https://schema.org/material",
    pattern: "https://schema.org/pattern"
  };
  return [...new Set(keys)].map((key) => map[key] || key).filter(Boolean);
}
function variantAdditionalProperties(variant) {
  return Object.entries(variant.attributes || {}).map(([name, value]) => ({ "@type": "PropertyValue", name, value }));
}
function schemaOffer(variant) {
  return {
    "@type": "Offer",
    url: variant.url,
    priceCurrency: "AED",
    price: variant.price.toFixed(2),
    availability: schemaAvailability(variant.availability),
    itemCondition: schemaCondition(variant.condition),
    seller: { "@type": "Organization", name: "OrlaTrends" },
    shippingDetails: {
      "@type": "OfferShippingDetails",
      shippingRate: { "@type": "MonetaryAmount", value: "0.00", currency: "AED" },
      shippingDestination: { "@type": "DefinedRegion", addressCountry: "AE" },
      deliveryTime: {
        "@type": "ShippingDeliveryTime",
        handlingTime: { "@type": "QuantitativeValue", minValue: 0, maxValue: 2, unitCode: "DAY" },
        transitTime: { "@type": "QuantitativeValue", minValue: 1, maxValue: 5, unitCode: "DAY" }
      }
    },
    hasMerchantReturnPolicy: {
      "@type": "MerchantReturnPolicy",
      applicableCountry: "AE",
      returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
      merchantReturnDays: 7,
      returnMethod: "https://schema.org/ReturnByMail",
      returnFees: "https://schema.org/FreeReturn"
    }
  };
}
function variantSchemaNode(product, variant) {
  const node = {
    "@type": "Product",
    "@id": `${variant.url}#product`,
    name: `${product.name} - ${variant.name}`,
    sku: variant.sku,
    mpn: variant.mpn || variant.sku,
    image: [variant.imageUrl],
    description: product.description || product.seo_description || product.name,
    brand: { "@type": "Brand", name: product.brand_name || "OrlaTrends" },
    category: product.google_product_category || product.category_name || undefined,
    url: variant.url,
    itemCondition: schemaCondition(variant.condition),
    additionalProperty: variantAdditionalProperties(variant),
    offers: schemaOffer(variant)
  };
  if (variant.gtin) {
    node.gtin = variant.gtin;
    if (/^\d{13}$/.test(String(variant.gtin))) node.gtin13 = variant.gtin;
    if (/^\d{12}$/.test(String(variant.gtin))) node.gtin12 = variant.gtin;
    if (/^\d{14}$/.test(String(variant.gtin))) node.gtin14 = variant.gtin;
  }
  if (variant.attributes?.color) node.color = variant.attributes.color;
  if (variant.attributes?.size || variant.attributes?.["shoe-size"]) node.size = variant.attributes.size || variant.attributes["shoe-size"];
  if (variant.attributes?.material || variant.attributes?.fabric) node.material = variant.attributes.material || variant.attributes.fabric;
  if (variant.attributes?.pattern) node.pattern = variant.attributes.pattern;
  return node;
}
function productSchema(product, selectedVariant, variants) {
  const variantKeys = variants.flatMap((variant) => Object.keys(variant.attributes || {}));
  const groupId = `${STORE_DOMAIN}/${product.slug}.html#product-group`;
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${STORE_DOMAIN}/#organization`,
        name: "OrlaTrends",
        url: STORE_DOMAIN,
        logo: absoluteStoreUrl("/assets/images/brand/orlalogo1.jpg")
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${STORE_DOMAIN}/${product.slug}.html#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: `${STORE_DOMAIN}/` },
          { "@type": "ListItem", position: 2, name: product.category_name || "Products", item: `${STORE_DOMAIN}/` },
          { "@type": "ListItem", position: 3, name: product.name, item: `${STORE_DOMAIN}/${product.slug}.html` }
        ]
      },
      {
        "@type": "ProductGroup",
        "@id": groupId,
        name: product.name,
        description: product.description || product.seo_description || product.name,
        brand: { "@type": "Brand", name: product.brand_name || "OrlaTrends" },
        productGroupID: product.sku,
        category: product.google_product_category || product.category_name || undefined,
        variesBy: schemaVariesBy(variantKeys),
        hasVariant: variants.map((variant) => ({ ...variantSchemaNode(product, variant), isVariantOf: { "@id": groupId } }))
      },
      {
        ...variantSchemaNode(product, selectedVariant),
        mainEntityOfPage: selectedVariant.url,
        isVariantOf: { "@id": groupId }
      }
    ]
  };
}
async function loadStorefrontProduct(slug, query = {}) {
  const [rows] = await pool.query(`SELECT p.*,c.name category_name,b.name brand_name FROM products p LEFT JOIN categories c ON c.id=p.category_id LEFT JOIN brands b ON b.id=p.brand_id WHERE p.slug=? AND p.status='active' LIMIT 1`, [slug]);
  const product = rows[0];
  if (!product) return null;
  const [variantRows] = await pool.query("SELECT * FROM product_variants WHERE product_id=? ORDER BY id", [product.id]);
  const variants = (variantRows.length ? variantRows.map((row) => variantView(product, row)) : [parentVariantView(product)]);
  const chosen = chooseVariant(variants, query) || { variant: variants[0], selected: variants[0]?.attributes || {} };
  const canonicalUrl = `${STORE_DOMAIN}/${product.slug}.html`;
  const selectedVariant = { ...chosen.variant, url: variantUrl(product, chosen.variant) };
  return { product: { id: product.id, name: product.name, slug: product.slug, sku: product.sku, description: product.description, categoryName: product.category_name, brandName: product.brand_name, canonicalUrl, imageUrl: imageUrlFor(product, product) }, variants, options: optionMatrix(variants), selectedOptions: selectedVariant.attributes, selectedVariant, schema: productSchema(product, selectedVariant, variants), canonicalUrl };
}
function xmlEscape(value) { return String(value ?? "").replace(/[<>&'"]/g, (char) => ({ "<":"&lt;", ">":"&gt;", "&":"&amp;", "'":"&apos;", '"':"&quot;" }[char])); }
function productPageCss() { return `:root{--text:#16191d;--muted:#5f6368;--line:#e5e7eb;--soft:#f8f9fa;--black:#050505;--white:#fff}*{box-sizing:border-box}body{margin:0;font-family:"Google Sans","Product Sans","Inter","Roboto",Arial,sans-serif;background:#fff;color:var(--text);-webkit-font-smoothing:antialiased}.product-shell{width:min(1180px,calc(100% - 32px));margin:0 auto;padding:28px 0 60px}.back-link{display:inline-flex;margin-bottom:22px;color:#111;text-decoration:none;font-weight:800;letter-spacing:-.03em}.product-card{display:grid;grid-template-columns:minmax(0,.95fr) minmax(340px,.75fr);gap:38px;align-items:start}.gallery{position:sticky;top:24px;border:1px solid var(--line);border-radius:28px;background:linear-gradient(180deg,#fafafa,#f2f2f2);padding:24px;min-height:620px;display:grid;place-items:center;box-shadow:0 24px 70px rgba(60,64,67,.10)}.gallery img{width:100%;height:min(72vh,560px);object-fit:contain}.stock-badge{position:absolute;left:28px;top:28px;border:1px solid #d7d7d7;background:#fff;color:#111;border-radius:999px;padding:8px 13px;font-size:12px;font-weight:800}.stock-badge.is-out{background:#111;color:#fff;border-color:#111}.details{padding:28px 0}.eyebrow{font-size:12px;letter-spacing:.16em;text-transform:uppercase;font-weight:800;color:var(--muted)}h1{font-size:clamp(38px,6vw,72px);line-height:.96;letter-spacing:-.075em;margin:12px 0 18px;font-weight:850}.description{font-size:17px;line-height:1.7;color:var(--muted);max-width:560px}.price-line{display:flex;align-items:flex-end;gap:10px;margin:28px 0 8px}.price-line span{font-weight:800;color:var(--muted)}.price-line strong{font-size:40px;letter-spacing:-.06em}.price-line del{color:#8b8b8b;margin-bottom:8px}.sku-line{color:var(--muted);font-size:14px}.variant-options{display:grid;gap:22px;margin:30px 0}.option-group{display:grid;gap:10px}.option-label{font-size:13px;text-transform:uppercase;letter-spacing:.13em;font-weight:850;color:#3c4043}.option-values{display:flex;flex-wrap:wrap;gap:10px}.variant-option{min-height:44px;padding:0 16px;border-radius:999px;border:1px solid #d7d7d7;background:#fff;color:#111;font-weight:800;transition:.2s ease}.variant-option:hover,.variant-option.is-active{border-color:#111;background:#111;color:#fff}.variant-option.is-disabled{opacity:.42;text-decoration:line-through}.cart-button{width:100%;height:56px;border:0;border-radius:999px;background:#111;color:#fff;font-size:16px;font-weight:850;letter-spacing:-.02em;cursor:pointer}.cart-button:disabled{opacity:.45;cursor:not-allowed}.merchant-note{border:1px solid var(--line);border-radius:18px;background:var(--soft);padding:14px 16px;color:var(--muted);font-size:13px;line-height:1.55}@media(max-width:820px){.product-shell{width:min(100% - 22px,680px);padding-top:16px}.product-card{grid-template-columns:1fr;gap:16px}.gallery{position:relative;top:auto;min-height:420px;border-radius:22px}.details{padding:8px 2px}h1{font-size:42px}.price-line strong{font-size:32px}}`; }
function productPageHtml(data) {
  const product = data.product;
  const selected = data.selectedVariant;
  const initial = JSON.stringify(data).replace(/</g, "\\u003c");
  const schema = JSON.stringify(data.schema).replace(/</g, "\\u003c");
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>${xmlEscape(product.name)} | OrlaTrends</title><meta name="description" content="${xmlEscape(product.description || product.name)}"><link id="canonicalLink" rel="canonical" href="${data.canonicalUrl}"><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet"><script type="application/ld+json" id="productSchema">${schema}</script><script>window.__ORLA_PRODUCT_DATA__=${initial};</script><script src="/variant-deeplink.js?v=20260610variants" defer></script><style>${productPageCss()}</style></head><body data-product-slug="${product.slug}"><main class="product-shell" data-product-page><a class="back-link" href="/">OrlaTrends</a><section class="product-card"><div class="gallery"><img id="productImage" src="${selected.imageUrl}" alt="${xmlEscape(product.name)}"><span id="stockBadge" class="stock-badge">${selected.availability === "in_stock" ? "In stock" : "Out of stock"}</span></div><div class="details"><p class="eyebrow">${xmlEscape(product.categoryName || "Premium Fashion")}</p><h1 id="productTitle">${xmlEscape(product.name)}</h1><p id="productDescription" class="description">${xmlEscape(product.description || "Premium OrlaTrends fashion selection.")}</p><div class="price-line"><span>AED</span><strong id="productPrice">${selected.price.toFixed(2)}</strong><del id="comparePrice">${selected.compareAtPrice ? `AED ${selected.compareAtPrice.toFixed(2)}` : ""}</del></div><p class="sku-line">SKU: <strong id="variantSku">${xmlEscape(selected.sku)}</strong></p><div id="variantOptions" class="variant-options"></div><button id="addToCartButton" class="cart-button" type="button">Add selected variant to cart</button><p class="merchant-note">Variant URL, visible price, stock status and JSON-LD schema are synchronized for Google Merchant Center.</p></div></section></main></body></html>`;
}

async function getCachedStorefrontProduct(slug, query = {}) {
  const key = productCacheKey(slug, query);
  const cached = cacheGet("productData", key);
  if (cached) return { data: cached, hit: true };
  const data = await loadStorefrontProduct(slug, query);
  if (data) cacheSet("productData", key, data, CACHE_TTL.PRODUCT_DATA);
  return { data, hit: false };
}
async function loadStorefrontList() {
  const cached = cacheGet("storefrontList", "active-products");
  if (cached) return { data: cached, hit: true };
  const [rows] = await pool.query("SELECT id,name,slug,sku,price,compare_at_price,stock_quantity,availability,image_url FROM products WHERE status='active' ORDER BY created_at DESC LIMIT 80");
  const data = { rows: rows.map((product) => ({ ...product, url: `${STORE_DOMAIN}/${product.slug}.html` })) };
  cacheSet("storefrontList", "active-products", data, CACHE_TTL.STOREFRONT_LIST);
  return { data, hit: false };
}
async function loadActiveProductGroups() {
  const [products] = await pool.query("SELECT p.*,c.name category_name,b.name brand_name FROM products p LEFT JOIN categories c ON c.id=p.category_id LEFT JOIN brands b ON b.id=p.brand_id WHERE p.status='active' ORDER BY p.id");
  if (!products.length) return [];
  const ids = products.map((product) => product.id);
  const placeholders = ids.map(() => "?").join(",");
  const [variantRows] = await pool.query(`SELECT * FROM product_variants WHERE product_id IN (${placeholders}) ORDER BY product_id,id`, ids);
  const variantsByProduct = new Map();
  variantRows.forEach((row) => {
    const list = variantsByProduct.get(row.product_id) || [];
    list.push(row);
    variantsByProduct.set(row.product_id, list);
  });
  return products.map((product) => {
    const rows = variantsByProduct.get(product.id) || [];
    const variants = rows.length ? rows.map((row) => variantView(product, row)) : [parentVariantView(product)];
    return { product, variants };
  });
}
function merchantFeedItem(product, variant) {
  const attrs = variant.attributes || {};
  return {
    id: variant.sku,
    item_group_id: product.sku,
    title: `${product.name} - ${variant.name}`,
    description: product.description || product.name,
    link: variant.url,
    image_link: variant.imageUrl,
    price: `${variant.price.toFixed(2)} AED`,
    availability: variant.availability === "in_stock" ? "in_stock" : "out_of_stock",
    brand: product.brand_name || "OrlaTrends",
    google_product_category: product.google_product_category || product.category_name || "Apparel & Accessories",
    color: attrs.color || undefined,
    size: attrs.size || attrs["shoe-size"] || undefined,
    gender: variant.gender || attrs.gender || undefined,
    age_group: variant.ageGroup || attrs["age-group"] || undefined,
    material: attrs.material || attrs.fabric || undefined,
    pattern: attrs.pattern || undefined,
    gtin: variant.gtin || undefined,
    mpn: variant.mpn || undefined,
    condition: variant.condition || "new",
    ram: attrs.ram || undefined,
    storage: attrs.storage || undefined,
    processor: attrs.processor || undefined
  };
}
async function loadMerchantFeedItems() {
  const cached = cacheGet("merchantFeed", "items");
  if (cached) return { items: cached, hit: true };
  const groups = await loadActiveProductGroups();
  const items = groups.flatMap(({ product, variants }) => variants.map((variant) => merchantFeedItem(product, variant)));
  cacheSet("merchantFeed", "items", items, CACHE_TTL.MERCHANT_FEED);
  return { items, hit: false };
}

app.get("/api/storefront/products", asyncHandler(async (_req, res) => {
  const { data, hit } = await loadStorefrontList();
  setPublicCacheHeaders(res, { browserSeconds: 60, cdnSeconds: 300, staleSeconds: 60 });
  res.set("X-Orla-Cache", hit ? "HIT" : "MISS");
  ok(res, data);
}));
app.get("/api/storefront/products/:slug", asyncHandler(async (req, res) => {
  const { data, hit } = await getCachedStorefrontProduct(req.params.slug, req.query);
  if (!data) return fail(res, 404, "Product not found");
  setPublicCacheHeaders(res, { browserSeconds: 30, cdnSeconds: 180, staleSeconds: 60 });
  res.set("X-Orla-Cache", hit ? "HIT" : "MISS");
  ok(res, data);
}));
app.get(["/api/google/merchant-feed.json", "/api/google/feed.json"], asyncHandler(async (_req, res) => {
  const { items, hit } = await loadMerchantFeedItems();
  setPublicCacheHeaders(res, { browserSeconds: 300, cdnSeconds: 900, staleSeconds: 300 });
  res.set("X-Orla-Cache", hit ? "HIT" : "MISS");
  res.json({ generated_at: new Date().toISOString(), domain: STORE_DOMAIN, items });
}));
app.get(["/api/google/merchant-feed.csv", "/api/google/feed.csv"], asyncHandler(async (_req, res) => {
  const { items, hit } = await loadMerchantFeedItems();
  const headers = ["id","item_group_id","title","description","link","image_link","availability","price","brand","gtin","mpn","condition","google_product_category","color","size","gender","age_group","material","pattern","ram","storage","processor"];
  const escapeCsv = (value) => `"${String(value ?? "").replace(/"/g, '""')}"`;
  const rows = [headers.join(",")];
  items.forEach((item) => rows.push(headers.map((key) => escapeCsv(item[key])).join(",")));
  setPublicCacheHeaders(res, { browserSeconds: 300, cdnSeconds: 900, staleSeconds: 300 });
  res.set("X-Orla-Cache", hit ? "HIT" : "MISS");
  res.type("text/csv").send(rows.join("\n"));
}));
app.get(["/api/google/merchant-feed.xml", "/api/google/feed.xml"], asyncHandler(async (_req, res) => {
  const { items, hit } = await loadMerchantFeedItems();
  const itemXml = items.map((item) => `<item><g:id>${xmlEscape(item.id)}</g:id><g:item_group_id>${xmlEscape(item.item_group_id)}</g:item_group_id><title>${xmlEscape(item.title)}</title><description>${xmlEscape(item.description)}</description><link>${xmlEscape(item.link)}</link><g:image_link>${xmlEscape(item.image_link)}</g:image_link><g:price>${xmlEscape(item.price)}</g:price><g:availability>${xmlEscape(item.availability)}</g:availability><g:brand>${xmlEscape(item.brand)}</g:brand>${item.gtin ? `<g:gtin>${xmlEscape(item.gtin)}</g:gtin>` : ""}${item.mpn ? `<g:mpn>${xmlEscape(item.mpn)}</g:mpn>` : ""}<g:condition>${xmlEscape(item.condition)}</g:condition>${item.gender ? `<g:gender>${xmlEscape(item.gender)}</g:gender>` : ""}${item.age_group ? `<g:age_group>${xmlEscape(item.age_group)}</g:age_group>` : ""}${item.color ? `<g:color>${xmlEscape(item.color)}</g:color>` : ""}${item.size ? `<g:size>${xmlEscape(item.size)}</g:size>` : ""}${item.material ? `<g:material>${xmlEscape(item.material)}</g:material>` : ""}${item.pattern ? `<g:pattern>${xmlEscape(item.pattern)}</g:pattern>` : ""}</item>`);
  setPublicCacheHeaders(res, { browserSeconds: 300, cdnSeconds: 900, staleSeconds: 300 });
  res.set("X-Orla-Cache", hit ? "HIT" : "MISS");
  res.type("application/xml").send(`<?xml version="1.0" encoding="UTF-8"?><rss version="2.0" xmlns:g="http://base.google.com/ns/1.0"><channel><title>OrlaTrends Product Feed</title><link>${xmlEscape(STORE_DOMAIN)}</link><description>Variant-level Google Merchant Center feed</description>${itemXml.join("")}</channel></rss>`);
}));app.get("/robots.txt", (_req, res) => {
  const cached = cacheGet("robots", "txt");
  if (cached) {
    setPublicCacheHeaders(res, { browserSeconds: 3600, cdnSeconds: 86400, staleSeconds: 3600 });
    res.set("X-Orla-Cache", "HIT");
    return res.type("text/plain").send(cached);
  }
  const body = `User-agent: *\nAllow: /\nAllow: /*?variant=\nAllow: /*?color=\nAllow: /*?size=\nAllow: /*?shoe-size=\nAllow: /*?fabric=\nAllow: /*?material=\nAllow: /*?style=\nAllow: /*?pattern=\nAllow: /*?fit=\nUser-agent: Googlebot-Image\nAllow: /\nSitemap: ${STORE_DOMAIN}/sitemap.xml\n`;
  cacheSet("robots", "txt", body, CACHE_TTL.ROBOTS);
  setPublicCacheHeaders(res, { browserSeconds: 3600, cdnSeconds: 86400, staleSeconds: 3600 });
  res.set("X-Orla-Cache", "MISS");
  res.type("text/plain").send(body);
});
app.get("/assets/images/*", (req, res, next) => {
  const requested = String(req.params[0] || "");
  if (!/^[a-zA-Z0-9 _&().\/-]+\.(png|jpe?g|webp|gif|svg)$/i.test(requested)) return next();

  const imagesRoot = path.resolve(__dirname, "..", "..", "assets", "images");
  const fullPath = path.resolve(imagesRoot, requested);
  if (!fullPath.startsWith(imagesRoot + path.sep)) return next();
  if (!fs.existsSync(fullPath)) return next();

  setPublicCacheHeaders(res, { browserSeconds: 31536000, cdnSeconds: 31536000, staleSeconds: 604800, immutable: true });
  res.sendFile(fullPath);
});
app.get(["/product.html", "/:productSlug.html"], asyncHandler(async (req, res, next) => {
  const pathSlug = req.params.productSlug;
  if (pathSlug && RESERVED_PRODUCT_SLUGS.has(normalizeParamValue(pathSlug))) return next();
  let slug = normalizeParamValue(pathSlug || req.query.slug || req.query.product || "");
  if (!slug) {
    const cachedSlug = cacheGet("productData", "first-active-slug");
    if (cachedSlug) slug = cachedSlug;
    else {
      const [first] = await pool.query("SELECT slug FROM products WHERE status='active' ORDER BY id LIMIT 1");
      slug = first[0]?.slug;
      if (slug) cacheSet("productData", "first-active-slug", slug, CACHE_TTL.STOREFRONT_LIST);
    }
  }
  if (!slug) return next();
  const key = productCacheKey(slug, req.query);
  const cachedHtml = cacheGet("productHtml", key);
  if (cachedHtml) {
    setPublicCacheHeaders(res, { browserSeconds: 60, cdnSeconds: 300, staleSeconds: 60 });
    res.set("X-Orla-Cache", "HIT");
    return res.type("html").send(cachedHtml);
  }
  const { data, hit } = await getCachedStorefrontProduct(slug, req.query);
  if (!data) return next();
  const html = productPageHtml(data);
  cacheSet("productHtml", key, html, CACHE_TTL.PRODUCT_HTML);
  setPublicCacheHeaders(res, { browserSeconds: 60, cdnSeconds: 300, staleSeconds: 60 });
  res.set("X-Orla-Cache", hit ? "DATA-HIT" : "MISS");
  res.type("html").send(html);
}));
// END ORLATRENDS STOREFRONT VARIANT DEEPLINKING
const frontendDir = path.join(__dirname, "..", "frontend");
app.use(express.static(frontendDir, { etag: true, maxAge: "1h", setHeaders: setStaticCacheHeaders }));
app.get(["/", "/admin", "/admin.html", "/login", "/login.html", "/dashboard", "/dashboard.html", "/catalog", "/catalog.html", "/orders", "/customers", "/inventory"], (_req, res) => res.sendFile(path.join(frontendDir, "admin.html")));

app.use((err, _req, res, _next) => {
  console.error(err);
  const message = err.code === "ER_DUP_ENTRY" ? "Duplicate record already exists" : err.message || "Server error";
  fail(res, 500, message);
});

initDatabase()
  .then(() => app.listen(PORT, () => console.log(`OrlaTrends Admin ready at http://localhost:${PORT}/admin.html`)))
  .catch((err) => {
    console.error("Failed to start OrlaTrends Admin", err);
    process.exit(1);
  });


app.get("/api/orders/advanced", authRequired, requirePermission("orders.read"), asyncHandler(async (req, res) => {
  const [rows] = await pool.query(`SELECT
      o.id,o.order_number,o.status,o.payment_status,o.fulfillment_status,o.subtotal,o.tax,o.shipping,o.total,o.currency,o.channel,o.created_at,o.updated_at,
      c.full_name AS customer_name,c.email AS customer_email,c.phone AS customer_phone,c.country AS customer_country,
      s.tracking_number,s.carrier,s.status AS shipping_status,
      COALESCE(SUM(oi.quantity),0) AS item_count,
      GROUP_CONCAT(CONCAT(oi.product_name, ' x', oi.quantity) ORDER BY oi.id SEPARATOR '||') AS items_summary
    FROM orders o
    LEFT JOIN customers c ON c.id=o.customer_id
    LEFT JOIN shipping_shipments s ON s.order_id=o.id
    LEFT JOIN order_items oi ON oi.order_id=o.id
    GROUP BY o.id
    ORDER BY o.created_at DESC
    LIMIT 500`);
  const [[stats]] = await pool.query(`SELECT
      COUNT(*) AS totalOrders,
      SUM(CASE WHEN payment_status='pending' THEN 1 ELSE 0 END) AS pendingPayment,
      SUM(CASE WHEN DATE(created_at)=CURDATE() THEN 1 ELSE 0 END) AS todaysOrders,
      COALESCE(SUM(total),0) AS grandTotal
    FROM orders`);
  ok(res, { rows, stats });
}));













function stripTags(value) { return String(value ?? "").replace(/<[^>]*>?/gm, "").trim(); }
function toSlug(value, fallback = "item") { return stripTags(value).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 180) || fallback; }
function nullable(value) { const v = stripTags(value); return v ? v : null; }
function toNumber(value, fallback = 0) { const n = Number(value); return Number.isFinite(n) ? n : fallback; }
function toInt(value, fallback = 0) { const n = parseInt(value, 10); return Number.isFinite(n) ? n : fallback; }
function toBool(value, fallback = true) { if (value === undefined || value === null || value === "") return fallback; if (typeof value === "boolean") return value; return ["true", "1", "yes", "on"].includes(String(value).toLowerCase()); }
function parseJsonArray(value, fallback = []) { if (Array.isArray(value)) return value; if (!value) return fallback; try { const parsed = JSON.parse(value); return Array.isArray(parsed) ? parsed : fallback; } catch { return fallback; } }
function normalizeProductPayload(body = {}) {
  const title = stripTags(body.title); const sku = stripTags(body.sku).toUpperCase();
  const variants = parseJsonArray(body.variants).map((v, i) => ({ variantSku: stripTags(v.variantSku || v.variant_sku || `${sku}-${i + 1}`).toUpperCase(), optionName: stripTags(v.optionName || v.option_name || "Option"), optionValue: stripTags(v.optionValue || v.option_value || v.value || `Option ${i + 1}`), price: v.price === "" || v.price === undefined ? null : toNumber(v.price, 0), stockQuantity: toInt(v.stockQuantity ?? v.stock_quantity, 0), status: ["active", "inactive"].includes(v.status) ? v.status : "active" }));
  return { categoryId: body.categoryId || body.category_id || null, brandId: body.brandId || body.brand_id || null, title, slug: toSlug(body.slug || title), sku, shortDescription: nullable(body.shortDescription || body.short_description), description: nullable(body.description), status: ["draft", "active", "scheduled", "archived"].includes(body.status) ? body.status : "draft", productType: variants.length ? "variant" : "simple", price: toNumber(body.price, 0), compareAtPrice: body.compareAtPrice || body.compare_at_price ? toNumber(body.compareAtPrice ?? body.compare_at_price, 0) : null, costPrice: body.costPrice || body.cost_price ? toNumber(body.costPrice ?? body.cost_price, 0) : null, currency: stripTags(body.currency || "AED").toUpperCase().slice(0, 3), stockQuantity: toInt(body.stockQuantity ?? body.stock_quantity, 0), lowStockThreshold: toInt(body.lowStockThreshold ?? body.low_stock_threshold, 5), trackInventory: toBool(body.trackInventory ?? body.track_inventory, true), scheduledAt: nullable(body.scheduledAt || body.scheduled_at), seoTitle: nullable(body.seoTitle || body.seo_title), seoDescription: nullable(body.seoDescription || body.seo_description), seoKeywords: nullable(body.seoKeywords || body.seo_keywords), variants };
}
function parseCsv(text) {
  const lines = text.replace(/\r/g, "").split("\n").filter(Boolean); if (lines.length < 2) return [];
  const headers = lines[0].split(",").map((h) => toSlug(h).replace(/-/g, "_"));
  return lines.slice(1).map((line) => { const values = line.split(","); return headers.reduce((r, h, i) => { r[h] = values[i] || ""; return r; }, {}); });
}
module.exports = { stripTags, toSlug, nullable, toNumber, toInt, toBool, parseJsonArray, normalizeProductPayload, parseCsv };

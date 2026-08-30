function clean(value) {
  if (typeof value === "string") return value.replace(/<[^>]*>?/gm, "").trim();
  if (Array.isArray(value)) return value.map(clean);
  if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, clean(v)]));
  return value;
}
function sanitizeInputMiddleware(req, res, next) {
  req.body = clean(req.body);
  req.query = clean(req.query);
  req.params = clean(req.params);
  next();
}
module.exports = { sanitizeInputMiddleware };

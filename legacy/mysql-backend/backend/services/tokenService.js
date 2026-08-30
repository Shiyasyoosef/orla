const crypto = require("crypto");
function sha256(value) { return crypto.createHash("sha256").update(value).digest("hex"); }
function addDays(days) { const d = new Date(); d.setDate(d.getDate() + days); return d; }
module.exports = { sha256, addDays };

const path = require("path");
const fs = require("fs");
const multer = require("multer");
const { randomUUID } = require("crypto");
const uploadRoot = path.join(__dirname, "..", "uploads", "catalog");
if (!fs.existsSync(uploadRoot)) fs.mkdirSync(uploadRoot, { recursive: true });
const storage = multer.diskStorage({
  destination(req, file, cb) { cb(null, uploadRoot); },
  filename(req, file, cb) { cb(null, `${Date.now()}-${randomUUID()}${path.extname(file.originalname || "").toLowerCase()}`); }
});
function imageFilter(req, file, cb) {
  if (!["image/jpeg", "image/png", "image/webp", "image/gif"].includes(file.mimetype)) return cb(new Error("Only image files are allowed"));
  cb(null, true);
}
function csvFilter(req, file, cb) {
  if (file.mimetype === "text/csv" || path.extname(file.originalname || "").toLowerCase() === ".csv") return cb(null, true);
  cb(new Error("Only CSV files are allowed"));
}
const productImageUpload = multer({ storage, fileFilter: imageFilter, limits: { fileSize: 5 * 1024 * 1024 } });
const mediaUpload = multer({ storage, fileFilter: imageFilter, limits: { fileSize: 8 * 1024 * 1024 } });
const csvUpload = multer({ storage: multer.memoryStorage(), fileFilter: csvFilter, limits: { fileSize: 2 * 1024 * 1024 } });
module.exports = { uploadRoot, productImageUpload, mediaUpload, csvUpload };

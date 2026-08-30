const fs = require("fs");
const path = require("path");
const logDir = path.join(__dirname, "..", "logs");
const logFile = path.join(logDir, "app.log");
if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });
function write(level, message, meta = {}) {
  const line = JSON.stringify({ timestamp: new Date().toISOString(), level, message, meta });
  fs.appendFile(logFile, `${line}\n`, () => {});
  if (process.env.NODE_ENV !== "test") console.log(`[${level.toUpperCase()}] ${message}`);
}
const logger = { info: (m, meta) => write("info", m, meta), warn: (m, meta) => write("warn", m, meta), error: (m, meta) => write("error", m, meta) };
module.exports = { logger };

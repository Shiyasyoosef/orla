const { StatusCodes } = require("http-status-codes");
const { sendError } = require("../helpers/responseHelper");
const { logger } = require("../helpers/logger");
function notFoundHandler(req, res) { return sendError(res, { statusCode: StatusCodes.NOT_FOUND, message: `Route not found: ${req.originalUrl}` }); }
function errorHandler(error, req, res, next) {
  logger.error("Unhandled error", { path: req.originalUrl, message: error.message });
  if (res.headersSent) return next(error);
  if (error.name === "MulterError" || /Only .* files are allowed/i.test(error.message || "")) return sendError(res, { statusCode: 400, message: error.message });
  return sendError(res, { statusCode: error.statusCode || 500, message: error.message || "Internal server error" });
}
module.exports = { notFoundHandler, errorHandler };

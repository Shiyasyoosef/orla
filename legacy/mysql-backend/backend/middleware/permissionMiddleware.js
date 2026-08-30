const { StatusCodes } = require("http-status-codes");
const { sendError } = require("../helpers/responseHelper");
function requirePermissions(...required) {
  return (req, res, next) => {
    const owned = new Set(req.user?.permissions || []);
    if (!required.every((p) => owned.has(p))) return sendError(res, { statusCode: StatusCodes.FORBIDDEN, message: "Permission denied" });
    next();
  };
}
function requireAnyPermission(...allowed) {
  return (req, res, next) => {
    const owned = new Set(req.user?.permissions || []);
    if (!allowed.some((p) => owned.has(p))) return sendError(res, { statusCode: StatusCodes.FORBIDDEN, message: "Permission denied" });
    next();
  };
}
module.exports = { requirePermissions, requireAnyPermission };

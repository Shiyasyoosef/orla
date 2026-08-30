const { StatusCodes } = require("http-status-codes");
const { verifyAccessToken } = require("../config/jwt");
const { sendError } = require("../helpers/responseHelper");
async function authMiddleware(req, res, next) {
  const authorization = req.headers.authorization || "";
  const [scheme, token] = authorization.split(" ");
  if (scheme !== "Bearer" || !token) return sendError(res, { statusCode: StatusCodes.UNAUTHORIZED, message: "Access token missing" });
  try {
    const payload = verifyAccessToken(token);
    req.user = { id: payload.sub, email: payload.email, role: payload.role, fullName: payload.fullName, permissions: payload.permissions || [], sessionId: payload.sid };
    next();
  } catch (error) {
    return sendError(res, { statusCode: StatusCodes.UNAUTHORIZED, message: "Access token expired or invalid" });
  }
}
module.exports = { authMiddleware };

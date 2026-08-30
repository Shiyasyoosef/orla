const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { env } = require("./env");
function signAccessToken(payload) {
  return jwt.sign(payload, env.jwtAccessSecret, {
    expiresIn: env.jwtAccessExpires,
    issuer: env.jwtIssuer,
    audience: env.jwtAudience,
    jwtid: crypto.randomUUID()
  });
}
function signRefreshToken(payload, rememberMe = false) {
  return jwt.sign(payload, env.jwtRefreshSecret, {
    expiresIn: rememberMe ? env.jwtRefreshExpiresRemember : env.jwtRefreshExpires,
    issuer: env.jwtIssuer,
    audience: env.jwtAudience,
    jwtid: payload.jti || crypto.randomUUID()
  });
}
function verifyAccessToken(token) {
  return jwt.verify(token, env.jwtAccessSecret, { issuer: env.jwtIssuer, audience: env.jwtAudience });
}
function verifyRefreshToken(token) {
  return jwt.verify(token, env.jwtRefreshSecret, { issuer: env.jwtIssuer, audience: env.jwtAudience });
}
module.exports = { signAccessToken, signRefreshToken, verifyAccessToken, verifyRefreshToken };

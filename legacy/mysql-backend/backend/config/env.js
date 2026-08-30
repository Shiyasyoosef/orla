const path = require("path");
const dotenv = require("dotenv");
dotenv.config({ path: path.join(__dirname, "..", "..", ".env") });
const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT || 5000),
  dbHost: process.env.DB_HOST || "localhost",
  dbPort: Number(process.env.DB_PORT || 3306),
  dbUser: process.env.DB_USER || "root",
  dbPassword: process.env.DB_PASSWORD || "",
  dbName: process.env.DB_NAME || "orlatrends_admin",
  dbConnectionLimit: Number(process.env.DB_CONNECTION_LIMIT || 10),
  jwtAccessSecret: process.env.JWT_ACCESS_SECRET || "change-access-secret",
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || "change-refresh-secret",
  jwtAccessExpires: process.env.JWT_ACCESS_EXPIRES || "15m",
  jwtRefreshExpires: process.env.JWT_REFRESH_EXPIRES || "7d",
  jwtRefreshExpiresRemember: process.env.JWT_REFRESH_EXPIRES_REMEMBER || "30d",
  jwtIssuer: process.env.JWT_ISSUER || "orlatrends-admin",
  jwtAudience: process.env.JWT_AUDIENCE || "orlatrends-staff",
  authMaxFailedAttempts: Number(process.env.AUTH_MAX_FAILED_ATTEMPTS || 5),
  authLockMinutes: Number(process.env.AUTH_LOCK_MINUTES || 15),
  authPasswordResetMinutes: Number(process.env.AUTH_PASSWORD_RESET_MINUTES || 20),
  authSessionIdleMinutes: Number(process.env.AUTH_SESSION_IDLE_MINUTES || 30),
  authRefreshTokenBytes: Number(process.env.AUTH_REFRESH_TOKEN_BYTES || 48),
  cookieSecure: process.env.COOKIE_SECURE === "true",
  cookieSameSite: process.env.COOKIE_SAME_SITE || "lax",
  corsOrigin: process.env.CORS_ORIGIN || "http://localhost:5000",
  defaultSuperAdminName: process.env.DEFAULT_SUPER_ADMIN_NAME || "Orla Super Admin",
  defaultSuperAdminEmail: process.env.DEFAULT_SUPER_ADMIN_EMAIL || "admin@orlatrends.com",
  defaultSuperAdminPassword: process.env.DEFAULT_SUPER_ADMIN_PASSWORD || "Admin@123"
};
module.exports = { env };

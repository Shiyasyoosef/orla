const mysql = require("mysql2/promise");
const { env } = require("./env");
const pool = mysql.createPool({
  host: env.dbHost,
  port: env.dbPort,
  user: env.dbUser,
  password: env.dbPassword,
  database: env.dbName,
  waitForConnections: true,
  connectionLimit: env.dbConnectionLimit,
  queueLimit: 0
});
async function testConnection() {
  const connection = await pool.getConnection();
  try { await connection.ping(); }
  finally { connection.release(); }
}
module.exports = { pool, testConnection };

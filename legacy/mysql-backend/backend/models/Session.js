const { pool } = require("../config/database");
const Session = {
  async create({ id, adminId, refreshJti, refreshTokenHash, ipAddress, userAgent, rememberMe, expiresAt }) { await pool.execute("INSERT INTO admin_sessions(id,admin_id,refresh_jti,refresh_token_hash,ip_address,user_agent,remember_me,expires_at) VALUES(?,?,?,?,?,?,?,?)", [id,adminId,refreshJti,refreshTokenHash,ipAddress,userAgent,rememberMe?1:0,expiresAt]); },
  async findById(id) { const [r] = await pool.execute("SELECT * FROM admin_sessions WHERE id=? LIMIT 1", [id]); return r[0] || null; },
  async findByRefreshJti(jti) { const [r] = await pool.execute("SELECT * FROM admin_sessions WHERE refresh_jti=? LIMIT 1", [jti]); return r[0] || null; },
  async rotate({ id, refreshJti, refreshTokenHash, previousRefreshJti, expiresAt }) { await pool.execute("UPDATE admin_sessions SET previous_refresh_jti=?, refresh_jti=?, refresh_token_hash=?, expires_at=?, last_used_at=NOW() WHERE id=?", [previousRefreshJti,refreshJti,refreshTokenHash,expiresAt,id]); },
  async revokeSession(id) { await pool.execute("UPDATE admin_sessions SET revoked_at=NOW() WHERE id=?", [id]); }
};
module.exports = Session;

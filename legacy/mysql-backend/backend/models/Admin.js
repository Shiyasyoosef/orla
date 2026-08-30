const { pool } = require("../config/database");
const Admin = {
  async countAdmins() { const [r] = await pool.execute("SELECT COUNT(*) total FROM admins"); return r[0]?.total || 0; },
  async findByEmail(email) { const [r] = await pool.execute(`SELECT a.*, r.role_name FROM admins a JOIN staff_roles r ON r.id=a.role_id WHERE a.email=? LIMIT 1`, [email]); return r[0] || null; },
  async findById(id) { const [r] = await pool.execute(`SELECT a.id,a.full_name,a.email,a.role_id,a.status,a.last_login,r.role_name FROM admins a JOIN staff_roles r ON r.id=a.role_id WHERE a.id=? LIMIT 1`, [id]); return r[0] || null; },
  async createAdmin({ fullName, email, passwordHash, roleId, status = "active" }) { const [r] = await pool.execute("INSERT INTO admins(full_name,email,password_hash,role_id,status) VALUES(?,?,?,?,?)", [fullName,email,passwordHash,roleId,status]); return r.insertId; },
  async getPermissionsByRoleId(roleId) { const [r] = await pool.execute(`SELECT p.permission_name FROM role_permissions rp JOIN permissions p ON p.id=rp.permission_id WHERE rp.role_id=?`, [roleId]); return r.map(x => x.permission_name); },
  async updateLastLogin(id) { await pool.execute("UPDATE admins SET last_login=NOW(), failed_login_attempts=0, locked_until=NULL WHERE id=?", [id]); },
  async incrementFailedLogin(id, lockUntil=null) { await pool.execute("UPDATE admins SET failed_login_attempts=failed_login_attempts+1, locked_until=COALESCE(?,locked_until) WHERE id=?", [lockUntil,id]); },
  async createLoginLog({ adminId, ipAddress, device }) { await pool.execute("INSERT INTO login_logs(admin_id,ip_address,device) VALUES(?,?,?)", [adminId,ipAddress,device]); },
  async createActivityLog({ adminId, action, module }) { await pool.execute("INSERT INTO activity_logs(admin_id,action,module) VALUES(?,?,?)", [adminId,action,module]); }
};
module.exports = Admin;

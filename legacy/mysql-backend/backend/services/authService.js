const bcrypt = require("bcryptjs");
const Admin = require("../models/Admin");
const { env } = require("../config/env");
async function bootstrapSuperAdmin(){const total=await Admin.countAdmins(); if(total>0)return; const roleRows = await require("../config/database").pool.execute("SELECT id FROM staff_roles WHERE role_name='Super Admin' LIMIT 1"); const roleId=roleRows[0][0]?.id || 1; const passwordHash=await bcrypt.hash(env.defaultSuperAdminPassword,12); await Admin.createAdmin({fullName:env.defaultSuperAdminName,email:env.defaultSuperAdminEmail,passwordHash,roleId});}
module.exports={bootstrapSuperAdmin};

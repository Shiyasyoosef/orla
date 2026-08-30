const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const { StatusCodes } = require("http-status-codes");
const Admin = require("../models/Admin");
const Session = require("../models/Session");
const { env } = require("../config/env");
const { signAccessToken, signRefreshToken, verifyRefreshToken } = require("../config/jwt");
const { sendSuccess, sendError } = require("../helpers/responseHelper");
const { sha256, addDays } = require("../services/tokenService");
function cookieOptions(rememberMe=false){return { httpOnly:true, secure:env.cookieSecure, sameSite:env.cookieSameSite, maxAge:(rememberMe?30:7)*24*60*60*1000 };}
async function issueTokens(admin, permissions, req, rememberMe=false, sessionId=crypto.randomUUID()) {
  const refreshJti=crypto.randomUUID();
  const accessToken=signAccessToken({sub:String(admin.id),email:admin.email,role:admin.role_name,fullName:admin.full_name,permissions,sid:sessionId});
  const refreshToken=signRefreshToken({sub:String(admin.id),sid:sessionId,jti:refreshJti}, rememberMe);
  await Session.create({id:sessionId,adminId:admin.id,refreshJti,refreshTokenHash:sha256(refreshToken),ipAddress:req.ip,userAgent:req.headers["user-agent"]||"",rememberMe,expiresAt:addDays(rememberMe?30:7)});
  return {accessToken,refreshToken};
}
async function loginHandler(req,res,next){try{const {email,password,rememberMe}=req.body; const admin=await Admin.findByEmail(email); if(!admin) return sendError(res,{statusCode:401,message:"Invalid credentials"}); if(admin.locked_until && new Date(admin.locked_until)>new Date()) return sendError(res,{statusCode:423,message:"Account temporarily locked"}); const ok=await bcrypt.compare(password,admin.password_hash); if(!ok){let lock=null; if((admin.failed_login_attempts||0)+1>=env.authMaxFailedAttempts){lock=new Date(Date.now()+env.authLockMinutes*60000)} await Admin.incrementFailedLogin(admin.id,lock); return sendError(res,{statusCode:401,message:"Invalid credentials"});} const permissions=await Admin.getPermissionsByRoleId(admin.role_id); const tokens=await issueTokens(admin,permissions,req,Boolean(rememberMe)); await Admin.updateLastLogin(admin.id); await Admin.createLoginLog({adminId:admin.id,ipAddress:req.ip,device:req.headers["user-agent"]||""}); res.cookie("orla_refresh_token",tokens.refreshToken,cookieOptions(Boolean(rememberMe))); return sendSuccess(res,{message:"Logged in",data:{accessToken:tokens.accessToken,user:{id:admin.id,email:admin.email,fullName:admin.full_name,role:admin.role_name,permissions}}});}catch(e){next(e)}}
async function refreshHandler(req,res,next){try{const token=req.cookies.orla_refresh_token; if(!token) return sendError(res,{statusCode:401,message:"Refresh token missing"}); const payload=verifyRefreshToken(token); const session=await Session.findById(payload.sid); if(!session || session.revoked_at || session.refresh_token_hash!==sha256(token)) return sendError(res,{statusCode:401,message:"Session invalid"}); const admin=await Admin.findById(payload.sub); const permissions=await Admin.getPermissionsByRoleId(admin.role_id); await Session.revokeSession(session.id); const tokens=await issueTokens({...admin,role_name:admin.role_name},permissions,req,Boolean(session.remember_me)); res.cookie("orla_refresh_token",tokens.refreshToken,cookieOptions(Boolean(session.remember_me))); return sendSuccess(res,{message:"Session refreshed",data:{accessToken:tokens.accessToken}});}catch(e){return sendError(res,{statusCode:401,message:"Session expired"})}}
async function logoutHandler(req,res){if(req.user?.sessionId) await Session.revokeSession(req.user.sessionId); res.clearCookie("orla_refresh_token"); return sendSuccess(res,{message:"Logged out"});}
async function meHandler(req,res){return sendSuccess(res,{data:{user:req.user}});}
module.exports={loginHandler,refreshHandler,logoutHandler,meHandler};

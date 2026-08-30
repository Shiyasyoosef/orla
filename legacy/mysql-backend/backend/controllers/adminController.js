const Dashboard=require("../models/Dashboard"); const {sendSuccess}=require("../helpers/responseHelper");
async function dashboardHandler(req,res){return sendSuccess(res,{data:{user:req.user,serverTime:new Date().toISOString()}})}
async function dashboardOverviewHandler(req,res,next){try{const data=await Dashboard.overview(String(req.query.country||"AE").toUpperCase().slice(0,2)); data.user=req.user; return sendSuccess(res,{message:"Premium dashboard data",data});}catch(e){next(e)}}
async function dashboardSearchHandler(req,res,next){try{const q=String(req.query.q||"").trim(); if(q.length<2)return sendSuccess(res,{data:[]}); return sendSuccess(res,{data:await Dashboard.search(q,String(req.query.country||"AE").toUpperCase().slice(0,2))});}catch(e){next(e)}}
module.exports={dashboardHandler,dashboardOverviewHandler,dashboardSearchHandler};

const Category=require("../models/Category"); const {sendSuccess,sendError}=require("../helpers/responseHelper"); const {stripTags,toSlug,nullable,toInt}=require("../services/catalogService");
function norm(b){const name=stripTags(b.name); return {parentId:b.parentId||null,name,slug:toSlug(b.slug||name),description:nullable(b.description),imageUrl:nullable(b.imageUrl),seoTitle:nullable(b.seoTitle),seoDescription:nullable(b.seoDescription),status:b.status||"active",sortOrder:toInt(b.sortOrder,0)}}
async function listCategories(req,res,next){try{const r=await Category.list(req.query);sendSuccess(res,{data:r.rows,meta:r.pagination})}catch(e){next(e)}}
async function createCategory(req,res,next){try{sendSuccess(res,{statusCode:201,data:await Category.create(norm(req.body),req.user.id)})}catch(e){next(e)}}
async function updateCategory(req,res,next){try{sendSuccess(res,{data:await Category.update(req.params.id,norm(req.body))})}catch(e){next(e)}}
async function deleteCategory(req,res,next){try{sendSuccess(res,{data:{deleted:await Category.delete(req.params.id)}})}catch(e){next(e)}}
module.exports={listCategories,createCategory,updateCategory,deleteCategory};

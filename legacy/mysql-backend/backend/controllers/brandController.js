const Brand=require("../models/Brand"); const {sendSuccess}=require("../helpers/responseHelper"); const {stripTags,toSlug,nullable}=require("../services/catalogService");
function norm(b){const name=stripTags(b.name); return {name,slug:toSlug(b.slug||name),description:nullable(b.description),logoUrl:nullable(b.logoUrl),websiteUrl:nullable(b.websiteUrl),seoTitle:nullable(b.seoTitle),seoDescription:nullable(b.seoDescription),status:b.status||"active"}}
async function listBrands(req,res,next){try{const r=await Brand.list(req.query);sendSuccess(res,{data:r.rows,meta:r.pagination})}catch(e){next(e)}}
async function createBrand(req,res,next){try{sendSuccess(res,{statusCode:201,data:await Brand.create(norm(req.body),req.user.id)})}catch(e){next(e)}}
async function updateBrand(req,res,next){try{sendSuccess(res,{data:await Brand.update(req.params.id,norm(req.body))})}catch(e){next(e)}}
async function deleteBrand(req,res,next){try{sendSuccess(res,{data:{deleted:await Brand.delete(req.params.id)}})}catch(e){next(e)}}
module.exports={listBrands,createBrand,updateBrand,deleteBrand};

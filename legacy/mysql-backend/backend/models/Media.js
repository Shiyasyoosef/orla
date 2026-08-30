const { pool } = require("../config/database");
const Media = {
  async list({ search="", page=1, limit=50 }={}) { const p=[], where=[]; if(search){where.push("(original_name LIKE ? OR alt_text LIKE ?)");p.push(`%${search}%`,`%${search}%`)} const ws=where.length?`WHERE ${where.join(" AND ")}`:""; const l=Math.min(Number(limit)||50,100), o=((Number(page)||1)-1)*l; const [rows]=await pool.execute(`SELECT * FROM catalog_media_assets ${ws} ORDER BY created_at DESC LIMIT ? OFFSET ?`,[...p,l,o]); const [cr]=await pool.execute(`SELECT COUNT(*) total FROM catalog_media_assets ${ws}`,p); return { rows, pagination:{page:Number(page)||1,limit:l,total:cr[0]?.total||0} }; },
  async createFromFile(file,adminId,altText=null){const url=`/uploads/catalog/${file.filename}`; const [r]=await pool.execute("INSERT INTO catalog_media_assets(file_name,original_name,mime_type,file_size,url,alt_text,uploaded_by) VALUES(?,?,?,?,?,?,?)",[file.filename,file.originalname,file.mimetype,file.size,url,altText,adminId||null]); return this.findById(r.insertId);},
  async findById(id){const [r]=await pool.execute("SELECT * FROM catalog_media_assets WHERE id=?",[id]); return r[0]||null;},
  async delete(id){const [r]=await pool.execute("DELETE FROM catalog_media_assets WHERE id=?",[id]); return r.affectedRows>0;}
}; module.exports=Media;

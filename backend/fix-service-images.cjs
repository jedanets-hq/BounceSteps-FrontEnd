const {Pool}=require('pg');
require('dotenv').config();
const pool=new Pool({
  host:process.env.DB_HOST||'localhost',
  port:process.env.DB_PORT||5432,
  database:process.env.DB_NAME||'isafari_db',
  user:process.env.DB_USER||'postgres',
  password:process.env.DB_PASSWORD||'@Jctnftr01',
  ssl:process.env.NODE_ENV==='production'?{rejectUnauthorized:false}:false
});

(async()=>{
  try{
    console.log('Fixing service images...');
    
    // Get services with long base64 images
    const result = await pool.query(`
      SELECT id, title, images
      FROM services
      WHERE images IS NOT NULL 
      AND images != ''
      AND images != '[]'
      AND LENGTH(images::text) > 1000
    `);
    
    console.log(`Found ${result.rows.length} services with base64 images`);
    
    // Update each to empty array
    for (const service of result.rows) {
      await pool.query(`UPDATE services SET images = '[]'::jsonb WHERE id = $1`, [service.id]);
      console.log(`  ✅ Fixed: ${service.title}`);
    }
    
    console.log('✅ All service images fixed!');
  }catch(e){
    console.error('❌ Error:',e.message);
  }finally{
    await pool.end();
  }
})();

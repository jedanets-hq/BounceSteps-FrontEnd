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
    const services = await pool.query(`
      SELECT s.id, s.title, s.provider_id, sp.business_name, s.images
      FROM services s
      LEFT JOIN service_providers sp ON s.provider_id = sp.id
      WHERE s.is_active = true
      ORDER BY s.id
      LIMIT 20
    `);
    
    console.log('All services:');
    services.rows.forEach(s => {
      const imageStatus = !s.images || s.images === '[]' ? 'NO IMAGES' : 'HAS IMAGES';
      console.log(`  - ${s.id}: ${s.title} (${s.business_name}) - ${imageStatus}`);
    });
    
  }catch(e){
    console.error('Error:',e.message);
  }finally{
    await pool.end();
  }
})();

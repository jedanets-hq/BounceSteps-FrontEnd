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
    // Get provider 8
    const provider = await pool.query('SELECT * FROM service_providers WHERE id = 8');
    console.log('Provider 8:', provider.rows[0]);
    
    // Get services for provider 8
    const services = await pool.query('SELECT id, title, images FROM services WHERE provider_id = 8');
    console.log('\nServices for provider 8:');
    services.rows.forEach(s => {
      console.log(`  - ${s.title}: images = ${s.images}`);
    });
    
  }catch(e){
    console.error('Error:',e.message);
  }finally{
    await pool.end();
  }
})();

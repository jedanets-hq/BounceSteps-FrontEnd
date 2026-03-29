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
    const service = await pool.query('SELECT * FROM services WHERE id = 2');
    console.log('Service 2:');
    console.log('  Title:', service.rows[0].title);
    console.log('  Images:', service.rows[0].images);
    console.log('  Images type:', typeof service.rows[0].images);
    console.log('  Images length:', service.rows[0].images ? service.rows[0].images.length : 0);
    
  }catch(e){
    console.error('Error:',e.message);
  }finally{
    await pool.end();
  }
})();

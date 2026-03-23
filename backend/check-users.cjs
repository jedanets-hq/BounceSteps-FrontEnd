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
    const result = await pool.query('SELECT id, email, user_type FROM users LIMIT 10');
    console.log('Users in database:');
    result.rows.forEach(u => {
      console.log(`  - ID: ${u.id} | Email: ${u.email} | Type: ${u.user_type}`);
    });
  }catch(e){
    console.error('Error:',e.message);
  }finally{
    await pool.end();
  }
})();

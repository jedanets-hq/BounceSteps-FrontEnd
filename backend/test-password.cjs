const {Pool}=require('pg');
const bcrypt=require('bcryptjs');
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
    const result = await pool.query('SELECT id, email, password FROM users WHERE email = $1', ['testuser@test.com']);
    
    if (result.rows.length === 0) {
      console.log('User not found');
      return;
    }
    
    const user = result.rows[0];
    console.log('User:', user.email);
    console.log('Has password:', !!user.password);
    console.log('Password hash length:', user.password ? user.password.length : 0);
    
    // Test password
    const isValid = await bcrypt.compare('test123', user.password);
    console.log('Password test123 valid:', isValid);
    
  }catch(e){
    console.error('Error:',e.message);
  }finally{
    await pool.end();
  }
})();

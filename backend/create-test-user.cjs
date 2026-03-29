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
    const hashedPassword = await bcrypt.hash('test123', 10);
    
    // Check if user exists
    const check = await pool.query('SELECT id FROM users WHERE email = $1', ['testuser@test.com']);
    
    if (check.rows.length > 0) {
      // Update password
      await pool.query('UPDATE users SET password = $1 WHERE email = $2', [hashedPassword, 'testuser@test.com']);
      console.log('✅ Updated password for testuser@test.com');
    } else {
      // Create new user
      await pool.query(`
        INSERT INTO users (email, password, first_name, last_name, user_type, is_active)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, ['testuser@test.com', hashedPassword, 'Test', 'User', 'traveler', true]);
      console.log('✅ Created testuser@test.com');
    }
    
    console.log('Email: testuser@test.com');
    console.log('Password: test123');
    
  }catch(e){
    console.error('Error:',e.message);
  }finally{
    await pool.end();
  }
})();

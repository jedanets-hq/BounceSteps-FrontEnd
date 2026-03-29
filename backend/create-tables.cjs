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
    console.log('Creating provider_followers...');
    await pool.query('CREATE TABLE IF NOT EXISTS provider_followers(id SERIAL PRIMARY KEY,provider_id INTEGER NOT NULL REFERENCES service_providers(id) ON DELETE CASCADE,follower_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,followed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,UNIQUE(provider_id,follower_id))');
    console.log('✅ provider_followers created');
    
    console.log('Creating favorites...');
    await pool.query('CREATE TABLE IF NOT EXISTS favorites(id SERIAL PRIMARY KEY,user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,provider_id INTEGER NOT NULL REFERENCES service_providers(id) ON DELETE CASCADE,created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,UNIQUE(user_id,provider_id))');
    console.log('✅ favorites created');
    
    console.log('✅ Done!');
  }catch(e){
    console.error('❌ Error:',e.message);
  }finally{
    await pool.end();
  }
})();

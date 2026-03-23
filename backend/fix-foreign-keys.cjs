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
    console.log('Fixing foreign key constraints...\n');
    
    // Drop existing tables
    console.log('Dropping existing tables...');
    await pool.query('DROP TABLE IF EXISTS provider_followers CASCADE');
    await pool.query('DROP TABLE IF EXISTS favorites CASCADE');
    console.log('✅ Tables dropped\n');
    
    // Recreate provider_followers with correct foreign key
    console.log('Creating provider_followers table...');
    await pool.query(`
      CREATE TABLE provider_followers (
        id SERIAL PRIMARY KEY,
        provider_id INTEGER NOT NULL REFERENCES service_providers(id) ON DELETE CASCADE,
        follower_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        followed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(provider_id, follower_id)
      )
    `);
    console.log('✅ provider_followers created with service_providers.id reference\n');
    
    // Recreate favorites with correct foreign key
    console.log('Creating favorites table...');
    await pool.query(`
      CREATE TABLE favorites (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        provider_id INTEGER NOT NULL REFERENCES service_providers(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, provider_id)
      )
    `);
    console.log('✅ favorites created with service_providers.id reference\n');
    
    console.log('✅ All foreign keys fixed!');
    
  }catch(e){
    console.error('Error:',e.message);
  }finally{
    await pool.end();
  }
})();

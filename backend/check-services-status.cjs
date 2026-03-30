const { Pool } = require('pg');
require('dotenv').config({ path: '.env' });

const poolConfig = process.env.DATABASE_URL 
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl: false
    }
  : {
      user: process.env.DB_USER || 'postgres',
      host: process.env.DB_HOST || 'localhost',
      database: process.env.DB_NAME || 'isafari_db',
      password: process.env.DB_PASSWORD || 'password',
      port: process.env.DB_PORT || 5432,
    };

const pool = new Pool(poolConfig);

async function checkServicesStatus() {
  try {
    console.log('🔍 CHECKING SERVICES STATUS\n');
    
    // Check all services regardless of status
    const allServices = await pool.query(`
      SELECT id, title, provider_id, status, is_active
      FROM services
      ORDER BY id
    `);
    
    console.log(`Total services in database: ${allServices.rows.length}\n`);
    
    allServices.rows.forEach(s => {
      console.log(`Service #${s.id}: "${s.title}"`);
      console.log(`   provider_id: ${s.provider_id}`);
      console.log(`   status: ${s.status || 'NULL'}`);
      console.log(`   is_active: ${s.is_active}`);
      console.log('');
    });
    
    // Check services with status='active'
    const activeServices = await pool.query(`
      SELECT COUNT(*) as count
      FROM services
      WHERE status = 'active'
    `);
    console.log(`Services with status='active': ${activeServices.rows[0].count}`);
    
    // Check services with is_active=true
    const isActiveServices = await pool.query(`
      SELECT COUNT(*) as count
      FROM services
      WHERE is_active = true
    `);
    console.log(`Services with is_active=true: ${isActiveServices.rows[0].count}`);
    
    // Check services with BOTH
    const bothServices = await pool.query(`
      SELECT COUNT(*) as count
      FROM services
      WHERE status = 'active' AND is_active = true
    `);
    console.log(`Services with BOTH status='active' AND is_active=true: ${bothServices.rows[0].count}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkServicesStatus();

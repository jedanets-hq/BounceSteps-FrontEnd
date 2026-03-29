const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'isafari_db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function diagnoseProvidersIssue() {
  try {
    console.log('=== CHECKING PROVIDERS IN DATABASE ===\n');
    
    // First check users table structure
    const usersColumns = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'users'
      ORDER BY ordinal_position
    `);
    console.log('users table columns:', usersColumns.rows);
    console.log('\n');
    
    // Check all users
    const usersResult = await pool.query(`
      SELECT * 
      FROM users 
      ORDER BY id
      LIMIT 10
    `);
    console.log(`Total Users (showing first 10): ${usersResult.rows.length}`);
    console.log('Users:', usersResult.rows);
    console.log('\n');

    // Check service_providers table
    const providersResult = await pool.query(`
      SELECT sp.*, u.email
      FROM service_providers sp
      LEFT JOIN users u ON sp.user_id = u.id
      ORDER BY sp.id
    `);
    console.log(`Total Service Providers: ${providersResult.rows.length}`);
    console.log('Service Providers:', providersResult.rows);
    console.log('\n');

    // Check services table
    const servicesResult = await pool.query(`
      SELECT s.*, sp.business_name, u.email
      FROM services s
      LEFT JOIN service_providers sp ON s.provider_id = sp.id
      LEFT JOIN users u ON sp.user_id = u.id
      ORDER BY s.id
    `);
    console.log(`Total Services: ${servicesResult.rows.length}`);
    console.log('Services:', servicesResult.rows);
    console.log('\n');

    // Check for orphaned records
    const orphanedServices = await pool.query(`
      SELECT s.* 
      FROM services s
      LEFT JOIN service_providers sp ON s.provider_id = sp.id
      WHERE sp.id IS NULL
    `);
    console.log(`Orphaned Services (no provider): ${orphanedServices.rows.length}`);
    if (orphanedServices.rows.length > 0) {
      console.log('Orphaned Services:', orphanedServices.rows);
    }
    console.log('\n');

    const orphanedProviders = await pool.query(`
      SELECT sp.* 
      FROM service_providers sp
      LEFT JOIN users u ON sp.user_id = u.id
      WHERE u.id IS NULL
    `);
    console.log(`Orphaned Providers (no user): ${orphanedProviders.rows.length}`);
    if (orphanedProviders.rows.length > 0) {
      console.log('Orphaned Providers:', orphanedProviders.rows);
    }
    console.log('\n');

    // Check table structures
    console.log('=== TABLE STRUCTURES ===\n');
    
    const spColumns = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'service_providers'
      ORDER BY ordinal_position
    `);
    console.log('service_providers columns:', spColumns.rows);
    console.log('\n');

    const servicesColumns = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'services'
      ORDER BY ordinal_position
    `);
    console.log('services columns:', servicesColumns.rows);

  } catch (error) {
    console.error('Error diagnosing providers:', error);
  } finally {
    await pool.end();
  }
}

diagnoseProvidersIssue();

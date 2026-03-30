import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';
dotenv.config({ path: './backend/.env' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function diagnoseProvidersIssue() {
  try {
    console.log('=== CHECKING PROVIDERS IN DATABASE ===\n');
    
    // Check users table for service providers
    const usersResult = await pool.query(`
      SELECT id, email, role, created_at 
      FROM users 
      WHERE role = 'service_provider'
      ORDER BY id
    `);
    console.log(`Total Service Provider Users: ${usersResult.rows.length}`);
    console.log('Service Provider Users:', usersResult.rows);
    console.log('\n');

    // Check service_providers table
    const providersResult = await pool.query(`
      SELECT sp.*, u.email, u.role
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

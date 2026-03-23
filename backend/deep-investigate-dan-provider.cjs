const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'isafari_db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD
});

async function investigateDanProvider() {
  const client = await pool.connect();
  
  try {
    console.log('\n=== DEEP INVESTIGATION: DAN PROVIDER ===\n');
    
    // 1. Check Users table for Dan
    console.log('1. CHECKING USERS TABLE:');
    const usersResult = await client.query(`
      SELECT id, username, email, role, is_active, created_at 
      FROM users 
      WHERE username ILIKE '%dan%' OR email ILIKE '%dan%'
      ORDER BY id
    `);
    console.log('Users found:', usersResult.rows);
    
    // 2. Check ServiceProviders table
    console.log('\n2. CHECKING SERVICE_PROVIDERS TABLE:');
    const providersResult = await client.query(`
      SELECT * FROM service_providers 
      WHERE user_id IN (2, 5) OR id IN (2, 5)
      ORDER BY id
    `);
    console.log('Service Providers found:', providersResult.rows);
    
    // 3. Check Services table for these providers
    console.log('\n3. CHECKING SERVICES TABLE:');
    const servicesResult = await client.query(`
      SELECT s.*, sp.business_name, sp.user_id as provider_user_id
      FROM services s
      LEFT JOIN service_providers sp ON s.service_provider_id = sp.id
      WHERE s.service_provider_id IN (2, 5) OR sp.user_id IN (2, 5)
      ORDER BY s.id
    `);
    console.log('Services found:', servicesResult.rows);
    
    // 4. Check for orphaned services (services without valid provider)
    console.log('\n4. CHECKING FOR ORPHANED SERVICES:');
    const orphanedResult = await client.query(`
      SELECT s.id, s.name, s.service_provider_id, s.is_active
      FROM services s
      LEFT JOIN service_providers sp ON s.service_provider_id = sp.id
      WHERE sp.id IS NULL
      LIMIT 10
    `);
    console.log('Orphaned services:', orphanedResult.rows);
    
    // 5. Check relationship between users and service_providers
    console.log('\n5. CHECKING USER-PROVIDER RELATIONSHIP:');
    const relationshipResult = await client.query(`
      SELECT 
        u.id as user_id, 
        u.username, 
        u.role,
        sp.id as provider_id,
        sp.business_name,
        sp.is_active as provider_active,
        COUNT(s.id) as service_count
      FROM users u
      LEFT JOIN service_providers sp ON u.id = sp.user_id
      LEFT JOIN services s ON sp.id = s.service_provider_id
      WHERE u.id IN (2, 5) OR sp.id IN (2, 5)
      GROUP BY u.id, u.username, u.role, sp.id, sp.business_name, sp.is_active
      ORDER BY u.id
    `);
    console.log('User-Provider Relationship:', relationshipResult.rows);
    
    // 6. Check all columns in service_providers table
    console.log('\n6. CHECKING SERVICE_PROVIDERS TABLE STRUCTURE:');
    const columnsResult = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'service_providers'
      ORDER BY ordinal_position
    `);
    console.log('Service Providers columns:', columnsResult.rows);
    
    // 7. Check if there's a visibility or status issue
    console.log('\n7. CHECKING VISIBILITY/STATUS FIELDS:');
    const visibilityResult = await client.query(`
      SELECT 
        sp.id,
        sp.user_id,
        sp.business_name,
        sp.is_active,
        sp.verification_status,
        u.is_active as user_active,
        u.role
      FROM service_providers sp
      JOIN users u ON sp.user_id = u.id
      WHERE sp.id IN (2, 5) OR sp.user_id IN (2, 5)
    `);
    console.log('Visibility check:', visibilityResult.rows);
    
    // 8. Check what the API endpoint would return
    console.log('\n8. SIMULATING API QUERY FOR PROVIDER ID 2:');
    const apiSimResult = await client.query(`
      SELECT 
        sp.*,
        u.username,
        u.email,
        COUNT(DISTINCT s.id) as total_services,
        COUNT(DISTINCT CASE WHEN s.is_active = true THEN s.id END) as active_services
      FROM service_providers sp
      LEFT JOIN users u ON sp.user_id = u.id
      LEFT JOIN services s ON sp.id = s.service_provider_id
      WHERE sp.id = 2
      GROUP BY sp.id, u.username, u.email
    `);
    console.log('API simulation for provider 2:', apiSimResult.rows);
    
    console.log('\n=== INVESTIGATION COMPLETE ===\n');
    
  } catch (error) {
    console.error('Error during investigation:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

investigateDanProvider();

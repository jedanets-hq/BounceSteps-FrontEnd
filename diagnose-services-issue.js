import { pool } from './backend/models/index.js';

async function diagnoseServicesIssue() {
  try {
    console.log('🔍 DIAGNOSING SERVICES VISIBILITY ISSUE\n');
    
    // 1. Check services table structure
    console.log('1️⃣ Checking services table structure...');
    const schemaResult = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'services'
      ORDER BY ordinal_position
    `);
    console.log('Services table columns:', schemaResult.rows);
    
    // 2. Check if services exist
    console.log('\n2️⃣ Checking if services exist in database...');
    const servicesCount = await pool.query('SELECT COUNT(*) FROM services');
    console.log(`Total services in database: ${servicesCount.rows[0].count}`);
    
    // 3. Check service_providers table
    console.log('\n3️⃣ Checking service_providers...');
    const providersCount = await pool.query('SELECT COUNT(*) FROM service_providers');
    console.log(`Total service providers: ${providersCount.rows[0].count}`);
    
    // 4. Check the relationship - what is provider_id in services?
    console.log('\n4️⃣ Checking provider_id values in services...');
    const providerIds = await pool.query(`
      SELECT DISTINCT s.provider_id, sp.id as sp_id, sp.user_id, sp.business_name
      FROM services s
      LEFT JOIN service_providers sp ON s.provider_id = sp.id
      LIMIT 10
    `);
    console.log('Provider ID relationships:', providerIds.rows);
    
    // 5. Check if provider_id matches user_id or service_providers.id
    console.log('\n5️⃣ Checking if provider_id references user_id or service_providers.id...');
    const mismatchCheck = await pool.query(`
      SELECT 
        s.id as service_id,
        s.provider_id,
        s.title,
        sp.id as sp_table_id,
        sp.user_id,
        sp.business_name
      FROM services s
      LEFT JOIN service_providers sp ON s.provider_id = sp.user_id
      LIMIT 5
    `);
    console.log('Checking if provider_id = user_id:', mismatchCheck.rows);
    
    // 6. Check active services with proper join
    console.log('\n6️⃣ Checking active services with JOIN on service_providers.id...');
    const activeServices = await pool.query(`
      SELECT s.id, s.title, s.provider_id, s.is_active, s.status,
             sp.id as sp_id, sp.business_name
      FROM services s
      LEFT JOIN service_providers sp ON s.provider_id = sp.id
      WHERE s.is_active = true AND s.status = 'active'
      LIMIT 5
    `);
    console.log('Active services (JOIN on sp.id):', activeServices.rows);
    
    // 7. Check if there's a mismatch
    console.log('\n7️⃣ Checking for ID mismatch (provider_id vs service_providers.id)...');
    const mismatch = await pool.query(`
      SELECT 
        COUNT(*) as total_services,
        COUNT(sp.id) as services_with_valid_provider
      FROM services s
      LEFT JOIN service_providers sp ON s.provider_id = sp.id
      WHERE s.is_active = true
    `);
    console.log('Mismatch analysis:', mismatch.rows[0]);
    
    if (mismatch.rows[0].total_services !== mismatch.rows[0].services_with_valid_provider) {
      console.log('\n⚠️ FOUND THE ISSUE: provider_id in services does NOT match service_providers.id!');
      console.log('   Services are using user_id instead of service_providers.id');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await pool.end();
  }
}

diagnoseServicesIssue();

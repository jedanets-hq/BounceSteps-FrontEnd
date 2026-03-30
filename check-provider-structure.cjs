const { pool } = require('./backend/models');

async function checkStructure() {
  try {
    console.log('🔍 Checking service_providers table structure...\n');
    
    // Check table structure
    const structureResult = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'service_providers' 
      ORDER BY ordinal_position
    `);
    
    console.log('📋 service_providers columns:');
    structureResult.rows.forEach(col => {
      console.log(`  - ${col.column_name} (${col.data_type}) ${col.is_nullable === 'NO' ? 'NOT NULL' : ''}`);
    });
    
    // Check sample data
    console.log('\n📊 Sample provider data:');
    const sampleResult = await pool.query(`
      SELECT sp.*, u.email, u.first_name, u.last_name
      FROM service_providers sp
      JOIN users u ON sp.user_id = u.id
      LIMIT 3
    `);
    
    console.log(`Found ${sampleResult.rows.length} providers\n`);
    sampleResult.rows.forEach(p => {
      console.log(`Provider ID: ${p.id}, User ID: ${p.user_id}, Business: ${p.business_name}`);
    });
    
    // Check services table
    console.log('\n📦 Checking services table...');
    const servicesResult = await pool.query(`
      SELECT id, title, provider_id, category, is_active
      FROM services
      WHERE is_active = true
      LIMIT 5
    `);
    
    console.log(`Found ${servicesResult.rows.length} active services\n`);
    servicesResult.rows.forEach(s => {
      console.log(`Service ID: ${s.id}, Provider ID: ${s.provider_id}, Title: ${s.title}, Category: ${s.category}`);
    });
    
    // Check if provider_id in services matches user_id in service_providers
    console.log('\n🔗 Checking provider_id relationships...');
    const relationshipCheck = await pool.query(`
      SELECT 
        s.id as service_id,
        s.provider_id,
        sp.id as sp_id,
        sp.user_id,
        sp.business_name
      FROM services s
      LEFT JOIN service_providers sp ON s.provider_id = sp.user_id
      WHERE s.is_active = true
      LIMIT 5
    `);
    
    console.log('Service -> Provider mapping:');
    relationshipCheck.rows.forEach(r => {
      console.log(`  Service ${r.service_id} -> provider_id: ${r.provider_id} -> SP user_id: ${r.user_id} (${r.business_name || 'NOT FOUND'})`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
    process.exit();
  }
}

checkStructure();

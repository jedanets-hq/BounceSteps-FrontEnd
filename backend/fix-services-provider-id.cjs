const { Pool } = require('pg');

// Use production database
const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://isafarimasterorg_user:IuNv7yEfLRiDQL96cgmsxr2751MiBjsq@dpg-d5nhs5t6ubrc73asfksg-a.frankfurt-postgres.render.com/isafarimasterorg';

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function fixServicesProviderId() {
  try {
    console.log('🔧 FIXING SERVICES PROVIDER_ID MISMATCH\n');
    
    // 1. Check current state
    console.log('1️⃣ Checking current state...');
    const currentState = await pool.query(`
      SELECT 
        COUNT(*) as total_services,
        COUNT(CASE WHEN sp.id IS NOT NULL THEN 1 END) as services_with_valid_provider_id,
        COUNT(CASE WHEN sp.id IS NULL AND sp2.id IS NOT NULL THEN 1 END) as services_with_user_id_as_provider_id
      FROM services s
      LEFT JOIN service_providers sp ON s.provider_id = sp.id
      LEFT JOIN service_providers sp2 ON s.provider_id = sp2.user_id
    `);
    console.log('Current state:', currentState.rows[0]);
    
    // 2. Find services that need fixing
    console.log('\n2️⃣ Finding services that need fixing...');
    const servicesToFix = await pool.query(`
      SELECT 
        s.id as service_id,
        s.provider_id as current_provider_id,
        s.title,
        sp.id as correct_provider_id,
        sp.business_name
      FROM services s
      LEFT JOIN service_providers sp ON s.provider_id = sp.user_id
      WHERE sp.id IS NOT NULL
      AND s.provider_id != sp.id
    `);
    
    console.log(`Found ${servicesToFix.rows.length} services that need fixing`);
    
    if (servicesToFix.rows.length === 0) {
      console.log('✅ No services need fixing!');
      return;
    }
    
    // 3. Show what will be fixed
    console.log('\n3️⃣ Services to be fixed:');
    servicesToFix.rows.forEach(row => {
      console.log(`   Service #${row.service_id}: "${row.title}"`);
      console.log(`   Current provider_id: ${row.current_provider_id} (user_id)`);
      console.log(`   Correct provider_id: ${row.correct_provider_id} (service_providers.id)`);
      console.log(`   Business: ${row.business_name}\n`);
    });
    
    // 4. Fix the services
    console.log('4️⃣ Fixing services...');
    for (const service of servicesToFix.rows) {
      await pool.query(
        'UPDATE services SET provider_id = $1 WHERE id = $2',
        [service.correct_provider_id, service.service_id]
      );
      console.log(`   ✅ Fixed service #${service.service_id}`);
    }
    
    // 5. Verify the fix
    console.log('\n5️⃣ Verifying fix...');
    const afterState = await pool.query(`
      SELECT 
        COUNT(*) as total_services,
        COUNT(CASE WHEN sp.id IS NOT NULL THEN 1 END) as services_with_valid_provider_id
      FROM services s
      LEFT JOIN service_providers sp ON s.provider_id = sp.id
    `);
    console.log('After fix:', afterState.rows[0]);
    
    if (afterState.rows[0].total_services === afterState.rows[0].services_with_valid_provider_id) {
      console.log('\n✅ SUCCESS! All services now have correct provider_id');
    } else {
      console.log('\n⚠️ WARNING: Some services still have incorrect provider_id');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await pool.end();
  }
}

fixServicesProviderId();

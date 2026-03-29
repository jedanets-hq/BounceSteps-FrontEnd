const { Pool } = require('./backend/node_modules/pg');

const productionPool = new Pool({
  connectionString: 'postgresql://isafarimasterorg_user:IuNv7yEfLRiDQL96cgmsxr2751MiBjsq@dpg-d5nhs5t6ubrc73asfksg-a.frankfurt-postgres.render.com/isafarimasterorg',
  ssl: {
    rejectUnauthorized: false
  }
});

async function fixProviderForeignKey() {
  console.log('🔧 FIXING PROVIDER FOREIGN KEY ISSUE\n');
  console.log('='.repeat(80));
  
  try {
    await productionPool.query('BEGIN');
    console.log('✅ Transaction started\n');
    
    // Step 1: Update all services to use correct service_provider.id
    console.log('📝 Step 1: Mapping user_id to service_provider.id...');
    const updateResult = await productionPool.query(`
      UPDATE services s
      SET provider_id = sp.id
      FROM service_providers sp
      WHERE s.provider_id = sp.user_id
    `);
    console.log(`   ✅ Updated ${updateResult.rowCount} services\n`);
    
    // Step 2: Verify the update
    console.log('🔍 Step 2: Verifying updates...');
    const verification = await productionPool.query(`
      SELECT 
        s.id as service_id,
        s.title,
        s.provider_id,
        sp.id as sp_id,
        sp.business_name,
        sp.user_id
      FROM services s
      LEFT JOIN service_providers sp ON s.provider_id = sp.id
      ORDER BY s.created_at DESC
    `);
    
    verification.rows.forEach((row, idx) => {
      const status = row.sp_id ? '✅' : '❌';
      console.log(`   ${status} Service "${row.title}" | provider_id: ${row.provider_id} | Provider: ${row.business_name || 'NULL'}`);
    });
    
    // Step 3: Drop old foreign key constraint
    console.log('\n🔒 Step 3: Dropping old foreign key constraint...');
    const dropConstraint = await productionPool.query(`
      ALTER TABLE services
      DROP CONSTRAINT IF EXISTS services_provider_id_fkey
    `);
    console.log('   ✅ Old constraint dropped\n');
    
    // Step 4: Add correct foreign key constraint
    console.log('🔗 Step 4: Adding correct foreign key constraint...');
    const addConstraint = await productionPool.query(`
      ALTER TABLE services
      ADD CONSTRAINT services_provider_id_fkey
      FOREIGN KEY (provider_id)
      REFERENCES service_providers(id)
      ON DELETE CASCADE
    `);
    console.log('   ✅ New constraint added\n');
    
    // Commit transaction
    await productionPool.query('COMMIT');
    console.log('✅ Transaction committed\n');
    
    console.log('='.repeat(80));
    console.log('✅ FIX COMPLETE!');
    console.log('   - Services now correctly reference service_providers.id');
    console.log('   - Foreign key constraint updated');
    console.log('='.repeat(80));
    
  } catch (error) {
    await productionPool.query('ROLLBACK');
    console.error('\n❌ Error - Transaction rolled back:', error.message);
    console.error(error.stack);
  } finally {
    await productionPool.end();
  }
}

fixProviderForeignKey();

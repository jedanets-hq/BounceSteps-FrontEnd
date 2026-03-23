const { Pool } = require('./backend/node_modules/pg');

const productionPool = new Pool({
  connectionString: 'postgresql://isafarimasterorg_user:IuNv7yEfLRiDQL96cgmsxr2751MiBjsq@dpg-d5nhs5t6ubrc73asfksg-a.frankfurt-postgres.render.com/isafarimasterorg',
  ssl: {
    rejectUnauthorized: false
  }
});

async function diagnoseProviderIssue() {
  console.log('🔍 DIAGNOSING PROVIDER-SERVICE CONNECTION ISSUE\n');
  console.log('='.repeat(80));
  
  try {
    await productionPool.query('SELECT 1');
    console.log('✅ Connected\n');
    
    // Check services table structure
    console.log('📋 SERVICES TABLE STRUCTURE:');
    const tableInfo = await productionPool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'services'
      ORDER BY ordinal_position
    `);
    tableInfo.rows.forEach(col => {
      console.log(`   ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
    });
    
    // Check all services with their provider_id
    console.log('\n🎯 ALL SERVICES WITH PROVIDER_ID:');
    const allServices = await productionPool.query(`
      SELECT id, title, provider_id, created_at
      FROM services
      ORDER BY created_at DESC
    `);
    console.log(`   Total: ${allServices.rows.length}\n`);
    allServices.rows.forEach((svc, idx) => {
      console.log(`     ${idx + 1}. ID: ${svc.id} | "${svc.title}" | provider_id: ${svc.provider_id} | Created: ${svc.created_at}`);
    });
    
    // Check service_providers
    console.log('\n🏢 ALL SERVICE PROVIDERS:');
    const allProviders = await productionPool.query(`
      SELECT id, user_id, business_name, created_at
      FROM service_providers
      ORDER BY created_at DESC
    `);
    console.log(`   Total: ${allProviders.rows.length}\n`);
    allProviders.rows.forEach((prov, idx) => {
      console.log(`     ${idx + 1}. ID: ${prov.id} | user_id: ${prov.user_id} | "${prov.business_name}" | Created: ${prov.created_at}`);
    });
    
    // Try to match services to providers
    console.log('\n🔗 MATCHING SERVICES TO PROVIDERS:');
    const matched = await productionPool.query(`
      SELECT 
        s.id as service_id,
        s.title,
        s.provider_id,
        sp.id as actual_provider_id,
        sp.business_name,
        sp.user_id
      FROM services s
      LEFT JOIN service_providers sp ON s.provider_id = sp.id
      ORDER BY s.created_at DESC
    `);
    matched.rows.forEach((row, idx) => {
      const status = row.actual_provider_id ? '✅ MATCHED' : '❌ ORPHAN';
      console.log(`     ${idx + 1}. ${status} | Service: "${row.title}" | provider_id: ${row.provider_id} | Provider: ${row.business_name || 'NULL'}`);
    });
    
    // Check if there are foreign key constraints
    console.log('\n🔒 FOREIGN KEY CONSTRAINTS ON SERVICES:');
    const constraints = await productionPool.query(`
      SELECT
        tc.constraint_name,
        tc.table_name,
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name
      FROM information_schema.table_constraints AS tc
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
      WHERE tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_name = 'services'
    `);
    
    if (constraints.rows.length > 0) {
      constraints.rows.forEach(c => {
        console.log(`   ${c.column_name} -> ${c.foreign_table_name}.${c.foreign_column_name}`);
      });
    } else {
      console.log('   ⚠️  NO FOREIGN KEY CONSTRAINTS FOUND!');
    }
    
    console.log('\n' + '='.repeat(80));
    console.log('📊 DIAGNOSIS:');
    const orphanCount = matched.rows.filter(r => !r.actual_provider_id).length;
    if (orphanCount > 0) {
      console.log(`   ❌ ${orphanCount} services have invalid provider_id values`);
      console.log('   💡 These services need to be linked to existing providers');
    } else {
      console.log('   ✅ All services are properly linked to providers');
    }
    console.log('='.repeat(80));
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error.stack);
  } finally {
    await productionPool.end();
  }
}

diagnoseProviderIssue();

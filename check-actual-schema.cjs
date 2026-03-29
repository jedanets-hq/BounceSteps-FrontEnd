const { Pool } = require('./backend/node_modules/pg');

const productionPool = new Pool({
  connectionString: 'postgresql://isafarimasterorg_user:IuNv7yEfLRiDQL96cgmsxr2751MiBjsq@dpg-d5nhs5t6ubrc73asfksg-a.frankfurt-postgres.render.com/isafarimasterorg',
  ssl: {
    rejectUnauthorized: false
  }
});

async function checkSchema() {
  console.log('🔍 CHECKING ACTUAL DATABASE SCHEMA\n');
  
  try {
    // Check service_providers columns
    console.log('📋 SERVICE_PROVIDERS TABLE COLUMNS:');
    const spColumns = await productionPool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'service_providers'
      ORDER BY ordinal_position
    `);
    spColumns.rows.forEach(col => {
      console.log(`   - ${col.column_name} (${col.data_type})`);
    });
    
    // Check services columns
    console.log('\n📋 SERVICES TABLE COLUMNS:');
    const servicesColumns = await productionPool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'services'
      ORDER BY ordinal_position
    `);
    servicesColumns.rows.forEach(col => {
      console.log(`   - ${col.column_name} (${col.data_type})`);
    });
    
    // Now get actual data
    console.log('\n\n🏢 ACTUAL SERVICE_PROVIDERS DATA:');
    const providers = await productionPool.query(`
      SELECT * FROM service_providers LIMIT 5
    `);
    console.log(`   Found ${providers.rows.length} providers`);
    providers.rows.forEach((p, idx) => {
      console.log(`\n   Provider ${idx + 1}:`);
      Object.keys(p).forEach(key => {
        console.log(`     ${key}: ${p[key]}`);
      });
    });
    
    // Get actual services
    console.log('\n\n🎯 ACTUAL SERVICES DATA:');
    const services = await productionPool.query(`
      SELECT * FROM services LIMIT 5
    `);
    console.log(`   Found ${services.rows.length} services`);
    services.rows.forEach((s, idx) => {
      console.log(`\n   Service ${idx + 1}:`);
      Object.keys(s).forEach(key => {
        console.log(`     ${key}: ${s[key]}`);
      });
    });
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
  } finally {
    await productionPool.end();
  }
}

checkSchema();

const { Client } = require('pg');

async function checkAllTravelers() {
  const client = new Client({
    connectionString: 'postgresql://postgres:@Jctnftr01@localhost:5432/isafari_db'
  });
  
  try {
    await client.connect();
    console.log('✅ Connected to database\n');
    
    console.log('🔍 Checking for ALL travelers in service_providers table...\n');
    
    // Find all travelers with provider records
    const result = await client.query(`
      SELECT 
        sp.id as provider_id,
        sp.business_name,
        u.id as user_id,
        u.email,
        u.first_name,
        u.last_name,
        u.user_type
      FROM service_providers sp
      JOIN users u ON sp.user_id = u.id
      WHERE u.user_type != 'service_provider'
      ORDER BY sp.id
    `);
    
    if (result.rows.length === 0) {
      console.log('✅ No travelers found in service_providers table!');
      console.log('   Database is clean. Badge Management should show only service providers.');
      await client.end();
      return;
    }
    
    console.log(`❌ Found ${result.rows.length} traveler(s) in service_providers table:\n`);
    result.rows.forEach((row, index) => {
      console.log(`${index + 1}. Provider ID: ${row.provider_id}`);
      console.log(`   User: ${row.email} (${row.user_type})`);
      console.log(`   Name: ${row.first_name} ${row.last_name}`);
      console.log(`   Business: ${row.business_name || 'N/A'}`);
      console.log('');
    });
    
    console.log('💡 To clean up these records, run: node fix-badge-management-travelers.cjs');
    
    await client.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
    await client.end();
    process.exit(1);
  }
}

checkAllTravelers();

const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://postgres:@Jctnftr01@localhost:5432/isafari_db',
  ssl: false
});

async function checkForeignKeys() {
  const client = await pool.connect();
  
  try {
    console.log('🔍 Checking foreign key constraints...\n');
    
    // Check bookings table foreign keys
    const fkCheck = await client.query(`
      SELECT
        tc.table_name,
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name,
        tc.constraint_name
      FROM information_schema.table_constraints AS tc
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
        AND ccu.table_schema = tc.table_schema
      WHERE tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_name = 'bookings'
    `);
    
    console.log('Foreign keys on bookings table:');
    fkCheck.rows.forEach(fk => {
      console.log(`  ${fk.column_name} -> ${fk.foreign_table_name}.${fk.foreign_column_name}`);
      console.log(`    Constraint: ${fk.constraint_name}`);
    });
    
    console.log('\n🔍 Checking service_providers table data...\n');
    const spCheck = await client.query(`
      SELECT id, user_id, business_name
      FROM service_providers
      ORDER BY id
    `);
    
    console.log('service_providers records:');
    spCheck.rows.forEach(sp => {
      console.log(`  ID: ${sp.id}, User ID: ${sp.user_id}, Business: ${sp.business_name}`);
    });
    
    console.log('\n🔍 Checking if provider_id=5 exists...\n');
    const providerCheck = await client.query(`
      SELECT id, user_id, business_name
      FROM service_providers
      WHERE id = 5
    `);
    
    if (providerCheck.rows.length > 0) {
      console.log('✅ Provider ID 5 exists:', providerCheck.rows[0]);
    } else {
      console.log('❌ Provider ID 5 does NOT exist in service_providers table');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

checkForeignKeys();

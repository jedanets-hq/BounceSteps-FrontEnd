const { Pool } = require('pg');

// Production database connection
const pool = new Pool({
  connectionString: 'postgresql://isafarimasterorg_user:IuNv7yEfLRiDQL96cgmsxr2751MiBjsq@dpg-d5nhs5t6ubrc73asfksg-a.frankfurt-postgres.render.com/isafarimasterorg',
  ssl: {
    rejectUnauthorized: false
  }
});

async function addServicesColumns() {
  const client = await pool.connect();
  
  try {
    console.log('🔄 Adding missing columns to services table...');
    
    await client.query('BEGIN');
    
    // Check and add columns one by one
    const columnsToAdd = [
      { name: 'duration', type: 'INTEGER', default: null },
      { name: 'max_participants', type: 'INTEGER', default: null },
      { name: 'region', type: 'VARCHAR(100)', default: "''" },
      { name: 'district', type: 'VARCHAR(100)', default: "''" },
      { name: 'area', type: 'VARCHAR(100)', default: "''" },
      { name: 'country', type: 'VARCHAR(100)', default: "'Tanzania'" },
      { name: 'amenities', type: 'JSONB', default: "'[]'::jsonb" },
      { name: 'payment_methods', type: 'JSONB', default: "'{}'::jsonb" },
      { name: 'contact_info', type: 'JSONB', default: "'{}'::jsonb" },
      { name: 'is_active', type: 'BOOLEAN', default: 'true' }
    ];
    
    for (const column of columnsToAdd) {
      // Check if column exists
      const checkResult = await client.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'services' AND column_name = $1
      `, [column.name]);
      
      if (checkResult.rows.length === 0) {
        console.log(`   ➕ Adding column: ${column.name}`);
        await client.query(`
          ALTER TABLE services 
          ADD COLUMN ${column.name} ${column.type} DEFAULT ${column.default}
        `);
      } else {
        console.log(`   ✅ Column ${column.name} already exists`);
      }
    }
    
    // Create indexes for new columns
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_services_region ON services(region);
      CREATE INDEX IF NOT EXISTS idx_services_district ON services(district);
      CREATE INDEX IF NOT EXISTS idx_services_is_active ON services(is_active);
    `);
    
    await client.query('COMMIT');
    console.log('✅ Services table columns updated successfully!');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error adding services columns:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Run if called directly
if (require.main === module) {
  addServicesColumns()
    .then(() => {
      console.log('Migration completed successfully');
      pool.end();
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration failed:', error);
      pool.end();
      process.exit(1);
    });
}

module.exports = addServicesColumns;

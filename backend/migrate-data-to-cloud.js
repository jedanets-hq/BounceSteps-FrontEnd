const { Pool } = require('pg');

// Local database connection
const localPool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'isafari_db',
  user: 'postgres',
  password: '@Jctnftr01',
});

// Cloud SQL database connection
const cloudPool = new Pool({
  host: '34.42.58.123',
  port: 5432,
  database: 'bouncesteps-db',
  user: 'postgres',
  password: '@JedaNets01',
});

async function migrateData() {
  const localClient = await localPool.connect();
  const cloudClient = await cloudPool.connect();
  
  try {
    console.log('🚀 Starting data migration from local to Cloud SQL...\n');
    
    // Order matters due to foreign key constraints
    const tablesToMigrate = [
      'users',
      'service_providers',
      'services',
      'bookings',
      'cart',
      'favorites',
      'plans',
      'traveler_stories',
      'multi_trip_plans',
      'reviews',
      'messages',
      'provider_followers',
      'provider_badges',
      'admin_users',
      'admin_audit_log',
      'admin_payment_accounts',
      'promotion_payments',
      'promotion_pricing'
    ];
    
    let totalMigrated = 0;
    
    for (const tableName of tablesToMigrate) {
      try {
        // Check if table exists in local
        const checkLocal = await localClient.query(`
          SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = $1
          )
        `, [tableName]);
        
        if (!checkLocal.rows[0].exists) {
          console.log(`⚠️  Skipping ${tableName} (not in local database)`);
          continue;
        }
        
        // Get data from local
        const localData = await localClient.query(`SELECT * FROM ${tableName}`);
        
        if (localData.rows.length === 0) {
          console.log(`⏭️  Skipping ${tableName} (no data)`);
          continue;
        }
        
        console.log(`📋 Migrating ${tableName} (${localData.rows.length} rows)...`);
        
        // Clear existing data in cloud (optional - comment out if you want to keep existing data)
        await cloudClient.query(`TRUNCATE TABLE ${tableName} CASCADE`);
        
        // Get column names
        const columns = Object.keys(localData.rows[0]);
        const columnNames = columns.join(', ');
        const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');
        
        // Insert each row
        let insertedCount = 0;
        for (const row of localData.rows) {
          const values = columns.map(col => row[col]);
          
          try {
            await cloudClient.query(
              `INSERT INTO ${tableName} (${columnNames}) VALUES (${placeholders})`,
              values
            );
            insertedCount++;
          } catch (insertError) {
            console.log(`   ⚠️  Error inserting row: ${insertError.message}`);
          }
        }
        
        // Reset sequence for serial columns
        try {
          await cloudClient.query(`
            SELECT setval(pg_get_serial_sequence('${tableName}', 'id'), 
              COALESCE((SELECT MAX(id) FROM ${tableName}), 1), 
              true
            )
          `);
        } catch (seqError) {
          // Table might not have an id column, that's okay
        }
        
        console.log(`   ✅ Migrated ${insertedCount}/${localData.rows.length} rows\n`);
        totalMigrated += insertedCount;
        
      } catch (tableError) {
        console.log(`   ❌ Error with ${tableName}: ${tableError.message}\n`);
      }
    }
    
    console.log(`\n🎉 Migration completed!`);
    console.log(`📊 Total rows migrated: ${totalMigrated}`);
    
  } catch (error) {
    console.error('❌ Migration error:', error.message);
  } finally {
    localClient.release();
    cloudClient.release();
    await localPool.end();
    await cloudPool.end();
  }
}

migrateData();

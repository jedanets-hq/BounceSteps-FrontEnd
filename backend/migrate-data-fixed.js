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

// Helper function to convert values for PostgreSQL
function convertValue(value, columnType) {
  if (value === null || value === undefined) {
    return null;
  }
  
  // Handle JSON/JSONB columns
  if (columnType === 'json' || columnType === 'jsonb') {
    if (typeof value === 'string') {
      try {
        // Try to parse if it's a string
        JSON.parse(value);
        return value;
      } catch {
        // If it's not valid JSON, wrap it
        return JSON.stringify(value);
      }
    }
    return JSON.stringify(value);
  }
  
  return value;
}

async function migrateDataFixed() {
  const localClient = await localPool.connect();
  const cloudClient = await cloudPool.connect();
  
  try {
    console.log('🚀 Starting improved data migration from local to Cloud SQL...\n');
    
    // Order matters due to foreign key constraints
    const tablesToMigrate = [
      'users',
      'admin_users',
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
      'admin_audit_log'
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
        
        // Get column types from cloud database
        const columnInfo = await cloudClient.query(`
          SELECT column_name, data_type 
          FROM information_schema.columns 
          WHERE table_name = $1
        `, [tableName]);
        
        const columnTypes = {};
        columnInfo.rows.forEach(row => {
          columnTypes[row.column_name] = row.data_type;
        });
        
        // Clear existing data in cloud
        await cloudClient.query(`TRUNCATE TABLE ${tableName} RESTART IDENTITY CASCADE`);
        
        // Get column names
        const columns = Object.keys(localData.rows[0]);
        const columnNames = columns.join(', ');
        const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');
        
        // Insert each row
        let insertedCount = 0;
        for (const row of localData.rows) {
          const values = columns.map(col => convertValue(row[col], columnTypes[col]));
          
          try {
            await cloudClient.query(
              `INSERT INTO ${tableName} (${columnNames}) VALUES (${placeholders})`,
              values
            );
            insertedCount++;
          } catch (insertError) {
            console.log(`   ⚠️  Error inserting row (id: ${row.id || 'unknown'}): ${insertError.message}`);
          }
        }
        
        // Reset sequence for serial columns
        try {
          const maxIdResult = await cloudClient.query(`SELECT MAX(id) as max_id FROM ${tableName}`);
          const maxId = maxIdResult.rows[0].max_id;
          
          if (maxId) {
            await cloudClient.query(`
              SELECT setval(pg_get_serial_sequence('${tableName}', 'id'), $1, true)
            `, [maxId]);
          }
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
    
    // Verify migration
    console.log('\n🔍 Verifying migration...\n');
    
    for (const tableName of tablesToMigrate) {
      try {
        const cloudCount = await cloudClient.query(`SELECT COUNT(*) as count FROM ${tableName}`);
        if (parseInt(cloudCount.rows[0].count) > 0) {
          console.log(`✅ ${tableName}: ${cloudCount.rows[0].count} rows`);
        }
      } catch (err) {
        // Skip if table doesn't exist
      }
    }
    
  } catch (error) {
    console.error('❌ Migration error:', error.message);
  } finally {
    localClient.release();
    cloudClient.release();
    await localPool.end();
    await cloudPool.end();
  }
}

migrateDataFixed();

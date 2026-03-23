/**
 * Emergency database schema fix
 * Run this if you're getting "column sp.business_phone does not exist" errors
 * 
 * Usage: node fix-database-schema.js
 */

const { pool } = require('./config/postgresql');

async function fixDatabaseSchema() {
  const client = await pool.connect();
  
  try {
    console.log('🔧 Starting database schema fix...\n');
    
    // Check and add business_phone column
    console.log('📋 Checking business_phone column...');
    const phoneCheck = await client.query(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'service_providers' AND column_name = 'business_phone'
    `);
    
    if (phoneCheck.rows.length === 0) {
      console.log('➕ Adding business_phone column...');
      await client.query(`
        ALTER TABLE service_providers 
        ADD COLUMN business_phone VARCHAR(50)
      `);
      console.log('✅ business_phone column added\n');
    } else {
      console.log('✅ business_phone column already exists\n');
    }
    
    // Check and add business_email column
    console.log('📋 Checking business_email column...');
    const emailCheck = await client.query(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'service_providers' AND column_name = 'business_email'
    `);
    
    if (emailCheck.rows.length === 0) {
      console.log('➕ Adding business_email column...');
      await client.query(`
        ALTER TABLE service_providers 
        ADD COLUMN business_email VARCHAR(255)
      `);
      console.log('✅ business_email column added\n');
    } else {
      console.log('✅ business_email column already exists\n');
    }
    
    // Verify the fix
    console.log('🔍 Verifying schema...');
    const verifyResult = await client.query(`
      SELECT 
        column_name, 
        data_type, 
        character_maximum_length
      FROM information_schema.columns 
      WHERE table_name = 'service_providers' 
        AND column_name IN ('business_phone', 'business_email')
      ORDER BY column_name
    `);
    
    console.log('\n📊 Current schema:');
    console.table(verifyResult.rows);
    
    console.log('\n✅ Database schema fix completed successfully!');
    console.log('🔄 Please restart your backend server for changes to take effect.\n');
    
  } catch (error) {
    console.error('❌ Error fixing database schema:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the fix
fixDatabaseSchema()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Failed to fix database schema:', error);
    process.exit(1);
  });

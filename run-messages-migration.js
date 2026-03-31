const { pool } = require('./models/pg');
const fs = require('fs');
const path = require('path');

async function runMessagesMigration() {
  try {
    console.log('🔄 Running messages table migration...');
    
    // Read the migration SQL file
    const migrationSQL = fs.readFileSync(
      path.join(__dirname, 'migrations', 'create-messages-table.sql'),
      'utf8'
    );
    
    // Execute the migration
    await pool.query(migrationSQL);
    
    console.log('✅ Messages table migration completed successfully!');
    
    // Verify the table was created
    const result = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'messages'
    `);
    
    if (result.rows.length > 0) {
      console.log('✅ Messages table exists in database');
      
      // Check table structure
      const columns = await pool.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'messages'
        ORDER BY ordinal_position
      `);
      
      console.log('📋 Messages table structure:');
      columns.rows.forEach(col => {
        console.log(`   - ${col.column_name}: ${col.data_type}`);
      });
    } else {
      console.log('❌ Messages table was not created');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error running messages migration:', error);
    process.exit(1);
  }
}

runMessagesMigration();

const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function fixConstraint() {
  const client = await pool.connect();
  
  try {
    console.log('🔧 FIXING BOOKINGS FOREIGN KEY CONSTRAINT\n');
    
    await client.query('BEGIN');
    
    // Check current constraint
    const currentConstraint = await client.query(`
      SELECT 
        tc.constraint_name,
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name
      FROM information_schema.table_constraints AS tc
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
      WHERE tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_name = 'bookings'
        AND kcu.column_name = 'provider_id'
    `);
    
    if (currentConstraint.rows.length > 0) {
      const constraint = currentConstraint.rows[0];
      console.log('❌ CURRENT CONSTRAINT (WRONG):');
      console.log(`   ${constraint.constraint_name}:`);
      console.log(`   bookings.${constraint.column_name} -> ${constraint.foreign_table_name}.${constraint.foreign_column_name}`);
      
      // Drop the wrong constraint
      console.log(`\n🗑️  Dropping constraint: ${constraint.constraint_name}`);
      await client.query(`
        ALTER TABLE bookings DROP CONSTRAINT ${constraint.constraint_name}
      `);
      console.log('   ✅ Constraint dropped');
    }
    
    // Add the correct constraint
    console.log('\n✅ Adding CORRECT constraint:');
    console.log('   bookings.provider_id -> service_providers.user_id');
    
    await client.query(`
      ALTER TABLE bookings 
      ADD CONSTRAINT bookings_provider_id_fkey 
      FOREIGN KEY (provider_id) 
      REFERENCES service_providers(user_id) 
      ON DELETE CASCADE
    `);
    
    console.log('   ✅ Correct constraint added');
    
    await client.query('COMMIT');
    
    // Verify the fix
    const verifyConstraint = await client.query(`
      SELECT 
        tc.constraint_name,
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name
      FROM information_schema.table_constraints AS tc
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
      WHERE tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_name = 'bookings'
        AND kcu.column_name = 'provider_id'
    `);
    
    console.log('\n✅ VERIFIED CONSTRAINT:');
    if (verifyConstraint.rows.length > 0) {
      const constraint = verifyConstraint.rows[0];
      console.log(`   ${constraint.constraint_name}:`);
      console.log(`   bookings.${constraint.column_name} -> ${constraint.foreign_table_name}.${constraint.foreign_column_name}`);
    }
    
    console.log('\n✅ CONSTRAINT FIX COMPLETE');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error:', error.message);
    console.error(error.stack);
  } finally {
    client.release();
    await pool.end();
  }
}

fixConstraint();

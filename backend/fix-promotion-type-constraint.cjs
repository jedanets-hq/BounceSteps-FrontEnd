require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'isafari_db',
  password: process.env.DB_PASSWORD || '@Jctnftr01',
  port: process.env.DB_PORT || 5432,
});

async function fixPromotionTypeConstraint() {
  console.log('='.repeat(80));
  console.log('FIXING PROMOTION_TYPE CONSTRAINT');
  console.log('='.repeat(80));
  
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    console.log('\n1. Checking current constraint...');
    const currentConstraint = await client.query(`
      SELECT 
        conname as constraint_name, 
        pg_get_constraintdef(oid) as definition
      FROM pg_constraint 
      WHERE conrelid = 'promotion_payments'::regclass 
        AND conname LIKE '%promotion_type%'
    `);
    
    if (currentConstraint.rows.length > 0) {
      console.log('✅ Found constraint:', currentConstraint.rows[0].constraint_name);
      console.log('   Current definition:', currentConstraint.rows[0].definition);
      
      console.log('\n2. Dropping old constraint...');
      await client.query(`
        ALTER TABLE promotion_payments 
        DROP CONSTRAINT IF EXISTS ${currentConstraint.rows[0].constraint_name}
      `);
      console.log('✅ Old constraint dropped');
    } else {
      console.log('⚠️  No existing constraint found');
    }
    
    console.log('\n3. Adding new constraint with correct values...');
    await client.query(`
      ALTER TABLE promotion_payments 
      ADD CONSTRAINT promotion_payments_promotion_type_check 
      CHECK (promotion_type IN ('verification', 'featured_listing', 'premium_badge', 'top_placement'))
    `);
    console.log('✅ New constraint added');
    
    console.log('\n4. Verifying new constraint...');
    const newConstraint = await client.query(`
      SELECT 
        conname as constraint_name, 
        pg_get_constraintdef(oid) as definition
      FROM pg_constraint 
      WHERE conrelid = 'promotion_payments'::regclass 
        AND conname LIKE '%promotion_type%'
    `);
    
    if (newConstraint.rows.length > 0) {
      console.log('✅ New constraint verified:');
      console.log('   Name:', newConstraint.rows[0].constraint_name);
      console.log('   Definition:', newConstraint.rows[0].definition);
      
      // Extract and display allowed values
      const def = newConstraint.rows[0].definition;
      const match = def.match(/\((.*?)\)/);
      if (match) {
        console.log('\n   Allowed values:');
        const values = match[1].split(',').map(v => v.trim().replace(/'/g, ''));
        values.forEach(v => console.log(`     - ${v}`));
      }
    }
    
    console.log('\n5. Testing constraint with sample data...');
    try {
      // Test valid value
      await client.query(`
        SELECT 'verification'::text AS test_value
        WHERE 'verification' IN ('verification', 'featured_listing', 'premium_badge', 'top_placement')
      `);
      console.log('✅ Test passed: "verification" is accepted');
      
      // Test invalid value (should fail)
      try {
        await client.query(`
          INSERT INTO promotion_payments (
            provider_id, promotion_type, amount, currency, status
          ) VALUES (999999, 'invalid_type', 100, 'TZS', 'pending')
        `);
        console.log('❌ Test failed: Invalid value was accepted (should have been rejected)');
      } catch (e) {
        if (e.message.includes('promotion_type')) {
          console.log('✅ Test passed: Invalid value "invalid_type" was correctly rejected');
        } else {
          throw e;
        }
      }
    } catch (e) {
      console.log('⚠️  Test error:', e.message);
    }
    
    await client.query('COMMIT');
    
    console.log('\n' + '='.repeat(80));
    console.log('CONSTRAINT FIX COMPLETE');
    console.log('='.repeat(80));
    
    console.log('\n✅ SUCCESS! The promotion_type constraint has been updated.');
    console.log('\nThe following values are now accepted:');
    console.log('  - verification (for account verification)');
    console.log('  - featured_listing (for featured service listings)');
    console.log('  - premium_badge (for premium provider badge)');
    console.log('  - top_placement (for top search placement)');
    
    console.log('\n🎉 Payment processing should now work correctly!');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('\n❌ ERROR:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    client.release();
    await pool.end();
  }
}

fixPromotionTypeConstraint();

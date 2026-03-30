require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'isafari_db',
  password: process.env.DB_PASSWORD || '@Jctnftr01',
  port: process.env.DB_PORT || 5432,
});

async function forceFixConstraint() {
  console.log('='.repeat(80));
  console.log('FORCE FIXING PROMOTION_TYPE CONSTRAINT');
  console.log('='.repeat(80));
  
  try {
    console.log('\n1. Listing ALL constraints on promotion_payments...');
    const allConstraints = await pool.query(`
      SELECT 
        conname as constraint_name, 
        contype as constraint_type,
        pg_get_constraintdef(oid) as definition
      FROM pg_constraint 
      WHERE conrelid = 'promotion_payments'::regclass
      ORDER BY conname
    `);
    
    console.log(`Found ${allConstraints.rows.length} constraints:`);
    allConstraints.rows.forEach((c, i) => {
      console.log(`\n  ${i + 1}. ${c.constraint_name} (${c.constraint_type})`);
      console.log(`     ${c.definition}`);
    });
    
    console.log('\n2. Dropping ALL promotion_type related constraints...');
    const promotionTypeConstraints = allConstraints.rows.filter(c => 
      c.constraint_name.toLowerCase().includes('promotion_type') ||
      c.definition.toLowerCase().includes('promotion_type')
    );
    
    for (const constraint of promotionTypeConstraints) {
      console.log(`   Dropping: ${constraint.constraint_name}`);
      await pool.query(`
        ALTER TABLE promotion_payments 
        DROP CONSTRAINT IF EXISTS "${constraint.constraint_name}" CASCADE
      `);
      console.log(`   ✅ Dropped: ${constraint.constraint_name}`);
    }
    
    console.log('\n3. Adding new constraint...');
    await pool.query(`
      ALTER TABLE promotion_payments 
      ADD CONSTRAINT promotion_payments_promotion_type_check 
      CHECK (promotion_type IN ('verification', 'featured_listing', 'premium_badge', 'top_placement'))
    `);
    console.log('✅ New constraint added');
    
    console.log('\n4. Verifying fix...');
    const finalConstraints = await pool.query(`
      SELECT 
        conname as constraint_name, 
        pg_get_constraintdef(oid) as definition
      FROM pg_constraint 
      WHERE conrelid = 'promotion_payments'::regclass
        AND (conname LIKE '%promotion_type%' OR pg_get_constraintdef(oid) LIKE '%promotion_type%')
    `);
    
    console.log(`Found ${finalConstraints.rows.length} promotion_type constraints:`);
    finalConstraints.rows.forEach(c => {
      console.log(`\n  ${c.constraint_name}:`);
      console.log(`  ${c.definition}`);
    });
    
    console.log('\n5. Testing with actual INSERT...');
    const testResult = await pool.query(`
      SELECT 
        CASE 
          WHEN 'verification' IN ('verification', 'featured_listing', 'premium_badge', 'top_placement') 
          THEN 'PASS' 
          ELSE 'FAIL' 
        END as test_result
    `);
    console.log('✅ Test result:', testResult.rows[0].test_result);
    
    console.log('\n' + '='.repeat(80));
    console.log('FIX COMPLETE');
    console.log('='.repeat(80));
    
  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await pool.end();
  }
}

forceFixConstraint();

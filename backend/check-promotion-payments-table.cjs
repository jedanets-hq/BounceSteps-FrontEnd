require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'isafari_db',
  password: process.env.DB_PASSWORD || '@Jctnftr01',
  port: process.env.DB_PORT || 5432,
});

async function checkTable() {
  try {
    console.log('Checking promotion_payments table...\n');
    
    // Get table structure
    const columns = await pool.query(`
      SELECT 
        column_name, 
        data_type, 
        is_nullable,
        column_default
      FROM information_schema.columns
      WHERE table_name = 'promotion_payments'
      ORDER BY ordinal_position
    `);
    
    console.log('Columns:', columns.rows.length);
    columns.rows.forEach(col => {
      console.log(`  - ${col.column_name} (${col.data_type}) ${col.is_nullable === 'NO' ? 'NOT NULL' : 'NULL'}`);
    });
    
    // Check if promotion_type or payment_type exists
    const hasPromotionType = columns.rows.some(col => col.column_name === 'promotion_type');
    const hasPaymentType = columns.rows.some(col => col.column_name === 'payment_type');
    
    console.log('\nColumn check:');
    console.log('  Has promotion_type:', hasPromotionType);
    console.log('  Has payment_type:', hasPaymentType);
    
    // Get constraints
    const constraints = await pool.query(`
      SELECT 
        conname as constraint_name, 
        pg_get_constraintdef(oid) as definition
      FROM pg_constraint 
      WHERE conrelid = 'promotion_payments'::regclass 
        AND contype = 'c'
    `);
    
    console.log('\nCHECK Constraints:', constraints.rows.length);
    constraints.rows.forEach(row => {
      console.log(`\n  ${row.constraint_name}:`);
      console.log(`  ${row.definition}`);
    });
    
    // Check what values are allowed
    const promotionTypeConstraint = constraints.rows.find(c => 
      c.constraint_name.includes('promotion_type') || c.constraint_name.includes('payment_type')
    );
    
    if (promotionTypeConstraint) {
      console.log('\n⚠️  CONSTRAINT ANALYSIS:');
      const def = promotionTypeConstraint.definition;
      
      // Extract allowed values
      const match = def.match(/ARRAY\[(.*?)\]/);
      if (match) {
        const values = match[1].split(',').map(v => v.trim().replace(/'/g, '').replace(/::character varying/g, ''));
        console.log('  Allowed values in database:');
        values.forEach(v => console.log(`    - ${v}`));
        
        console.log('\n  Expected values in code:');
        console.log('    - verification');
        console.log('    - featured_listing');
        console.log('    - premium_badge');
        console.log('    - top_placement');
        
        const codeValues = ['verification', 'featured_listing', 'premium_badge', 'top_placement'];
        const dbValues = values;
        
        const missing = codeValues.filter(v => !dbValues.includes(v));
        const extra = dbValues.filter(v => !codeValues.includes(v));
        
        if (missing.length > 0) {
          console.log('\n  ❌ Missing in database:', missing.join(', '));
        }
        if (extra.length > 0) {
          console.log('  ⚠️  Extra in database:', extra.join(', '));
        }
        
        if (missing.length === 0 && extra.length === 0) {
          console.log('\n  ✅ Values match!');
        } else {
          console.log('\n  ❌ VALUES MISMATCH - This will cause payment failures!');
        }
      }
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkTable();

const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://postgres:@Jctnftr01@localhost:5432/isafari_db'
});

async function checkPricing() {
  try {
    const result = await pool.query(`
      SELECT * FROM promotion_pricing 
      ORDER BY promotion_type
    `);
    
    console.log('💰 Promotion Pricing:');
    console.log('Total pricing entries:', result.rows.length);
    console.log('');
    
    if (result.rows.length === 0) {
      console.log('❌ NO PROMOTION PRICING FOUND!');
      console.log('This is a problem - system needs pricing to process payments.');
    } else {
      result.rows.forEach((pricing, index) => {
        console.log(`Pricing ${index + 1}:`);
        console.log(`  Type: ${pricing.promotion_type}`);
        console.log(`  Price: ${pricing.currency} ${pricing.price}`);
        console.log(`  Duration: ${pricing.duration_days} days`);
        console.log(`  Description: ${pricing.description}`);
        console.log(`  Is Active: ${pricing.is_active ? '✅ YES' : '❌ NO'}`);
        console.log('');
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkPricing();

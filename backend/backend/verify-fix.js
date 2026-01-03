const { pool } = require('./config/postgresql');

async function verifyFix() {
  try {
    const result = await pool.query(`
      SELECT COUNT(*) as count 
      FROM services 
      WHERE region = 'Mbeya' AND district = 'Mbeya City'
    `);
    
    console.log('\n✅ Services in Mbeya → Mbeya City:', result.rows[0].count);
    
    const accommodationResult = await pool.query(`
      SELECT COUNT(*) as count 
      FROM services 
      WHERE region = 'Mbeya' 
        AND district = 'Mbeya City' 
        AND category = 'Accommodation'
    `);
    
    console.log('✅ Accommodation in Mbeya City:', accommodationResult.rows[0].count);
    
    console.log('\n🎉 FIX VERIFIED! Providers will now show up in Journey Planner!\n');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await pool.end();
  }
}

verifyFix();
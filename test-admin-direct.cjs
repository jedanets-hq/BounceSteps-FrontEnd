const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:@Jctnftr01@localhost:5432/isafari_db'
});

async function testQueries() {
  try {
    console.log('Testing database queries...\n');
    
    // Test 1: Count users
    console.log('1. Testing users count...');
    const usersResult = await pool.query('SELECT COUNT(*) as total FROM users');
    console.log('✅ Users:', usersResult.rows[0]);
    
    // Test 2: Count providers
    console.log('\n2. Testing providers count...');
    const providersResult = await pool.query('SELECT COUNT(*) as total FROM service_providers');
    console.log('✅ Providers:', providersResult.rows[0]);
    
    // Test 3: Count bookings
    console.log('\n3. Testing bookings count...');
    const bookingsResult = await pool.query('SELECT COUNT(*) as total FROM bookings');
    console.log('✅ Bookings:', bookingsResult.rows[0]);
    
    // Test 4: Test FILTER clause
    console.log('\n4. Testing FILTER clause...');
    const currentStartDate = new Date();
    currentStartDate.setDate(currentStartDate.getDate() - 30);
    
    const filterResult = await pool.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE created_at >= $1) as recent
      FROM users
    `, [currentStartDate]);
    console.log('✅ Filter test:', filterResult.rows[0]);
    
    console.log('\n✅ All tests passed!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await pool.end();
  }
}

testQueries();

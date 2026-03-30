const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'isafari_db',
  user: 'postgres',
  password: '@Jctnftr01'
});

async function testDashboardFilters() {
  console.log('🔍 Testing Dashboard Filters...\n');

  try {
    // Test 1: Check if we have data in tables
    console.log('📊 Checking data availability...');
    
    const usersCount = await pool.query('SELECT COUNT(*) FROM users');
    console.log(`✓ Users: ${usersCount.rows[0].count}`);
    
    const providersCount = await pool.query('SELECT COUNT(*) FROM service_providers');
    console.log(`✓ Service Providers: ${providersCount.rows[0].count}`);
    
    const bookingsCount = await pool.query('SELECT COUNT(*) FROM bookings');
    console.log(`✓ Bookings: ${bookingsCount.rows[0].count}`);
    
    // Test 2: Check data with dates
    console.log('\n📅 Checking data with dates...');
    
    const todayUsers = await pool.query(`
      SELECT COUNT(*) FROM users 
      WHERE created_at >= CURRENT_DATE
    `);
    console.log(`✓ Users created today: ${todayUsers.rows[0].count}`);
    
    const last7DaysUsers = await pool.query(`
      SELECT COUNT(*) FROM users 
      WHERE created_at >= NOW() - INTERVAL '7 days'
    `);
    console.log(`✓ Users created in last 7 days: ${last7DaysUsers.rows[0].count}`);
    
    const last30DaysUsers = await pool.query(`
      SELECT COUNT(*) FROM users 
      WHERE created_at >= NOW() - INTERVAL '30 days'
    `);
    console.log(`✓ Users created in last 30 days: ${last30DaysUsers.rows[0].count}`);
    
    const last90DaysUsers = await pool.query(`
      SELECT COUNT(*) FROM users 
      WHERE created_at >= NOW() - INTERVAL '90 days'
    `);
    console.log(`✓ Users created in last 90 days: ${last90DaysUsers.rows[0].count}`);
    
    // Test 3: Check bookings with dates
    console.log('\n📦 Checking bookings with dates...');
    
    const todayBookings = await pool.query(`
      SELECT COUNT(*) FROM bookings 
      WHERE created_at >= CURRENT_DATE
    `);
    console.log(`✓ Bookings created today: ${todayBookings.rows[0].count}`);
    
    const last7DaysBookings = await pool.query(`
      SELECT COUNT(*) FROM bookings 
      WHERE created_at >= NOW() - INTERVAL '7 days'
    `);
    console.log(`✓ Bookings created in last 7 days: ${last7DaysBookings.rows[0].count}`);
    
    const completedBookings = await pool.query(`
      SELECT COUNT(*) FROM bookings 
      WHERE status = 'completed'
    `);
    console.log(`✓ Completed bookings: ${completedBookings.rows[0].count}`);
    
    // Test 4: Check recent data distribution
    console.log('\n📈 Data distribution by date...');
    
    const dateDistribution = await pool.query(`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as count
      FROM users
      WHERE created_at >= NOW() - INTERVAL '30 days'
      GROUP BY DATE(created_at)
      ORDER BY date DESC
      LIMIT 10
    `);
    
    console.log('Recent user registrations:');
    dateDistribution.rows.forEach(row => {
      console.log(`  ${row.date.toISOString().split('T')[0]}: ${row.count} users`);
    });
    
    // Test 5: Test the actual filter logic
    console.log('\n🧪 Testing filter logic...');
    
    const periods = ['today', '7days', '30days', '90days', 'alltime'];
    
    for (const period of periods) {
      let currentStartDate, previousStartDate, previousEndDate;
      
      if (period === 'today') {
        currentStartDate = new Date();
        currentStartDate.setHours(0, 0, 0, 0);
        
        previousStartDate = new Date();
        previousStartDate.setDate(previousStartDate.getDate() - 2);
        previousStartDate.setHours(0, 0, 0, 0);
        
        previousEndDate = new Date();
        previousEndDate.setDate(previousEndDate.getDate() - 1);
        previousEndDate.setHours(0, 0, 0, 0);
        
      } else if (period === 'alltime') {
        currentStartDate = new Date('1970-01-01');
        
        previousStartDate = new Date();
        previousStartDate.setFullYear(previousStartDate.getFullYear() - 2);
        
        previousEndDate = new Date();
        previousEndDate.setFullYear(previousEndDate.getFullYear() - 1);
        
      } else {
        const daysMap = { '7days': 7, '30days': 30, '90days': 90 };
        const days = daysMap[period] || 30;
        
        currentStartDate = new Date();
        currentStartDate.setDate(currentStartDate.getDate() - days);
        
        previousStartDate = new Date();
        previousStartDate.setDate(previousStartDate.getDate() - (days * 2));
        
        previousEndDate = new Date();
        previousEndDate.setDate(previousEndDate.getDate() - days);
      }
      
      const result = await pool.query(`
        SELECT 
          COUNT(*) as total,
          COUNT(*) FILTER (WHERE created_at >= $1) as current_period,
          COUNT(*) FILTER (WHERE created_at >= $2 AND created_at < $3) as previous_period
        FROM users
      `, [currentStartDate, previousStartDate, previousEndDate]);
      
      const current = parseInt(result.rows[0].current_period);
      const previous = parseInt(result.rows[0].previous_period);
      const growth = previous === 0 ? (current > 0 ? 100 : 0) : Math.round(((current - previous) / previous) * 100);
      
      console.log(`\n${period.toUpperCase()}:`);
      console.log(`  Total users: ${result.rows[0].total}`);
      console.log(`  Current period: ${current}`);
      console.log(`  Previous period: ${previous}`);
      console.log(`  Growth: ${growth}%`);
    }
    
    console.log('\n✅ All tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    await pool.end();
  }
}

testDashboardFilters();

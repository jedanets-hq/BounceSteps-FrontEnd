const { Pool } = require('pg');

// Database configuration
const pool = new Pool({
  connectionString: 'postgresql://isafari_db_user:@Jctnftr01@dpg-cu0rvf08fa8c73a5rvog-a.oregon-postgres.render.com/isafari_db',
  ssl: {
    rejectUnauthorized: false
  }
});

async function testProviderAnalytics() {
  try {
    console.log('🔍 Testing Provider Analytics Endpoint Logic...\n');
    
    // Get a service provider
    const providerResult = await pool.query(`
      SELECT sp.id, sp.user_id, sp.business_name, u.email
      FROM service_providers sp
      JOIN users u ON sp.user_id = u.id
      LIMIT 1
    `);
    
    if (providerResult.rows.length === 0) {
      console.log('❌ No service providers found in database');
      return;
    }
    
    const provider = providerResult.rows[0];
    console.log('✅ Testing with provider:', {
      id: provider.id,
      business_name: provider.business_name,
      email: provider.email
    });
    console.log('');
    
    // Calculate date range (30 days)
    const now = new Date();
    const startDate = new Date();
    startDate.setDate(now.getDate() - 30);
    const previousStartDate = new Date();
    previousStartDate.setDate(now.getDate() - 60);
    
    console.log('📅 Date Range:', {
      current_period: `${startDate.toISOString().split('T')[0]} to ${now.toISOString().split('T')[0]}`,
      previous_period: `${previousStartDate.toISOString().split('T')[0]} to ${startDate.toISOString().split('T')[0]}`
    });
    console.log('');
    
    // Get current period bookings
    const currentBookings = await pool.query(`
      SELECT 
        b.*,
        u.first_name,
        u.last_name,
        u.country,
        s.title as service_title,
        s.category as service_category
      FROM bookings b
      LEFT JOIN users u ON b.user_id = u.id
      LEFT JOIN services s ON b.service_id = s.id
      WHERE b.provider_id = $1 
        AND b.created_at >= $2
        AND b.status != 'cancelled'
      ORDER BY b.created_at DESC
    `, [provider.id, startDate]);
    
    console.log(`📊 Current Period Bookings: ${currentBookings.rows.length}`);
    
    if (currentBookings.rows.length > 0) {
      console.log('Sample bookings:');
      currentBookings.rows.slice(0, 3).forEach((b, i) => {
        console.log(`  ${i + 1}. ${b.service_title} - $${b.total_amount} - ${b.status}`);
      });
    }
    console.log('');
    
    // Get previous period bookings
    const previousBookings = await pool.query(`
      SELECT 
        COUNT(*) as count,
        COALESCE(SUM(total_amount), 0) as revenue
      FROM bookings
      WHERE provider_id = $1 
        AND created_at >= $2 
        AND created_at < $3
        AND status != 'cancelled'
    `, [provider.id, previousStartDate, startDate]);
    
    console.log('📊 Previous Period:', {
      bookings: previousBookings.rows[0].count,
      revenue: `$${previousBookings.rows[0].revenue}`
    });
    console.log('');
    
    // Calculate metrics
    const totalRevenue = currentBookings.rows.reduce((sum, b) => sum + parseFloat(b.total_amount || 0), 0);
    const totalBookings = currentBookings.rows.length;
    const uniqueCustomers = new Set(currentBookings.rows.map(b => b.user_id)).size;
    
    // Calculate growth
    const previousRevenue = parseFloat(previousBookings.rows[0]?.revenue || 0);
    const previousBookingCount = parseInt(previousBookings.rows[0]?.count || 0);
    
    const revenueGrowth = previousRevenue > 0 
      ? Math.round(((totalRevenue - previousRevenue) / previousRevenue) * 100)
      : 0;
    const bookingsGrowth = previousBookingCount > 0
      ? Math.round(((totalBookings - previousBookingCount) / previousBookingCount) * 100)
      : 0;
    
    console.log('📈 Analytics Summary:');
    console.log('  Revenue:');
    console.log(`    Total: $${Math.round(totalRevenue * 100) / 100}`);
    console.log(`    Growth: ${revenueGrowth}% (${revenueGrowth > 0 ? '↑' : revenueGrowth < 0 ? '↓' : '→'})`);
    console.log('  Bookings:');
    console.log(`    Total: ${totalBookings}`);
    console.log(`    Growth: ${bookingsGrowth}% (${bookingsGrowth > 0 ? '↑' : bookingsGrowth < 0 ? '↓' : '→'})`);
    console.log('  Customers:');
    console.log(`    Unique: ${uniqueCustomers}`);
    console.log('');
    
    // Get top services
    const serviceStats = {};
    currentBookings.rows.forEach(booking => {
      const serviceId = booking.service_id;
      const serviceName = booking.service_title || 'Unknown Service';
      
      if (!serviceStats[serviceId]) {
        serviceStats[serviceId] = {
          name: serviceName,
          bookings: 0,
          revenue: 0
        };
      }
      
      serviceStats[serviceId].bookings += 1;
      serviceStats[serviceId].revenue += parseFloat(booking.total_amount || 0);
    });
    
    const topServices = Object.values(serviceStats)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
    
    console.log('🏆 Top Services:');
    if (topServices.length > 0) {
      topServices.forEach((s, i) => {
        console.log(`  ${i + 1}. ${s.name}`);
        console.log(`     Bookings: ${s.bookings} | Revenue: $${Math.round(s.revenue * 100) / 100}`);
      });
    } else {
      console.log('  No services data');
    }
    console.log('');
    
    // Get monthly data
    const monthlyStats = {};
    currentBookings.rows.forEach(booking => {
      const date = new Date(booking.created_at);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthName = date.toLocaleDateString('en-US', { month: 'short' });
      
      if (!monthlyStats[monthKey]) {
        monthlyStats[monthKey] = {
          month: monthName,
          revenue: 0,
          bookings: 0
        };
      }
      
      monthlyStats[monthKey].revenue += parseFloat(booking.total_amount || 0);
      monthlyStats[monthKey].bookings += 1;
    });
    
    const monthlyData = Object.values(monthlyStats).slice(-6);
    
    console.log('📅 Monthly Breakdown:');
    if (monthlyData.length > 0) {
      monthlyData.forEach(m => {
        console.log(`  ${m.month}: $${Math.round(m.revenue * 100) / 100} (${m.bookings} bookings)`);
      });
    } else {
      console.log('  No monthly data');
    }
    console.log('');
    
    // Get top countries
    const countryStats = {};
    currentBookings.rows.forEach(booking => {
      const country = booking.country || 'Unknown';
      countryStats[country] = (countryStats[country] || 0) + 1;
    });
    
    const topCountries = Object.entries(countryStats)
      .map(([country, count]) => ({
        country,
        count,
        percentage: Math.round((count / totalBookings) * 100)
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
    
    console.log('🌍 Top Countries:');
    if (topCountries.length > 0) {
      topCountries.forEach(c => {
        console.log(`  ${c.country}: ${c.count} customers (${c.percentage}%)`);
      });
    } else {
      console.log('  No country data');
    }
    console.log('');
    
    console.log('✅ Analytics endpoint logic test completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error);
  } finally {
    await pool.end();
  }
}

testProviderAnalytics();

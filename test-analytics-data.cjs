const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://isafari_user:@Jctnftr01@localhost:5432/isafari_db'
});

async function testAnalyticsData() {
  try {
    console.log('🔍 Testing Analytics Data...\n');
    
    // Get all service providers
    const providersResult = await pool.query(`
      SELECT sp.id, sp.user_id, sp.business_name, u.email
      FROM service_providers sp
      JOIN users u ON sp.user_id = u.id
      WHERE u.is_active = true
      ORDER BY sp.id
    `);
    
    console.log('📊 Service Providers:', providersResult.rows.length);
    providersResult.rows.forEach(p => {
      console.log(`  - ID: ${p.id}, User ID: ${p.user_id}, Name: ${p.business_name}`);
    });
    
    console.log('\n');
    
    // Get bookings for each provider
    for (const provider of providersResult.rows) {
      console.log(`\n📦 Bookings for ${provider.business_name} (provider_id: ${provider.id}):`);
      
      const bookingsResult = await pool.query(`
        SELECT 
          b.id,
          b.status,
          b.total_amount,
          b.created_at,
          s.title as service_title
        FROM bookings b
        LEFT JOIN services s ON b.service_id = s.id
        WHERE b.provider_id = $1
        ORDER BY b.created_at DESC
      `, [provider.id]);
      
      console.log(`  Total bookings: ${bookingsResult.rows.length}`);
      
      if (bookingsResult.rows.length > 0) {
        bookingsResult.rows.forEach(b => {
          console.log(`    - Booking #${b.id}: ${b.service_title} - ${b.status} - TZS ${b.total_amount} (${new Date(b.created_at).toLocaleDateString()})`);
        });
        
        // Calculate totals
        const totalRevenue = bookingsResult.rows
          .filter(b => b.status !== 'cancelled')
          .reduce((sum, b) => sum + parseFloat(b.total_amount || 0), 0);
        
        console.log(`  💰 Total Revenue: TZS ${totalRevenue}`);
      }
    }
    
    await pool.end();
    console.log('\n✅ Test complete');
  } catch (error) {
    console.error('❌ Error:', error);
    await pool.end();
  }
}

testAnalyticsData();

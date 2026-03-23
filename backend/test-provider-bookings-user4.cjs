const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://isafari_user:@Jctnftr01@localhost:5432/isafari_db',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function testProviderBookings() {
  console.log('🧪 Testing Provider Bookings for user_id=4...\n');
  
  try {
    const testUserId = 4; // DANSHOP provider
    
    console.log(`Testing with user_id: ${testUserId}\n`);
    
    // Get provider info
    const providerInfo = await pool.query(`
      SELECT id, user_id, business_name
      FROM service_providers
      WHERE user_id = $1
    `, [testUserId]);
    
    if (providerInfo.rows.length === 0) {
      console.log('❌ Provider not found!');
      return;
    }
    
    const provider = providerInfo.rows[0];
    console.log('📊 Provider Info:');
    console.log(`   - service_providers.id: ${provider.id}`);
    console.log(`   - user_id: ${provider.user_id}`);
    console.log(`   - Business: ${provider.business_name}\n`);
    
    // Test the query that provider dashboard uses
    const providerBookings = await pool.query(`
      SELECT 
        b.*,
        s.title as service_title,
        sp.business_name,
        u.first_name as traveler_first_name,
        u.last_name as traveler_last_name
      FROM bookings b
      LEFT JOIN services s ON b.service_id = s.id
      LEFT JOIN service_providers sp ON b.provider_id = sp.id
      LEFT JOIN users u ON b.user_id = u.id
      WHERE b.provider_id = (SELECT id FROM service_providers WHERE user_id = $1)
      ORDER BY 
        CASE 
          WHEN b.status = 'pending' THEN 1
          WHEN b.status = 'confirmed' THEN 2
          WHEN b.status = 'completed' THEN 3
          ELSE 4
        END,
        b.created_at DESC
    `, [testUserId]);
    
    console.log(`📊 Found ${providerBookings.rows.length} bookings:\n`);
    
    if (providerBookings.rows.length > 0) {
      console.log('✅ Query works correctly!\n');
      
      providerBookings.rows.forEach((b, index) => {
        console.log(`${index + 1}. Booking #${b.id}:`);
        console.log(`   Service: ${b.service_title}`);
        console.log(`   Traveler: ${b.traveler_first_name} ${b.traveler_last_name}`);
        console.log(`   Amount: TZS ${b.total_amount}`);
        console.log(`   Status: ${b.status}`);
        console.log(`   Date: ${new Date(b.created_at).toLocaleDateString()}`);
        console.log('');
      });
    } else {
      console.log('❌ No bookings found!');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    await pool.end();
  }
}

testProviderBookings();

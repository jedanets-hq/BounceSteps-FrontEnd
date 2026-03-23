const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://isafari_user:@Jctnftr01@localhost:5432/isafari_db',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function testBookingsProviderId() {
  console.log('🧪 Testing Bookings Provider ID Issue...\n');
  
  try {
    // 1. Check bookings table structure
    console.log('1️⃣ Checking bookings table structure...');
    const structure = await pool.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'bookings'
      AND column_name IN ('id', 'provider_id', 'service_id', 'user_id')
      ORDER BY ordinal_position;
    `);
    
    console.log('📋 Relevant columns:');
    structure.rows.forEach(col => {
      console.log(`   - ${col.column_name}: ${col.data_type}`);
    });
    console.log('');
    
    // 2. Check all bookings with provider info
    console.log('2️⃣ Checking bookings with provider info...');
    const bookings = await pool.query(`
      SELECT 
        b.id,
        b.provider_id,
        b.service_id,
        b.user_id,
        b.status,
        b.total_amount,
        s.title as service_title,
        s.provider_id as service_provider_user_id,
        sp.id as sp_table_id,
        sp.user_id as sp_user_id,
        sp.business_name
      FROM bookings b
      LEFT JOIN services s ON b.service_id = s.id
      LEFT JOIN service_providers sp ON b.provider_id = sp.id
      ORDER BY b.created_at DESC
      LIMIT 10
    `);
    
    console.log(`📊 Found ${bookings.rows.length} bookings:\n`);
    bookings.rows.forEach(b => {
      console.log(`Booking #${b.id}:`);
      console.log(`   Service: ${b.service_title}`);
      console.log(`   Provider ID in bookings table: ${b.provider_id}`);
      console.log(`   Service provider_id (user_id): ${b.service_provider_user_id}`);
      console.log(`   service_providers.id: ${b.sp_table_id}`);
      console.log(`   service_providers.user_id: ${b.sp_user_id}`);
      console.log(`   Business name: ${b.business_name || 'NULL'}`);
      console.log(`   Status: ${b.status}`);
      console.log(`   ⚠️ MATCH: ${b.provider_id === b.sp_table_id ? '✅ Correct (sp.id)' : b.provider_id === b.sp_user_id ? '❌ Wrong (user_id)' : '❓ Unknown'}`);
      console.log('');
    });
    
    // 3. Check service_providers table
    console.log('3️⃣ Checking service_providers table...');
    const providers = await pool.query(`
      SELECT id, user_id, business_name
      FROM service_providers
      ORDER BY id
      LIMIT 5
    `);
    
    console.log('📊 Service providers:');
    providers.rows.forEach(p => {
      console.log(`   - ID: ${p.id}, User ID: ${p.user_id}, Business: ${p.business_name}`);
    });
    console.log('');
    
    // 4. Test query that provider dashboard uses
    console.log('4️⃣ Testing provider dashboard query...');
    const testUserId = providers.rows[0]?.user_id;
    if (testUserId) {
      console.log(`   Testing with user_id: ${testUserId}\n`);
      
      const providerBookings = await pool.query(`
        SELECT 
          b.*,
          s.title as service_title,
          sp.business_name
        FROM bookings b
        LEFT JOIN services s ON b.service_id = s.id
        LEFT JOIN service_providers sp ON b.provider_id = sp.id
        WHERE b.provider_id = (SELECT id FROM service_providers WHERE user_id = $1)
        ORDER BY b.created_at DESC
      `, [testUserId]);
      
      console.log(`   Found ${providerBookings.rows.length} bookings for this provider`);
      if (providerBookings.rows.length > 0) {
        console.log('   ✅ Query works correctly!');
      } else {
        console.log('   ❌ No bookings found - provider_id mismatch!');
      }
    }
    
    console.log('\n✅ Test complete!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    await pool.end();
  }
}

testBookingsProviderId();

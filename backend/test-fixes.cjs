require('dotenv').config({ path: __dirname + '/.env' });
const { pool } = require('./models');

async function testFixes() {
  try {
    console.log('🧪 Testing Fixes\n');
    
    // 1. Test service images
    console.log('1️⃣ Testing service images query...');
    const servicesResult = await pool.query(`
      SELECT s.id,
             s.title,
             s.provider_id,
             CASE 
               WHEN s.images IS NULL OR s.images = '' OR s.images = '[]' THEN '[]'::jsonb
               WHEN s.images::text ~ '^\\[.*\\]$' THEN s.images::jsonb
               ELSE jsonb_build_array(s.images)
             END as images
      FROM services s
      WHERE s.provider_id = 1
      LIMIT 3
    `);
    
    console.log('   Services with images:');
    servicesResult.rows.forEach(s => {
      console.log(`   - ${s.title}: ${JSON.stringify(s.images)}`);
    });
    
    // 2. Test favorites JOIN
    console.log('\n2️⃣ Testing favorites JOIN...');
    const favoritesResult = await pool.query(`
      SELECT f.*, 
             sp.id as provider_id,
             sp.business_name,
             sp.business_type,
             u.first_name as provider_first_name,
             u.last_name as provider_last_name
      FROM favorites f
      LEFT JOIN service_providers sp ON f.provider_id = sp.id
      LEFT JOIN users u ON sp.user_id = u.id
      LIMIT 3
    `);
    
    console.log('   Favorites with provider info:');
    favoritesResult.rows.forEach(f => {
      console.log(`   - User ${f.user_id} favorited Provider ${f.provider_id} (${f.business_name})`);
    });
    
    // 3. Test provider_followers
    console.log('\n3️⃣ Testing provider_followers...');
    const followersResult = await pool.query(`
      SELECT pf.provider_id, sp.business_name, COUNT(*) as follower_count
      FROM provider_followers pf
      LEFT JOIN service_providers sp ON pf.provider_id = sp.id
      GROUP BY pf.provider_id, sp.business_name
    `);
    
    console.log('   Followers by provider:');
    followersResult.rows.forEach(f => {
      console.log(`   - Provider ${f.provider_id} (${f.business_name}): ${f.follower_count} followers`);
    });
    
    console.log('\n✅ All tests passed!');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await pool.end();
  }
}

testFixes();

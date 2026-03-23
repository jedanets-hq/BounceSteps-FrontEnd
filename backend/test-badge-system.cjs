const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'isafari_db',
  user: 'postgres',
  password: '@Jctnftr01',
  ssl: false
});

async function testBadgeSystem() {
  try {
    console.log('🔍 Testing Badge System...\n');

    // 1. Check provider_badges table structure
    console.log('1️⃣ Checking provider_badges table structure:');
    const tableCheck = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'provider_badges'
      ORDER BY ordinal_position
    `);
    console.log('Columns:', tableCheck.rows);
    console.log('');

    // 2. Check all badges in database
    console.log('2️⃣ All badges in database:');
    const allBadges = await pool.query(`
      SELECT pb.*, sp.business_name, sp.id as sp_id
      FROM provider_badges pb
      JOIN service_providers sp ON pb.provider_id = sp.id
      ORDER BY pb.assigned_at DESC
    `);
    console.log(`Found ${allBadges.rows.length} badges:`);
    allBadges.rows.forEach(badge => {
      console.log(`  - Provider: ${badge.business_name} (sp.id=${badge.sp_id})`);
      console.log(`    Badge Type: ${badge.badge_type}`);
      console.log(`    Assigned: ${badge.assigned_at}`);
      console.log('');
    });

    // 3. Check providers with their badges (as fetched by API)
    console.log('3️⃣ Providers with badges (as API returns):');
    const providersWithBadges = await pool.query(`
      SELECT 
        sp.id,
        sp.business_name,
        sp.user_id,
        u.email,
        pb.badge_type,
        pb.assigned_at as badge_assigned_at
      FROM service_providers sp
      JOIN users u ON sp.user_id = u.id
      LEFT JOIN provider_badges pb ON sp.id = pb.provider_id
      WHERE pb.badge_type IS NOT NULL
      ORDER BY sp.business_name
    `);
    console.log(`Found ${providersWithBadges.rows.length} providers with badges:`);
    providersWithBadges.rows.forEach(p => {
      console.log(`  - ${p.business_name} (sp.id=${p.id}, user_id=${p.user_id})`);
      console.log(`    Email: ${p.email}`);
      console.log(`    Badge: ${p.badge_type}`);
      console.log('');
    });

    // 4. Test specific provider fetch (simulate API call)
    if (providersWithBadges.rows.length > 0) {
      const testProvider = providersWithBadges.rows[0];
      console.log(`4️⃣ Testing provider fetch for: ${testProvider.business_name} (id=${testProvider.id})`);
      
      const providerResult = await pool.query(`
        SELECT 
          sp.*, 
          u.email, 
          u.first_name, 
          u.last_name, 
          u.phone, 
          u.avatar_url, 
          u.is_verified,
          pb.badge_type,
          pb.assigned_at as badge_assigned_at,
          pb.notes as badge_notes
        FROM service_providers sp
        JOIN users u ON sp.user_id = u.id
        LEFT JOIN provider_badges pb ON sp.id = pb.provider_id
        WHERE sp.id = $1
      `, [testProvider.id]);

      if (providerResult.rows.length > 0) {
        const provider = providerResult.rows[0];
        console.log('✅ Provider fetched successfully:');
        console.log(`   Business Name: ${provider.business_name}`);
        console.log(`   Badge Type: ${provider.badge_type || 'NO BADGE'}`);
        console.log(`   Badge Assigned: ${provider.badge_assigned_at || 'N/A'}`);
      } else {
        console.log('❌ Provider not found!');
      }
    }

    console.log('\n✅ Badge system test complete!');
    
  } catch (error) {
    console.error('❌ Error testing badge system:', error);
  } finally {
    await pool.end();
  }
}

testBadgeSystem();

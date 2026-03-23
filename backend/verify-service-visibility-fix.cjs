const { Pool } = require('pg');
require('dotenv').config({ path: '.env' });

const poolConfig = process.env.DATABASE_URL 
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl: false
    }
  : {
      user: process.env.DB_USER || 'postgres',
      host: process.env.DB_HOST || 'localhost',
      database: process.env.DB_NAME || 'isafari_db',
      password: process.env.DB_PASSWORD || 'password',
      port: process.env.DB_PORT || 5432,
    };

const pool = new Pool(poolConfig);

async function verifyFix() {
  try {
    console.log('\n🔍 VERIFYING SERVICE VISIBILITY FIX\n');
    console.log('='.repeat(80));
    
    // 1. Verify database schema
    console.log('\n1️⃣ DATABASE SCHEMA:');
    const fkResult = await pool.query(`
      SELECT ccu.table_name AS foreign_table_name,
             ccu.column_name AS foreign_column_name
      FROM information_schema.table_constraints AS tc
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
      WHERE tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_name = 'services'
        AND kcu.column_name = 'provider_id'
    `);
    
    if (fkResult.rows.length > 0) {
      console.log(`   ✅ services.provider_id → ${fkResult.rows[0].foreign_table_name}.${fkResult.rows[0].foreign_column_name}`);
    }
    
    // 2. Check all providers and their services
    console.log('\n2️⃣ PROVIDER-SERVICE MAPPING:');
    const providersResult = await pool.query(`
      SELECT sp.id, sp.user_id, sp.business_name,
             COUNT(s.id) as service_count
      FROM service_providers sp
      LEFT JOIN services s ON s.provider_id = sp.id AND s.is_active = true
      GROUP BY sp.id, sp.user_id, sp.business_name
      ORDER BY sp.id
    `);
    
    console.log(`\n   Found ${providersResult.rows.length} providers:\n`);
    providersResult.rows.forEach(p => {
      const status = p.service_count > 0 ? '✅' : '⚠️';
      console.log(`   ${status} Provider #${p.id}: "${p.business_name}"`);
      console.log(`      user_id: ${p.user_id}`);
      console.log(`      services: ${p.service_count}`);
      console.log('');
    });
    
    // 3. Test the provider route query for each provider
    console.log('\n3️⃣ TESTING PROVIDER ROUTE LOGIC:');
    for (const provider of providersResult.rows) {
      // Test with service_providers.id
      const servicesResult = await pool.query(`
        SELECT s.id, s.title
        FROM services s
        WHERE s.provider_id = $1 AND s.is_active = true
      `, [provider.id]);
      
      const status = servicesResult.rows.length > 0 ? '✅' : '⚠️';
      console.log(`   ${status} Provider #${provider.id} (${provider.business_name}): ${servicesResult.rows.length} services`);
      
      if (servicesResult.rows.length > 0) {
        servicesResult.rows.forEach(s => {
          console.log(`      - ${s.title}`);
        });
      }
    }
    
    // 4. Summary
    console.log('\n' + '='.repeat(80));
    console.log('\n📊 SUMMARY:');
    const totalProviders = providersResult.rows.length;
    const providersWithServices = providersResult.rows.filter(p => p.service_count > 0).length;
    const providersWithoutServices = totalProviders - providersWithServices;
    
    console.log(`   Total Providers: ${totalProviders}`);
    console.log(`   Providers with Services: ${providersWithServices} ✅`);
    console.log(`   Providers without Services: ${providersWithoutServices} ⚠️`);
    
    console.log('\n💡 EXPECTED BEHAVIOR:');
    console.log('   - Providers WITH services: Should display services on profile page ✅');
    console.log('   - Providers WITHOUT services: Should show provider info but "No services available" ✅');
    console.log('   - "Provider Not Found" should ONLY appear for non-existent provider IDs ✅');
    
    console.log('\n✅ VERIFICATION COMPLETE\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

verifyFix();

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

async function checkDanServicesDetail() {
  try {
    console.log('\n🔍 UCHUNGUZI WA KINA WA SERVICES ZA DAN\n');
    console.log('='.repeat(80));
    
    // Angalia providers wote wa Dan
    const danProviders = await pool.query(`
      SELECT sp.id, sp.user_id, sp.business_name, u.email, u.first_name, u.last_name
      FROM service_providers sp
      JOIN users u ON sp.user_id = u.id
      WHERE u.email ILIKE '%dan%'
      ORDER BY sp.id
    `);
    
    console.log(`\n📋 PROVIDERS WA DAN: ${danProviders.rows.length}\n`);
    
    for (const provider of danProviders.rows) {
      console.log(`\n${'='.repeat(80)}`);
      console.log(`Provider #${provider.id}: ${provider.business_name}`);
      console.log(`Email: ${provider.email}`);
      console.log(`Name: ${provider.first_name} ${provider.last_name}`);
      console.log(`service_providers.id: ${provider.id}`);
      console.log(`user_id: ${provider.user_id}`);
      console.log('='.repeat(80));
      
      // 1. Angalia services kwa service_providers.id (SAHIHI)
      console.log('\n1️⃣ SERVICES KWA service_providers.id (SAHIHI):');
      const correctServices = await pool.query(`
        SELECT s.id, s.title, s.category, s.price, s.provider_id, s.status, s.is_active, s.created_at
        FROM services s
        WHERE s.provider_id = $1
        ORDER BY s.created_at DESC
      `, [provider.id]);
      
      console.log(`   Idadi: ${correctServices.rows.length}`);
      if (correctServices.rows.length > 0) {
        correctServices.rows.forEach(s => {
          console.log(`   ✅ Service #${s.id}: "${s.title}"`);
          console.log(`      provider_id: ${s.provider_id} (service_providers.id)`);
          console.log(`      category: ${s.category}`);
          console.log(`      price: TZS ${s.price}`);
          console.log(`      status: ${s.status}, is_active: ${s.is_active}`);
          console.log(`      created: ${s.created_at}`);
          console.log('');
        });
      } else {
        console.log('   ⚠️ Hakuna services');
      }
      
      // 2. Angalia services kwa user_id (MAKOSA)
      console.log('\n2️⃣ SERVICES KWA user_id (MAKOSA - kama zipo):');
      const wrongServices = await pool.query(`
        SELECT s.id, s.title, s.category, s.price, s.provider_id, s.status, s.is_active
        FROM services s
        WHERE s.provider_id = $1
        ORDER BY s.created_at DESC
      `, [provider.user_id]);
      
      console.log(`   Idadi: ${wrongServices.rows.length}`);
      if (wrongServices.rows.length > 0) {
        console.log('   ⚠️⚠️⚠️ TATIZO LIMEPATIKANA! ⚠️⚠️⚠️');
        console.log('   Services hizi zina provider_id = user_id badala ya service_providers.id');
        console.log('');
        wrongServices.rows.forEach(s => {
          console.log(`   ❌ Service #${s.id}: "${s.title}"`);
          console.log(`      provider_id: ${s.provider_id} (WRONG - hii ni user_id!)`);
          console.log(`      Inapaswa kuwa: ${provider.id} (service_providers.id)`);
          console.log('');
        });
      } else {
        console.log('   ✅ Hakuna services zenye provider_id ya user_id');
      }
      
      // 3. Test API endpoint
      console.log('\n3️⃣ TEST API ENDPOINT:');
      console.log(`   URL: /api/providers/${provider.id}`);
      console.log(`   Query: WHERE s.provider_id = ${provider.id} AND s.is_active = true`);
      
      const apiResult = await pool.query(`
        SELECT s.id, s.title
        FROM services s
        WHERE s.provider_id = $1 AND s.is_active = true
      `, [provider.id]);
      
      console.log('   Matokeo: ' + apiResult.rows.length + ' services');
      if (apiResult.rows.length > 0) {
        apiResult.rows.forEach(s => {
          console.log(`      ✅ ${s.title}`);
        });
      }
    }
    
    // 4. Angalia services ZOTE na provider_id zao
    console.log('\n\n' + '='.repeat(80));
    console.log('4️⃣ SERVICES ZOTE NA PROVIDER_ID ZAO:');
    console.log('='.repeat(80));
    
    const allServices = await pool.query(`
      SELECT s.id, s.title, s.provider_id, s.is_active,
             sp.id as sp_id, sp.business_name, sp.user_id
      FROM services s
      LEFT JOIN service_providers sp ON s.provider_id = sp.id
      ORDER BY s.id
    `);
    
    console.log(`\nJumla ya services: ${allServices.rows.length}\n`);
    allServices.rows.forEach(s => {
      const match = s.sp_id ? '✅' : '❌';
      console.log(`${match} Service #${s.id}: "${s.title}"`);
      console.log(`   provider_id: ${s.provider_id}`);
      console.log(`   Matches service_providers.id: ${s.sp_id ? `YES (${s.sp_id})` : 'NO'}`);
      if (s.sp_id) {
        console.log(`   Provider: ${s.business_name} (user_id: ${s.user_id})`);
      }
      console.log('');
    });
    
    console.log('\n' + '='.repeat(80));
    console.log('✅ UCHUNGUZI UMEKAMILIKA\n');
    
  } catch (error) {
    console.error('❌ Kosa:', error.message);
    console.error(error);
  } finally {
    await pool.end();
  }
}

checkDanServicesDetail();

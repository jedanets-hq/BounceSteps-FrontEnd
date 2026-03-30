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

async function checkAllDanServices() {
  try {
    console.log('\n🔍 KUANGALIA SERVICES ZOTE ZA DAN (PAMOJA NA ZILIZOFUTWA)\n');
    console.log('='.repeat(80));
    
    // Tafuta provider Dan Dan
    const provider = await pool.query(`
      SELECT sp.id, sp.user_id, sp.business_name, u.email
      FROM service_providers sp
      JOIN users u ON sp.user_id = u.id
      WHERE u.email = 'dantest2@gmail.com'
    `);
    
    if (provider.rows.length === 0) {
      console.log('❌ Provider Dan Dan (dantest2@gmail.com) hajapatikana');
      await pool.end();
      return;
    }
    
    const prov = provider.rows[0];
    console.log(`\n✅ Provider: ${prov.business_name}`);
    console.log(`   Email: ${prov.email}`);
    console.log(`   service_providers.id: ${prov.id}`);
    console.log(`   user_id: ${prov.user_id}`);
    
    // Angalia services ZOTE (hata zisizo active)
    console.log('\n📋 SERVICES ZOTE (PAMOJA NA ZISIZO ACTIVE):');
    console.log('-'.repeat(80));
    
    const allServices = await pool.query(`
      SELECT s.id, s.title, s.category, s.price, s.provider_id, 
             s.status, s.is_active, s.created_at, s.updated_at
      FROM services s
      WHERE s.provider_id = $1
      ORDER BY s.created_at DESC
    `, [prov.id]);
    
    console.log(`\nJumla: ${allServices.rows.length} services\n`);
    
    if (allServices.rows.length === 0) {
      console.log('⚠️⚠️⚠️ HAKUNA SERVICES KABISA! ⚠️⚠️⚠️');
      console.log('');
      console.log('Hii inamaanisha:');
      console.log('1. Provider Dan Dan hajawahi kuongeza service yoyote');
      console.log('2. Au services zote zimefutwa kabisa kutoka database');
      console.log('');
      console.log('💡 SULUHISHO:');
      console.log('   Provider anahitaji kuongeza services mpya kupitia dashboard');
    } else {
      allServices.rows.forEach((s, index) => {
        const activeIcon = s.is_active ? '✅' : '❌';
        console.log(`${index + 1}. ${activeIcon} Service #${s.id}: "${s.title}"`);
        console.log(`   Category: ${s.category}`);
        console.log(`   Price: TZS ${s.price}`);
        console.log(`   Status: ${s.status}`);
        console.log(`   Is Active: ${s.is_active}`);
        console.log(`   Created: ${s.created_at}`);
        console.log(`   Updated: ${s.updated_at}`);
        console.log('');
      });
    }
    
    // Angalia kama kuna services zenye provider_id ya user_id (makosa)
    console.log('\n📋 KUANGALIA SERVICES ZENYE PROVIDER_ID YA USER_ID (MAKOSA):');
    console.log('-'.repeat(80));
    
    const wrongServices = await pool.query(`
      SELECT s.id, s.title, s.provider_id
      FROM services s
      WHERE s.provider_id = $1
    `, [prov.user_id]);
    
    if (wrongServices.rows.length > 0) {
      console.log(`\n⚠️ TATIZO LIMEPATIKANA! ${wrongServices.rows.length} services zina provider_id ya user_id\n`);
      wrongServices.rows.forEach(s => {
        console.log(`   Service #${s.id}: "${s.title}"`);
        console.log(`   provider_id: ${s.provider_id} (hii ni user_id, sio service_providers.id!)`);
        console.log(`   Inapaswa kuwa: ${prov.id}`);
        console.log('');
      });
      
      console.log('💡 SULUHISHO: Lazima tubadilishe provider_id');
    } else {
      console.log('\n✅ Hakuna services zenye provider_id ya user_id');
    }
    
    console.log('\n' + '='.repeat(80));
    console.log('✅ UCHUNGUZI UMEKAMILIKA\n');
    
  } catch (error) {
    console.error('❌ Kosa:', error.message);
    console.error(error);
  } finally {
    await pool.end();
  }
}

checkAllDanServices();

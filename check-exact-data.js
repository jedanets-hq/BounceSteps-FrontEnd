const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, '.env') });

const { pool } = require('./config/postgresql');

async function checkExactData() {
  console.log('\n🔍 CHECKING EXACT DATABASE DATA\n');
  console.log('═'.repeat(80));

  try {
    // Get all services with their exact location values
    const services = await pool.query(`
      SELECT 
        s.id,
        s.title,
        s.category,
        s.region,
        s.district,
        s.area,
        s.provider_id,
        sp.business_name,
        sp.region as provider_region,
        sp.district as provider_district
      FROM services s
      LEFT JOIN service_providers sp ON s.provider_id = sp.id
      ORDER BY s.id
    `);

    console.log(`\n📦 Total Services: ${services.rows.length}\n`);

    services.rows.forEach(s => {
      console.log(`Service ${s.id}: "${s.title}"`);
      console.log(`  Category: ${s.category}`);
      console.log(`  Service Location: region="${s.region}", district="${s.district}", area="${s.area}"`);
      console.log(`  Provider: ${s.business_name} (ID: ${s.provider_id})`);
      console.log(`  Provider Location: region="${s.provider_region}", district="${s.provider_district}"`);
      console.log('');
    });

    // Get all providers
    const providers = await pool.query(`
      SELECT 
        id,
        business_name,
        region,
        district,
        area,
        ward,
        service_categories
      FROM service_providers
      ORDER BY id
    `);

    console.log(`\n👥 Total Providers: ${providers.rows.length}\n`);

    providers.rows.forEach(p => {
      console.log(`Provider ${p.id}: "${p.business_name}"`);
      console.log(`  Location: region="${p.region}", district="${p.district}", area="${p.area}", ward="${p.ward}"`);
      console.log(`  Categories: ${p.service_categories}`);
      console.log('');
    });

    // Test specific queries that frontend would make
    console.log('\n🧪 TEST QUERIES (Simulating Frontend Requests)\n');
    console.log('─'.repeat(80));

    // Test 1: Get services in Mbeya region
    console.log('\nTest 1: Services in Mbeya region');
    const mbeya = await pool.query(`
      SELECT id, title, category, region, district
      FROM services
      WHERE LOWER(region) = LOWER('Mbeya')
    `);
    console.log(`  Found: ${mbeya.rows.length} services`);
    mbeya.rows.forEach(s => {
      console.log(`    - ${s.title} (${s.category}) in ${s.region}, ${s.district}`);
    });

    // Test 2: Get services in Arusha region
    console.log('\nTest 2: Services in Arusha region');
    const arusha = await pool.query(`
      SELECT id, title, category, region, district
      FROM services
      WHERE LOWER(region) = LOWER('Arusha')
    `);
    console.log(`  Found: ${arusha.rows.length} services`);
    arusha.rows.forEach(s => {
      console.log(`    - ${s.title} (${s.category}) in ${s.region}, ${s.district}`);
    });

    // Test 3: Get Accommodation services
    console.log('\nTest 3: Accommodation services');
    const accommodation = await pool.query(`
      SELECT id, title, region, district
      FROM services
      WHERE category = 'Accommodation'
    `);
    console.log(`  Found: ${accommodation.rows.length} services`);
    accommodation.rows.forEach(s => {
      console.log(`    - ${s.title} in ${s.region}, ${s.district}`);
    });

    // Test 4: Get services in Mbeya + Accommodation
    console.log('\nTest 4: Accommodation in Mbeya');
    const mbeyaAccommodation = await pool.query(`
      SELECT id, title, region, district
      FROM services
      WHERE LOWER(region) = LOWER('Mbeya') AND category = 'Accommodation'
    `);
    console.log(`  Found: ${mbeyaAccommodation.rows.length} services`);
    mbeyaAccommodation.rows.forEach(s => {
      console.log(`    - ${s.title} in ${s.region}, ${s.district}`);
    });

    console.log('\n✅ DATA CHECK COMPLETE!');
    console.log('═'.repeat(80));

  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

checkExactData()
  .then(() => {
    console.log('\n✅ Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Failed:', error);
    process.exit(1);
  });

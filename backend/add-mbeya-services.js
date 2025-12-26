const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, '.env') });

const { pool } = require('./config/postgresql');

async function addMbeyaServices() {
  console.log('\n🏗️ ADDING MBEYA SERVICES AND PROVIDERS\n');
  console.log('═'.repeat(80));

  try {
    // Step 1: Create Mbeya provider
    console.log('\n📝 Step 1: Creating Mbeya provider...');
    
    const providerResult = await pool.query(`
      INSERT INTO service_providers (
        business_name,
        business_type,
        description,
        location,
        country,
        region,
        district,
        area,
        service_categories,
        is_verified,
        rating
      ) VALUES (
        'Mbeya Highland Tours & Accommodation',
        'Tours & Accommodation',
        'Premier tour operator and accommodation provider in Mbeya region, offering authentic highland experiences',
        'Mbeya, Tanzania',
        'Tanzania',
        'Mbeya',
        'Mbeya Urban',
        'Mbeya CBD',
        ARRAY['Accommodation', 'Tours & Activities', 'Transportation', 'Food & Dining'],
        true,
        4.5
      )
      RETURNING id, business_name
    `);

    const providerId = providerResult.rows[0].id;
    console.log(`✅ Created provider: ${providerResult.rows[0].business_name} (ID: ${providerId})`);

    // Step 2: Add services for this provider
    console.log('\n📝 Step 2: Adding services...');

    const services = [
      {
        title: 'Mbeya Peak Hotel',
        description: 'Comfortable hotel in the heart of Mbeya city with stunning mountain views',
        category: 'Accommodation',
        price: 80000,
        region: 'Mbeya',
        district: 'Mbeya Urban',
        area: 'Mbeya CBD'
      },
      {
        title: 'Highland Lodge Mbeya',
        description: 'Cozy lodge offering authentic highland hospitality and local cuisine',
        category: 'Accommodation',
        price: 60000,
        region: 'Mbeya',
        district: 'Mbeya Urban',
        area: 'Iyunga'
      },
      {
        title: 'Mbeya Backpackers Hostel',
        description: 'Budget-friendly hostel for travelers exploring the Southern Highlands',
        category: 'Accommodation',
        price: 25000,
        region: 'Mbeya',
        district: 'Mbeya Urban',
        area: 'Mbeya CBD'
      },
      {
        title: 'Kitulo Plateau National Park Tour',
        description: 'Full-day tour to the "Garden of God" - famous for wildflowers and stunning landscapes',
        category: 'Tours & Activities',
        price: 150000,
        region: 'Mbeya',
        district: 'Rungwe',
        area: 'Kitulo'
      },
      {
        title: 'Lake Nyasa Day Trip',
        description: 'Explore the beautiful shores of Lake Nyasa with swimming and local village visits',
        category: 'Tours & Activities',
        price: 120000,
        region: 'Mbeya',
        district: 'Kyela',
        area: 'Itungi'
      },
      {
        title: 'Mbeya City Cultural Tour',
        description: 'Discover Mbeya\'s rich history, local markets, and cultural heritage',
        category: 'Tours & Activities',
        price: 50000,
        region: 'Mbeya',
        district: 'Mbeya Urban',
        area: 'Mbeya CBD'
      },
      {
        title: 'Mbeya Airport Transfer',
        description: 'Reliable airport pickup and drop-off service',
        category: 'Transportation',
        price: 30000,
        region: 'Mbeya',
        district: 'Mbeya Urban',
        area: 'Songwe'
      },
      {
        title: 'Highland 4x4 Safari Vehicle',
        description: 'Rent a 4x4 vehicle for exploring Mbeya\'s rugged terrain',
        category: 'Transportation',
        price: 200000,
        region: 'Mbeya',
        district: 'Mbeya Urban',
        area: 'Mbeya CBD'
      },
      {
        title: 'Utengule Coffee Farm Restaurant',
        description: 'Farm-to-table dining experience with locally grown coffee and organic food',
        category: 'Food & Dining',
        price: 35000,
        region: 'Mbeya',
        district: 'Mbeya Rural',
        area: 'Utengule'
      },
      {
        title: 'Mbeya Highland Cuisine Tour',
        description: 'Taste authentic Southern Highland dishes and learn about local food culture',
        category: 'Food & Dining',
        price: 45000,
        region: 'Mbeya',
        district: 'Mbeya Urban',
        area: 'Mbeya CBD'
      },
      {
        title: 'Mbeya Central Market Shopping',
        description: 'Guided shopping tour through Mbeya\'s bustling central market',
        category: 'Shopping',
        price: 20000,
        region: 'Mbeya',
        district: 'Mbeya Urban',
        area: 'Mbeya CBD'
      },
      {
        title: 'Highland Spa & Wellness Center',
        description: 'Relaxation and wellness treatments in the cool highland climate',
        category: 'Health & Wellness',
        price: 70000,
        region: 'Mbeya',
        district: 'Mbeya Urban',
        area: 'Mbeya CBD'
      }
    ];

    let addedCount = 0;
    for (const service of services) {
      await pool.query(`
        INSERT INTO services (
          provider_id,
          title,
          description,
          category,
          price,
          currency,
          location,
          country,
          region,
          district,
          area,
          is_active,
          is_featured
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      `, [
        providerId,
        service.title,
        service.description,
        service.category,
        service.price,
        'TZS',
        `${service.area}, ${service.district}, ${service.region}`,
        'Tanzania',
        service.region,
        service.district,
        service.area,
        true,
        false
      ]);
      
      addedCount++;
      console.log(`  ✅ Added: ${service.title} (${service.category})`);
    }

    console.log(`\n✅ Successfully added ${addedCount} services for Mbeya region!`);

    // Step 3: Verify
    console.log('\n📊 Step 3: Verifying...');
    const verify = await pool.query(`
      SELECT COUNT(*) as count
      FROM services
      WHERE LOWER(region) = LOWER('Mbeya')
    `);
    
    console.log(`✅ Total services in Mbeya: ${verify.rows[0].count}`);

    console.log('\n✅ MBEYA DATA ADDED SUCCESSFULLY!');
    console.log('═'.repeat(80));
    console.log('\nNext steps:');
    console.log('1. Test journey planner with Mbeya location');
    console.log('2. Providers should now appear when filtering by Mbeya');
    console.log('3. Services should be visible in all categories');

  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

addMbeyaServices()
  .then(() => {
    console.log('\n✅ Script completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const bcrypt = require('bcryptjs');
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'iSafari-Global-Network',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD
});

async function createTestData() {
  const client = await pool.connect();
  
  try {
    console.log('🚀 Creating test users and services...\n');
    
    const hashedPassword = await bcrypt.hash('123456', 12);
    
    // 1. Create Traveler User
    console.log('📝 Creating traveler user...');
    const travelerResult = await client.query(`
      INSERT INTO users (email, password, first_name, last_name, user_type, phone, is_verified, is_active)
      VALUES ($1, $2, 'John', 'Traveler', 'traveler', '+255700111111', true, true)
      ON CONFLICT (email) DO UPDATE SET password = $2
      RETURNING id, email, user_type, first_name, last_name
    `, ['traveler.test@isafari.com', hashedPassword]);
    
    const travelerId = travelerResult.rows[0].id;
    console.log('✅ Traveler created:');
    console.log(`   Email: traveler.test@isafari.com`);
    console.log(`   Password: 123456`);
    console.log(`   Name: ${travelerResult.rows[0].first_name} ${travelerResult.rows[0].last_name}\n`);
    
    // 2. Create Service Provider User
    console.log('📝 Creating service provider user...');
    const providerResult = await client.query(`
      INSERT INTO users (email, password, first_name, last_name, user_type, phone, is_verified, is_active)
      VALUES ($1, $2, 'Safari', 'Expert', 'service_provider', '+255700222222', true, true)
      ON CONFLICT (email) DO UPDATE SET password = $2
      RETURNING id, email, user_type, first_name, last_name
    `, ['provider.test@isafari.com', hashedPassword]);
    
    const providerUserId = providerResult.rows[0].id;
    console.log('✅ Service Provider created:');
    console.log(`   Email: provider.test@isafari.com`);
    console.log(`   Password: 123456`);
    console.log(`   Name: ${providerResult.rows[0].first_name} ${providerResult.rows[0].last_name}\n`);
    
    // 3. Create Service Provider Profile
    console.log('📝 Creating service provider profile...');
    
    // First check if provider profile exists
    const existingProvider = await client.query(
      'SELECT id FROM service_providers WHERE user_id = $1',
      [providerUserId]
    );
    
    let serviceProviderResult;
    if (existingProvider.rows.length > 0) {
      // Update existing
      serviceProviderResult = await client.query(`
        UPDATE service_providers 
        SET business_name = 'Test Safari Adventures', business_type = 'Tour Operator', 
            description = 'Professional safari and tour services for testing', 
            location = 'Arusha Central', region = 'Arusha', country = 'Tanzania', 
            is_verified = true, rating = 4.8
        WHERE user_id = $1
        RETURNING id, business_name, location, region
      `, [providerUserId]);
    } else {
      // Insert new
      serviceProviderResult = await client.query(`
        INSERT INTO service_providers (user_id, business_name, business_type, description, location, region, country, is_verified, rating)
        VALUES ($1, 'Test Safari Adventures', 'Tour Operator', 'Professional safari and tour services for testing', 'Arusha Central', 'Arusha', 'Tanzania', true, 4.8)
        RETURNING id, business_name, location, region
      `, [providerUserId]);
    }
    
    const providerId = serviceProviderResult.rows[0].id;
    console.log('✅ Service Provider Profile created:');
    console.log(`   Business: ${serviceProviderResult.rows[0].business_name}`);
    console.log(`   Location: ${serviceProviderResult.rows[0].location}, ${serviceProviderResult.rows[0].region}\n`);
    
    // 4. Delete existing services for this provider to avoid duplicates
    await client.query('DELETE FROM services WHERE provider_id = $1', [providerId]);
    console.log('🗑️  Cleared existing services\n');
    
    // 5. Create Services in different locations
    console.log('📝 Creating test services...');
    
    const servicesData = [
      // Arusha Services
      {
        title: 'Arusha City Tour',
        description: 'Explore the vibrant city of Arusha with local guides',
        category: 'Tours & Activities',
        subcategory: 'City Tours',
        price: 150000,
        location: 'Arusha Central',
        region: 'Arusha',
        district: 'Arusha City',
        area: 'Arusha Central'
      },
      {
        title: 'Arusha Hotel Accommodation',
        description: 'Comfortable 3-star hotel in the heart of Arusha',
        category: 'Accommodation',
        subcategory: 'Hotels',
        price: 250000,
        location: 'Arusha Central',
        region: 'Arusha',
        district: 'Arusha City',
        area: 'Arusha Central'
      },
      {
        title: 'Arusha Airport Transfer',
        description: 'Reliable airport pickup and drop-off service',
        category: 'Transportation',
        subcategory: 'Airport Transfers',
        price: 80000,
        location: 'Arusha Central',
        region: 'Arusha',
        district: 'Arusha City',
        area: 'Arusha Central'
      },
      
      // Mbeya Services
      {
        title: 'Mbeya Mountain Trek',
        description: 'Guided hiking tour of Mbeya highlands with stunning views',
        category: 'Tours & Activities',
        subcategory: 'Adventure Tours',
        price: 200000,
        location: 'Mbeya City',
        region: 'Mbeya',
        district: 'Mbeya City',
        area: 'Mbeya City'
      },
      {
        title: 'Mbeya Guesthouse',
        description: 'Budget-friendly guesthouse with local charm',
        category: 'Accommodation',
        subcategory: 'Guesthouses',
        price: 120000,
        location: 'Mbeya City',
        region: 'Mbeya',
        district: 'Mbeya City',
        area: 'Mbeya City'
      },
      {
        title: 'Mbeya Local Food Tour',
        description: 'Taste authentic Mbeya cuisine at local restaurants',
        category: 'Food & Dining',
        subcategory: 'Local Cuisine',
        price: 60000,
        location: 'Mbeya City',
        region: 'Mbeya',
        district: 'Mbeya City',
        area: 'Mbeya City'
      },
      
      // Dar es Salaam Services
      {
        title: 'Dar es Salaam Beach Day',
        description: 'Relax on beautiful beaches near Dar es Salaam',
        category: 'Tours & Activities',
        subcategory: 'Beach Tours',
        price: 180000,
        location: 'City Centre',
        region: 'Dar es Salaam',
        district: 'Ilala',
        area: 'City Centre'
      },
      {
        title: 'Dar Luxury Hotel',
        description: 'Premium 5-star hotel with ocean views',
        category: 'Accommodation',
        subcategory: 'Hotels',
        price: 450000,
        location: 'City Centre',
        region: 'Dar es Salaam',
        district: 'Ilala',
        area: 'City Centre'
      },
      {
        title: 'Dar Seafood Restaurant',
        description: 'Fresh seafood dining experience',
        category: 'Food & Dining',
        subcategory: 'Fine Dining',
        price: 75000,
        location: 'City Centre',
        region: 'Dar es Salaam',
        district: 'Ilala',
        area: 'City Centre'
      },
      
      // Zanzibar Services
      {
        title: 'Zanzibar Stone Town Tour',
        description: 'Historical walking tour of UNESCO World Heritage site',
        category: 'Tours & Activities',
        subcategory: 'Cultural Tours',
        price: 120000,
        location: 'Stone Town',
        region: 'Zanzibar',
        district: 'Zanzibar City',
        area: 'Stone Town'
      },
      {
        title: 'Zanzibar Beach Resort',
        description: 'All-inclusive beachfront resort with water sports',
        category: 'Accommodation',
        subcategory: 'Resorts',
        price: 380000,
        location: 'Stone Town',
        region: 'Zanzibar',
        district: 'Zanzibar City',
        area: 'Stone Town'
      },
      {
        title: 'Zanzibar Spice Tour',
        description: 'Visit spice plantations and learn about Zanzibar spices',
        category: 'Tours & Activities',
        subcategory: 'Agricultural Tours',
        price: 100000,
        location: 'Stone Town',
        region: 'Zanzibar',
        district: 'Zanzibar City',
        area: 'Stone Town'
      }
    ];
    
    for (const service of servicesData) {
      await client.query(`
        INSERT INTO services (
          provider_id, title, description, category, subcategory, 
          price, currency, location, region, district, area, country, 
          is_active, is_featured, average_rating
        ) VALUES ($1, $2, $3, $4, $5, $6, 'TZS', $7, $8, $9, $10, 'Tanzania', true, true, 4.5)
      `, [
        providerId,
        service.title,
        service.description,
        service.category,
        service.subcategory,
        service.price,
        service.location,
        service.region,
        service.district,
        service.area
      ]);
    }
    
    console.log(`✅ Created ${servicesData.length} test services\n`);
    
    // 6. Verify data
    console.log('📊 Verification:');
    const verification = await client.query(`
      SELECT 
        (SELECT COUNT(*) FROM users WHERE user_type = 'traveler') as traveler_count,
        (SELECT COUNT(*) FROM users WHERE user_type = 'service_provider') as provider_count,
        (SELECT COUNT(*) FROM service_providers) as service_provider_profiles,
        (SELECT COUNT(*) FROM services WHERE provider_id = $1) as services_count
    `, [providerId]);
    
    const stats = verification.rows[0];
    console.log(`   Travelers: ${stats.traveler_count}`);
    console.log(`   Service Providers: ${stats.provider_count}`);
    console.log(`   Provider Profiles: ${stats.service_provider_profiles}`);
    console.log(`   Services: ${stats.services_count}\n`);
    
    // 7. Show services by location
    console.log('📍 Services by Location:');
    const servicesByLocation = await client.query(`
      SELECT region, COUNT(*) as count
      FROM services
      WHERE provider_id = $1
      GROUP BY region
      ORDER BY region
    `, [providerId]);
    
    servicesByLocation.rows.forEach(row => {
      console.log(`   ${row.region}: ${row.count} services`);
    });
    
    console.log('\n✨ TEST DATA CREATION COMPLETE!\n');
    console.log('🔐 LOGIN CREDENTIALS:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('TRAVELER:');
    console.log('  Email: traveler.test@isafari.com');
    console.log('  Password: 123456');
    console.log('');
    console.log('SERVICE PROVIDER:');
    console.log('  Email: provider.test@isafari.com');
    console.log('  Password: 123456');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    client.release();
    await pool.end();
  }
}

createTestData();

const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, '.env') });

const bcrypt = require('bcryptjs');
const { pool } = require('./config/postgresql');

async function createTestData() {
  console.log('\n🚀 CREATING TEST DATA FOR POSTGRESQL...\n');
  console.log('═'.repeat(50));

  try {
    // Hash password for all test users
    const hashedPassword = await bcrypt.hash('123456', 12);

    // Create test users
    console.log('\n👥 Creating test users...');
    
    const users = [
      { email: 'admin@isafari.com', first_name: 'Admin', last_name: 'User', user_type: 'service_provider', phone: '+255700000001' },
      { email: 'provider@isafari.com', first_name: 'Safari', last_name: 'Provider', user_type: 'service_provider', phone: '+255700000002' },
      { email: 'traveler@isafari.com', first_name: 'Happy', last_name: 'Traveler', user_type: 'traveler', phone: '+255700000003' },
      { email: 'john@example.com', first_name: 'John', last_name: 'Doe', user_type: 'traveler', phone: '+255700000004' },
      { email: 'jane@example.com', first_name: 'Jane', last_name: 'Smith', user_type: 'service_provider', phone: '+255700000005' }
    ];

    const createdUsers = [];
    for (const user of users) {
      // Check if user exists first
      const existing = await pool.query('SELECT * FROM users WHERE email = $1', [user.email]);
      let result;
      if (existing.rows.length > 0) {
        result = await pool.query(`
          UPDATE users SET password = $2, first_name = $3, last_name = $4, user_type = $5, phone = $6
          WHERE email = $1 RETURNING *
        `, [user.email, hashedPassword, user.first_name, user.last_name, user.user_type, user.phone]);
      } else {
        result = await pool.query(`
          INSERT INTO users (email, password, first_name, last_name, user_type, phone, is_verified, is_active)
          VALUES ($1, $2, $3, $4, $5, $6, true, true) RETURNING *
        `, [user.email, hashedPassword, user.first_name, user.last_name, user.user_type, user.phone]);
      }
      createdUsers.push(result.rows[0]);
      console.log(`  ✅ Created user: ${user.email}`);
    }

    // Create service providers
    console.log('\n🏢 Creating service provider profiles...');
    
    const providerUsers = createdUsers.filter(u => u.user_type === 'service_provider');
    const createdProviders = [];
    
    const providerData = [
      { business_name: 'Safari Adventures Tanzania', business_type: 'Tour Operator', description: 'Best safari tours in Tanzania', location: 'Arusha, Tanzania', region: 'Arusha', district: 'Arusha City' },
      { business_name: 'Zanzibar Beach Resort', business_type: 'Accommodation', description: 'Luxury beach resort in Zanzibar', location: 'Stone Town, Zanzibar', region: 'Zanzibar', district: 'Mjini Magharibi' },
      { business_name: 'Kilimanjaro Trekking Co', business_type: 'Adventure Tours', description: 'Professional mountain guides', location: 'Moshi, Tanzania', region: 'Kilimanjaro', district: 'Moshi' }
    ];

    for (let i = 0; i < providerUsers.length && i < providerData.length; i++) {
      const data = providerData[i];
      const userId = providerUsers[i].id;
      
      // Check if provider exists
      const existing = await pool.query('SELECT * FROM service_providers WHERE user_id = $1', [userId]);
      let result;
      if (existing.rows.length > 0) {
        result = await pool.query(`
          UPDATE service_providers SET business_name = $2, business_type = $3, description = $4, location = $5, region = $6, district = $7
          WHERE user_id = $1 RETURNING *
        `, [userId, data.business_name, data.business_type, data.description, data.location, data.region, data.district]);
      } else {
        result = await pool.query(`
          INSERT INTO service_providers (user_id, business_name, business_type, description, location, region, district, country, is_verified, rating)
          VALUES ($1, $2, $3, $4, $5, $6, $7, 'Tanzania', true, 4.5) RETURNING *
        `, [userId, data.business_name, data.business_type, data.description, data.location, data.region, data.district]);
      }
      createdProviders.push(result.rows[0]);
      console.log(`  ✅ Created provider: ${data.business_name}`);
    }


    // Create services with categories matching frontend (journey-planner, destination-discovery)
    // Categories: Accommodation, Transportation, Tours & Activities, Food & Dining, Shopping, Health & Wellness, Entertainment
    console.log('\n🎯 Creating services...');
    
    const services = [
      // Tours & Activities
      { title: 'Serengeti Safari Tour', category: 'Tours & Activities', description: 'Experience the great migration in Serengeti National Park', price: 500000, location: 'Serengeti, Tanzania', region: 'Mara' },
      { title: 'Mount Kilimanjaro Trek', category: 'Tours & Activities', description: 'Climb Africa\'s highest peak', price: 1500000, location: 'Kilimanjaro, Tanzania', region: 'Kilimanjaro' },
      { title: 'Ngorongoro Crater Tour', category: 'Tours & Activities', description: 'Visit the world\'s largest intact volcanic caldera', price: 400000, location: 'Ngorongoro, Tanzania', region: 'Arusha' },
      { title: 'Lake Manyara Day Trip', category: 'Tours & Activities', description: 'See tree-climbing lions and flamingos', price: 250000, location: 'Manyara, Tanzania', region: 'Manyara' },
      { title: 'Tarangire National Park', category: 'Tours & Activities', description: 'Home to the largest elephant herds', price: 350000, location: 'Tarangire, Tanzania', region: 'Manyara' },
      { title: 'Spice Tour Zanzibar', category: 'Tours & Activities', description: 'Discover the spice island heritage', price: 80000, location: 'Zanzibar, Tanzania', region: 'Zanzibar' },
      { title: 'Dar es Salaam City Tour', category: 'Tours & Activities', description: 'Explore the vibrant capital city', price: 100000, location: 'Dar es Salaam, Tanzania', region: 'Dar es Salaam' },
      // Accommodation
      { title: 'Zanzibar Beach Resort', category: 'Accommodation', description: 'Luxury beach resort with pristine beaches', price: 300000, location: 'Zanzibar, Tanzania', region: 'Zanzibar' },
      { title: 'Arusha Serena Hotel', category: 'Accommodation', description: 'Luxury 5-star hotel with Mount Meru views', price: 450000, location: 'Arusha, Tanzania', region: 'Arusha' },
      { title: 'Moshi Backpackers Hostel', category: 'Accommodation', description: 'Budget-friendly hostel for trekkers', price: 35000, location: 'Moshi, Tanzania', region: 'Kilimanjaro' },
      // Transportation
      { title: 'Airport Transfer Service', category: 'Transportation', description: 'Reliable airport pickup and drop-off', price: 80000, location: 'Arusha, Tanzania', region: 'Arusha' },
      { title: 'Safari Vehicle Rental', category: 'Transportation', description: '4x4 Land Cruiser rental with driver', price: 250000, location: 'Arusha, Tanzania', region: 'Arusha' },
      // Food & Dining
      { title: 'Stone Town Food Tour', category: 'Food & Dining', description: 'Guided walking tour sampling local delicacies', price: 65000, location: 'Zanzibar, Tanzania', region: 'Zanzibar' },
      { title: 'The Africafe Restaurant', category: 'Food & Dining', description: 'Fine dining with Tanzanian and international cuisine', price: 45000, location: 'Arusha, Tanzania', region: 'Arusha' },
      // Health & Wellness
      { title: 'Zanzibar Spa Retreat', category: 'Health & Wellness', description: 'Luxury spa treatments using local ingredients', price: 120000, location: 'Zanzibar, Tanzania', region: 'Zanzibar' },
      // Entertainment
      { title: 'Dar es Salaam Nightlife Tour', category: 'Entertainment', description: 'Experience the vibrant nightlife', price: 55000, location: 'Dar es Salaam, Tanzania', region: 'Dar es Salaam' }
    ];

    // Clear existing services first
    await pool.query('DELETE FROM services');
    console.log('  🗑️ Cleared existing services');

    for (let i = 0; i < services.length; i++) {
      const service = services[i];
      const providerId = createdProviders[i % createdProviders.length].id;
      
      await pool.query(`
        INSERT INTO services (provider_id, title, description, category, price, currency, location, region, country, is_active, is_featured, average_rating, images)
        VALUES ($1, $2, $3, $4, $5, 'TZS', $6, $7, 'Tanzania', true, $8, 4.5, $9)
      `, [
        providerId, 
        service.title, 
        service.description, 
        service.category, 
        service.price, 
        service.location, 
        service.region,
        i < 3,
        ['https://images.unsplash.com/photo-1516426122078-c23e76319801?w=800']
      ]);
      console.log(`  ✅ Created service: ${service.title}`);
    }

    // Final count
    console.log('\n📊 FINAL DATABASE STATUS:');
    console.log('─'.repeat(50));
    
    const userCount = await pool.query('SELECT COUNT(*) FROM users');
    const providerCount = await pool.query('SELECT COUNT(*) FROM service_providers');
    const serviceCount = await pool.query('SELECT COUNT(*) FROM services');
    
    console.log(`  Users: ${userCount.rows[0].count}`);
    console.log(`  Service Providers: ${providerCount.rows[0].count}`);
    console.log(`  Services: ${serviceCount.rows[0].count}`);

    console.log('\n✅ TEST DATA CREATED SUCCESSFULLY!');
    console.log('═'.repeat(50));
    console.log('\n📝 TEST ACCOUNTS (Password: 123456):');
    console.log('  - admin@isafari.com (Service Provider)');
    console.log('  - provider@isafari.com (Service Provider)');
    console.log('  - traveler@isafari.com (Traveler)');
    console.log('  - john@example.com (Traveler)');
    console.log('  - jane@example.com (Service Provider)');

  } catch (error) {
    console.error('❌ Error creating test data:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

createTestData()
  .then(() => process.exit(0))
  .catch((e) => { console.error(e); process.exit(1); });

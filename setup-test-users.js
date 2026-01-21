/**
 * Setup Test Users for Workflow Testing
 * Creates a traveler and a service provider with test data
 */

const { pool } = require('./config/postgresql');
const bcrypt = require('bcryptjs');

async function setupTestUsers() {
  const client = await pool.connect();
  
  try {
    console.log('🔧 Setting up test users...\n');
    
    // Hash passwords
    const hashedPassword = await bcrypt.hash('test123', 10);
    
    // 1. Create or update traveler user
    console.log('📝 Creating traveler user...');
    const travelerResult = await client.query(`
      INSERT INTO users (
        email, password, first_name, last_name, role, phone, is_verified
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (email) 
      DO UPDATE SET 
        password = $2,
        first_name = $3,
        last_name = $4,
        role = $5,
        phone = $6,
        is_verified = $7
      RETURNING id, email, first_name, last_name, role
    `, [
      'traveler@test.com',
      hashedPassword,
      'Test',
      'Traveler',
      'traveler',
      '+255712345678',
      true
    ]);
    
    const traveler = travelerResult.rows[0];
    console.log('✅ Traveler created:');
    console.log(`   ID: ${traveler.id}`);
    console.log(`   Email: ${traveler.email}`);
    console.log(`   Name: ${traveler.first_name} ${traveler.last_name}`);
    console.log(`   Role: ${traveler.role}\n`);
    
    // 2. Create or update provider user
    console.log('📝 Creating service provider user...');
    const providerResult = await client.query(`
      INSERT INTO users (
        email, password, first_name, last_name, role, phone, is_verified
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (email) 
      DO UPDATE SET 
        password = $2,
        first_name = $3,
        last_name = $4,
        role = $5,
        phone = $6,
        is_verified = $7
      RETURNING id, email, first_name, last_name, role
    `, [
      'provider@test.com',
      hashedPassword,
      'Test',
      'Provider',
      'service_provider',
      '+255787654321',
      true
    ]);
    
    const provider = providerResult.rows[0];
    console.log('✅ Provider created:');
    console.log(`   ID: ${provider.id}`);
    console.log(`   Email: ${provider.email}`);
    console.log(`   Name: ${provider.first_name} ${provider.last_name}`);
    console.log(`   Role: ${provider.role}\n`);
    
    // 3. Create service_provider profile
    console.log('📝 Creating service provider profile...');
    await client.query(`
      INSERT INTO service_providers (
        user_id, business_name, business_type, location, phone, email, is_verified, rating
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      ON CONFLICT (user_id) 
      DO UPDATE SET 
        business_name = $2,
        business_type = $3,
        location = $4,
        phone = $5,
        email = $6,
        is_verified = $7,
        rating = $8
    `, [
      provider.id,
      'Test Safari Tours',
      'Tours & Activities',
      'Dar es Salaam, Tanzania',
      '+255787654321',
      'provider@test.com',
      true,
      4.5
    ]);
    
    console.log('✅ Service provider profile created\n');
    
    // 4. Create test service
    console.log('📝 Creating test service...');
    const serviceResult = await client.query(`
      INSERT INTO services (
        provider_id, title, description, category, location, country, region, district, area,
        price, currency, images, status, is_active, is_featured, average_rating, review_count
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
      ON CONFLICT DO NOTHING
      RETURNING id, title, category, price
    `, [
      provider.id,
      'Serengeti Safari Adventure',
      'Experience the breathtaking wildlife of Serengeti National Park with our expert guides. This 3-day safari includes game drives, accommodation, and meals.',
      'Tours & Activities',
      'Serengeti National Park, Arusha, Tanzania',
      'Tanzania',
      'Arusha',
      'Arusha Urban',
      'Serengeti',
      350000.00,
      'TZS',
      JSON.stringify(['https://images.unsplash.com/photo-1516426122078-c23e76319801?w=800']),
      'active',
      true,
      true,
      4.8,
      15
    ]);
    
    if (serviceResult.rows.length > 0) {
      const service = serviceResult.rows[0];
      console.log('✅ Test service created:');
      console.log(`   ID: ${service.id}`);
      console.log(`   Title: ${service.title}`);
      console.log(`   Category: ${service.category}`);
      console.log(`   Price: TZS ${service.price}\n`);
    } else {
      console.log('✅ Test service already exists\n');
    }
    
    // 5. Create another test service in Dar es Salaam
    console.log('📝 Creating second test service...');
    const service2Result = await client.query(`
      INSERT INTO services (
        provider_id, title, description, category, location, country, region, district, area,
        price, currency, images, status, is_active, is_featured, average_rating, review_count
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
      ON CONFLICT DO NOTHING
      RETURNING id, title, category, price
    `, [
      provider.id,
      'Dar es Salaam City Tour',
      'Explore the vibrant city of Dar es Salaam with visits to local markets, historical sites, and beautiful beaches. Half-day tour with lunch included.',
      'Tours & Activities',
      'Dar es Salaam City Center, Ilala, Tanzania',
      'Tanzania',
      'Dar es Salaam',
      'Ilala',
      'City Center',
      50000.00,
      'TZS',
      JSON.stringify(['https://images.unsplash.com/photo-1611348586804-61bf6c080437?w=800']),
      'active',
      true,
      false,
      4.5,
      8
    ]);
    
    if (service2Result.rows.length > 0) {
      const service2 = service2Result.rows[0];
      console.log('✅ Second test service created:');
      console.log(`   ID: ${service2.id}`);
      console.log(`   Title: ${service2.title}`);
      console.log(`   Category: ${service2.category}`);
      console.log(`   Price: TZS ${service2.price}\n`);
    } else {
      console.log('✅ Second test service already exists\n');
    }
    
    console.log('═'.repeat(60));
    console.log('✅ TEST USERS SETUP COMPLETE!');
    console.log('═'.repeat(60));
    console.log('\nTest Credentials:');
    console.log('\n📧 Traveler:');
    console.log('   Email: traveler@test.com');
    console.log('   Password: test123');
    console.log('\n📧 Service Provider:');
    console.log('   Email: provider@test.com');
    console.log('   Password: test123');
    console.log('\n🚀 You can now run: node test-complete-journey-workflow.js');
    console.log('═'.repeat(60));
    
  } catch (error) {
    console.error('❌ Error setting up test users:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

setupTestUsers().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});

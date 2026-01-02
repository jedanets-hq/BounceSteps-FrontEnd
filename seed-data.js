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

async function seed() {
  const client = await pool.connect();
  
  try {
    console.log('Starting seed...');
    
    const hashedPassword = await bcrypt.hash('123456', 12);
    console.log('Password hashed');
    
    // Insert users
    const userResult = await client.query(`
      INSERT INTO users (email, password, first_name, last_name, user_type, phone, is_verified, is_active)
      VALUES 
        ('admin@isafari.com', $1, 'Admin', 'User', 'service_provider', '+255700000001', true, true),
        ('provider@isafari.com', $1, 'Safari', 'Provider', 'service_provider', '+255700000002', true, true),
        ('traveler@isafari.com', $1, 'Happy', 'Traveler', 'traveler', '+255700000003', true, true)
      ON CONFLICT (email) DO UPDATE SET password = $1
      RETURNING id, email, user_type
    `, [hashedPassword]);
    
    console.log('Users created:', userResult.rows);
    
    // Get provider user IDs
    const providerUsers = userResult.rows.filter(u => u.user_type === 'service_provider');
    console.log('Provider users:', providerUsers);
    
    if (providerUsers.length > 0) {
      // Insert service providers
      for (const user of providerUsers) {
        const existingProvider = await client.query('SELECT id FROM service_providers WHERE user_id = $1', [user.id]);
        
        if (existingProvider.rows.length === 0) {
          const providerResult = await client.query(`
            INSERT INTO service_providers (user_id, business_name, business_type, description, location, region, country, is_verified, rating)
            VALUES ($1, $2, 'Tour Operator', 'Professional safari services', 'Arusha, Tanzania', 'Arusha', 'Tanzania', true, 4.5)
            RETURNING id, business_name
          `, [user.id, `${user.email.split('@')[0]} Tours`]);
          console.log('Provider created:', providerResult.rows[0]);
        } else {
          console.log('Provider already exists for user:', user.id);
        }
      }
      
      // Get provider IDs
      const providers = await client.query('SELECT id FROM service_providers LIMIT 1');
      
      if (providers.rows.length > 0) {
        const providerId = providers.rows[0].id;
        
        // Delete existing services first to avoid duplicates
        await client.query('DELETE FROM services WHERE provider_id = $1', [providerId]);
        
        // Insert services with categories matching frontend
        // Categories: Accommodation, Transportation, Food & Dining, Tours & Activities, Shopping, Health & Wellness, Entertainment
        await client.query(`
          INSERT INTO services (provider_id, title, description, category, subcategory, price, currency, location, region, district, area, country, is_active, is_featured, average_rating, images)
          VALUES 
            -- Tours & Activities
            ($1, 'Serengeti Safari Tour', 'Experience the great migration with expert guides. See lions, elephants, and wildebeest in their natural habitat.', 'Tours & Activities', 'Wildlife Safaris', 500000, 'TZS', 'Serengeti National Park', 'Mara', 'Serengeti', 'Serengeti', 'Tanzania', true, true, 4.8, ARRAY['https://images.unsplash.com/photo-1516426122078-c23e76319801']),
            ($1, 'Kilimanjaro Trek Adventure', 'Climb Africa''s highest peak with experienced mountaineers. 7-day Machame route expedition.', 'Tours & Activities', 'Adventure Tours', 1500000, 'TZS', 'Kilimanjaro', 'Kilimanjaro', 'Moshi Rural', 'Machame', 'Tanzania', true, true, 4.9, ARRAY['https://images.unsplash.com/photo-1609198092458-38a293c7ac4b']),
            ($1, 'Ngorongoro Crater Day Trip', 'Explore the world''s largest intact volcanic caldera and see the Big Five.', 'Tours & Activities', 'Wildlife Safaris', 350000, 'TZS', 'Ngorongoro Crater', 'Arusha', 'Ngorongoro', 'Ngorongoro Crater', 'Tanzania', true, true, 4.7, ARRAY['https://images.unsplash.com/photo-1547471080-7cc2caa01a7e']),
            ($1, 'Maasai Village Cultural Tour', 'Immerse yourself in authentic Maasai culture, traditions, and way of life.', 'Tours & Activities', 'Cultural Tours', 75000, 'TZS', 'Arusha Central', 'Arusha', 'Arusha City', 'Arusha Central', 'Tanzania', true, false, 4.6, ARRAY['https://images.unsplash.com/photo-1489392191049-fc10c97e64b6']),
            
            -- Accommodation
            ($1, 'Arusha Serena Hotel', 'Luxury 5-star hotel with stunning views of Mount Meru. Pool, spa, and fine dining.', 'Accommodation', 'Hotels', 450000, 'TZS', 'Arusha Central', 'Arusha', 'Arusha City', 'Arusha Central', 'Tanzania', true, true, 4.8, ARRAY['https://images.unsplash.com/photo-1566073771259-6a8506099945']),
            ($1, 'Zanzibar Beach Resort', 'Beachfront resort with private beach access, water sports, and all-inclusive packages.', 'Accommodation', 'Resorts', 380000, 'TZS', 'Zanzibar', 'Zanzibar', 'Zanzibar City', 'Stone Town', 'Tanzania', true, true, 4.5, ARRAY['https://images.unsplash.com/photo-1590523741831-ab7e8b8f9c7f']),
            ($1, 'Moshi Backpackers Hostel', 'Budget-friendly hostel perfect for trekkers. Dorms and private rooms available.', 'Accommodation', 'Hostels', 35000, 'TZS', 'Moshi Town', 'Kilimanjaro', 'Moshi Municipal', 'Moshi Town', 'Tanzania', true, false, 4.2, ARRAY['https://images.unsplash.com/photo-1555854877-bab0e564b8d5']),
            
            -- Transportation
            ($1, 'Airport Transfer Service', 'Reliable airport pickup and drop-off service. Air-conditioned vehicles with professional drivers.', 'Transportation', 'Airport Transfers', 80000, 'TZS', 'Arusha Central', 'Arusha', 'Arusha City', 'Arusha Central', 'Tanzania', true, false, 4.4, ARRAY['https://images.unsplash.com/photo-1449965408869-eaa3f722e40d']),
            ($1, 'Safari Vehicle Rental', '4x4 Land Cruiser rental with driver for safari adventures. Fully equipped with camping gear.', 'Transportation', 'Car Rental', 250000, 'TZS', 'Arusha Central', 'Arusha', 'Arusha City', 'Arusha Central', 'Tanzania', true, true, 4.6, ARRAY['https://images.unsplash.com/photo-1533473359331-0135ef1b58bf']),
            
            -- Food & Dining
            ($1, 'The Africafe Restaurant', 'Fine dining experience with authentic Tanzanian and international cuisine.', 'Food & Dining', 'Fine Dining', 45000, 'TZS', 'Arusha Central', 'Arusha', 'Arusha City', 'Arusha Central', 'Tanzania', true, false, 4.5, ARRAY['https://images.unsplash.com/photo-1517248135467-4c7edcad34c4']),
            ($1, 'Stone Town Food Tour', 'Guided walking tour through Zanzibar''s historic Stone Town sampling local delicacies.', 'Food & Dining', 'Street Food', 65000, 'TZS', 'Zanzibar', 'Zanzibar', 'Zanzibar City', 'Stone Town', 'Tanzania', true, true, 4.7, ARRAY['https://images.unsplash.com/photo-1504674900247-0877df9cc836']),
            
            -- Shopping
            ($1, 'Maasai Market Shopping Tour', 'Guided tour of local markets for authentic Tanzanian crafts, jewelry, and souvenirs.', 'Shopping', 'Local Crafts', 25000, 'TZS', 'Arusha Central', 'Arusha', 'Arusha City', 'Arusha Central', 'Tanzania', true, false, 4.3, ARRAY['https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a']),
            
            -- Health & Wellness
            ($1, 'Zanzibar Spa Retreat', 'Luxury spa treatments using local ingredients. Massages, facials, and wellness packages.', 'Health & Wellness', 'Spas', 120000, 'TZS', 'Zanzibar', 'Zanzibar', 'Zanzibar City', 'Stone Town', 'Tanzania', true, true, 4.8, ARRAY['https://images.unsplash.com/photo-1544161515-4ab6ce6db874']),
            
            -- Entertainment
            ($1, 'Dar es Salaam Nightlife Tour', 'Experience the vibrant nightlife of Tanzania''s largest city. Clubs, live music, and local bars.', 'Entertainment', 'Nightlife', 55000, 'TZS', 'City Centre', 'Dar es Salaam', 'Ilala', 'City Centre', 'Tanzania', true, false, 4.4, ARRAY['https://images.unsplash.com/photo-1514525253161-7a46d19cd819'])
        `, [providerId]);
        
        console.log('Services created with matching categories');
      }
    }
    
    // Verify
    const counts = await client.query(`
      SELECT 
        (SELECT COUNT(*) FROM users) as users,
        (SELECT COUNT(*) FROM service_providers) as providers,
        (SELECT COUNT(*) FROM services) as services
    `);
    
    console.log('Final counts:', counts.rows[0]);
    console.log('SEED COMPLETE!');
    
  } catch (error) {
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    client.release();
    await pool.end();
  }
}

seed();

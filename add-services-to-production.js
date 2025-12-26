// Script to add services with proper location data to production database
const fetch = require('node-fetch');

const API_URL = 'https://isafarinetworkglobal-2.onrender.com/api';

// Login credentials for service provider
const PROVIDER_EMAIL = 'provider@isafari.com';
const PROVIDER_PASSWORD = '123456';

// Services to add with proper location data
const services = [
  {
    title: 'Serengeti Safari Tour',
    description: 'Experience the great migration with expert guides. See lions, elephants, and wildebeest in their natural habitat.',
    category: 'Tours & Activities',
    subcategory: 'Wildlife Safaris',
    price: 500000,
    currency: 'TZS',
    location: 'Serengeti National Park',
    region: 'Mara',
    district: 'Serengeti',
    area: 'Serengeti',
    country: 'Tanzania',
    images: ['https://images.unsplash.com/photo-1516426122078-c23e76319801'],
    amenities: ['Guide', 'Transport', 'Meals'],
    paymentMethods: { mobile_money: true, bank_transfer: true, cash: true },
    contactInfo: { phone: '+255700000002', email: 'provider@isafari.com' }
  },
  {
    title: 'Arusha Serena Hotel',
    description: 'Luxury 5-star hotel with stunning views of Mount Meru. Pool, spa, and fine dining.',
    category: 'Accommodation',
    subcategory: 'Hotels',
    price: 450000,
    currency: 'TZS',
    location: 'Arusha Central',
    region: 'Arusha',
    district: 'Arusha City',
    area: 'Arusha Central',
    country: 'Tanzania',
    images: ['https://images.unsplash.com/photo-1566073771259-6a8506099945'],
    amenities: ['WiFi', 'Pool', 'Spa', 'Restaurant'],
    paymentMethods: { mobile_money: true, bank_transfer: true, credit_card: true },
    contactInfo: { phone: '+255700000002', email: 'provider@isafari.com' }
  },
  {
    title: 'Mbeya Highland Lodge',
    description: 'Cozy lodge in the Mbeya highlands with mountain views and hiking trails.',
    category: 'Accommodation',
    subcategory: 'Lodges',
    price: 180000,
    currency: 'TZS',
    location: 'Mbeya City',
    region: 'Mbeya',
    district: 'Mbeya City',
    area: 'Mbeya City',
    country: 'Tanzania',
    images: ['https://images.unsplash.com/photo-1520250497591-112f2f40a3f4'],
    amenities: ['WiFi', 'Restaurant', 'Hiking'],
    paymentMethods: { mobile_money: true, cash: true },
    contactInfo: { phone: '+255700000002', email: 'provider@isafari.com' }
  },
  {
    title: 'Zanzibar Beach Resort',
    description: 'Beachfront resort with private beach access, water sports, and all-inclusive packages.',
    category: 'Accommodation',
    subcategory: 'Resorts',
    price: 380000,
    currency: 'TZS',
    location: 'Stone Town',
    region: 'Zanzibar',
    district: 'Zanzibar City',
    area: 'Stone Town',
    country: 'Tanzania',
    images: ['https://images.unsplash.com/photo-1590523741831-ab7e8b8f9c7f'],
    amenities: ['Beach', 'Pool', 'Water Sports', 'Restaurant'],
    paymentMethods: { mobile_money: true, bank_transfer: true, credit_card: true },
    contactInfo: { phone: '+255700000002', email: 'provider@isafari.com' }
  },
  {
    title: 'Airport Transfer Service',
    description: 'Reliable airport pickup and drop-off service. Air-conditioned vehicles with professional drivers.',
    category: 'Transportation',
    subcategory: 'Airport Transfers',
    price: 80000,
    currency: 'TZS',
    location: 'Arusha Central',
    region: 'Arusha',
    district: 'Arusha City',
    area: 'Arusha Central',
    country: 'Tanzania',
    images: ['https://images.unsplash.com/photo-1449965408869-eaa3f722e40d'],
    amenities: ['AC', 'Professional Driver', '24/7 Service'],
    paymentMethods: { mobile_money: true, cash: true },
    contactInfo: { phone: '+255700000002', email: 'provider@isafari.com' }
  }
];

async function addServices() {
  try {
    console.log('🔐 Logging in as service provider...');
    
    // Login
    const loginResponse = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: PROVIDER_EMAIL, password: PROVIDER_PASSWORD })
    });
    
    const loginData = await loginResponse.json();
    
    if (!loginData.success) {
      console.error('❌ Login failed:', loginData.message);
      console.log('\n📝 You need to create a service provider account first:');
      console.log('   1. Go to: https://isafari-tz.netlify.app/register');
      console.log('   2. Register with:');
      console.log('      Email: provider@isafari.com');
      console.log('      Password: 123456');
      console.log('      User Type: Service Provider');
      console.log('   3. Run this script again');
      return;
    }
    
    const token = loginData.token;
    console.log('✅ Logged in successfully');
    
    // Add each service
    console.log(`\n📦 Adding ${services.length} services...`);
    
    for (const service of services) {
      console.log(`\n➕ Adding: ${service.title}`);
      console.log(`   Category: ${service.category}`);
      console.log(`   Location: ${service.area}, ${service.district}, ${service.region}`);
      
      const response = await fetch(`${API_URL}/services`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(service)
      });
      
      const data = await response.json();
      
      if (data.success) {
        console.log(`   ✅ Added successfully (ID: ${data.service.id})`);
      } else {
        console.log(`   ❌ Failed: ${data.message}`);
      }
    }
    
    console.log('\n🎉 DONE! Services added to production database.');
    console.log('\n📋 Next steps:');
    console.log('   1. Go to: https://isafari-tz.netlify.app/journey-planner');
    console.log('   2. Select location (e.g., Mbeya region)');
    console.log('   3. Select category (e.g., Accommodation)');
    console.log('   4. Providers should now appear in Step 4! ✅');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

addServices();

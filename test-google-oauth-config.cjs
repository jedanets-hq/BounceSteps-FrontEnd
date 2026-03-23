/**
 * Test Google OAuth Configuration - LOCALHOST
 * Script hii inaangalia kama Google OAuth imewekwa vizuri
 */

require('dotenv').config({ path: './backend/.env' });

console.log('\n═══════════════════════════════════════════════════════════');
console.log('🔍 UCHUNGUZI WA GOOGLE OAUTH - LOCALHOST');
console.log('═══════════════════════════════════════════════════════════\n');

const clientId = process.env.GOOGLE_CLIENT_ID;
const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
const callbackUrl = process.env.GOOGLE_CALLBACK_URL;

console.log('📋 Hali ya Environment Variables:');
console.log('─────────────────────────────────────────────────────────');

// Check GOOGLE_CLIENT_ID
if (!clientId) {
  console.log('❌ GOOGLE_CLIENT_ID: HAIJAWEKWA');
} else if (clientId === 'your-google-client-id-from-console-cloud-google') {
  console.log('⚠️  GOOGLE_CLIENT_ID: Bado ni placeholder - LAZIMA IBADILISHWE');
} else {
  console.log('✅ GOOGLE_CLIENT_ID: Imewekwa');
  console.log(`   Value: ${clientId.substring(0, 30)}...`);
}

// Check GOOGLE_CLIENT_SECRET
if (!clientSecret) {
  console.log('\n❌ GOOGLE_CLIENT_SECRET: HAIJAWEKWA');
} else if (clientSecret === 'your-google-client-secret-from-console-cloud-google') {
  console.log('\n⚠️  GOOGLE_CLIENT_SECRET: Bado ni placeholder - LAZIMA IBADILISHWE');
} else {
  console.log('\n✅ GOOGLE_CLIENT_SECRET: Imewekwa');
  console.log(`   Value: ${clientSecret.substring(0, 15)}...`);
}

// Check GOOGLE_CALLBACK_URL
console.log(`\n✅ GOOGLE_CALLBACK_URL: ${callbackUrl || 'HAIJAWEKWA'}`);

console.log('\n═══════════════════════════════════════════════════════════');
console.log('📊 MATOKEO');
console.log('═══════════════════════════════════════════════════════════\n');

const isConfigured = clientId && 
                     clientSecret && 
                     clientId !== 'your-google-client-id-from-console-cloud-google' &&
                     clientSecret !== 'your-google-client-secret-from-console-cloud-google';

if (isConfigured) {
  console.log('✅ ✅ ✅ GOOGLE OAUTH IMEWEKWA VIZURI! ✅ ✅ ✅');
  console.log('\n🎉 Sasa unaweza kutumia:');
  console.log('   • "Continue with Google" kwenye login');
  console.log('   • "Sign up with Google" kwenye registration');
  console.log('\n💡 Kumbuka: Restart backend server baada ya kubadilisha .env');
} else {
  console.log('❌ ❌ ❌ GOOGLE OAUTH HAIJAWEKWA! ❌ ❌ ❌');
  console.log('\n🔧 JINSI YA KUTATUA TATIZO HILI:');
  console.log('═══════════════════════════════════════════════════════════\n');
  console.log('HATUA 1: Nenda Google Cloud Console');
  console.log('   🔗 https://console.cloud.google.com/apis/credentials\n');
  
  console.log('HATUA 2: Tengeneza OAuth 2.0 Client ID');
  console.log('   • Bofya "CREATE CREDENTIALS"');
  console.log('   • Chagua "OAuth client ID"');
  console.log('   • Application type: "Web application"\n');
  
  console.log('HATUA 3: Ongeza Authorized redirect URIs:');
  console.log('   📍 http://localhost:5000/api/auth/google/callback\n');
  
  console.log('HATUA 4: Ongeza Authorized JavaScript origins:');
  console.log('   📍 http://localhost:5173\n');
  
  console.log('HATUA 5: Nakili Client ID na Client Secret');
  console.log('   • Baada ya kutengeneza, utapata Client ID na Secret');
  console.log('   • Nakili hizo credentials\n');
  
  console.log('HATUA 6: Weka kwenye backend/.env file:');
  console.log('   📝 Fungua: backend/.env');
  console.log('   📝 Badilisha:');
  console.log('      GOOGLE_CLIENT_ID=<weka-client-id-yako-hapa>');
  console.log('      GOOGLE_CLIENT_SECRET=<weka-client-secret-yako-hapa>\n');
  
  console.log('HATUA 7: Restart backend server');
  console.log('   • Zima backend server (Ctrl+C)');
  console.log('   • Anza tena: cd backend && npm start\n');
  
  console.log('HATUA 8: Test Google OAuth');
  console.log('   • Nenda: http://localhost:5173/login');
  console.log('   • Bofya "Continue with Google"');
  console.log('   • Inafaa kufanya kazi sasa!\n');
}

console.log('═══════════════════════════════════════════════════════════\n');


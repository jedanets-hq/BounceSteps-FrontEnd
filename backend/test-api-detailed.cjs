const fetch = require('node-fetch');

async function testDetailed() {
  try {
    console.log('🔍 Testing API in detail...\n');
    
    const response = await fetch('http://localhost:5000/api/traveler-stories');
    
    console.log('Status:', response.status);
    console.log('Status Text:', response.statusText);
    console.log('Headers:', response.headers.raw());
    
    const text = await response.text();
    console.log('\nRaw response:', text);
    
    try {
      const json = JSON.parse(text);
      console.log('\nParsed JSON:', JSON.stringify(json, null, 2));
    } catch (e) {
      console.log('\nCould not parse as JSON');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testDetailed();

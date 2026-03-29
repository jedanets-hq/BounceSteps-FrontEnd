const axios = require('axios');

async function testProvidersAPI() {
  try {
    console.log('=== TESTING PROVIDERS API ===\n');
    
    // Test local backend
    const localUrl = 'http://localhost:5000/api/providers';
    console.log('Testing local backend:', localUrl);
    
    try {
      const response = await axios.get(localUrl);
      console.log('Status:', response.status);
      console.log('Success:', response.data.success);
      console.log('Providers count:', response.data.providers?.length || 0);
      console.log('Providers:', JSON.stringify(response.data.providers, null, 2));
    } catch (error) {
      console.log('Local backend error:', error.message);
      if (error.response) {
        console.log('Response status:', error.response.status);
        console.log('Response data:', error.response.data);
      }
    }
    
  } catch (error) {
    console.error('Test error:', error.message);
  }
}

testProvidersAPI();

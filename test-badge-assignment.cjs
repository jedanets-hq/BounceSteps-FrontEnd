const fetch = require('node-fetch');

const API_URL = 'http://localhost:5000';

async function testBadgeAssignment() {
  try {
    console.log('🧪 Testing badge assignment...\n');
    
    // First, get a provider
    console.log('1️⃣ Getting providers...');
    const providersRes = await fetch(`${API_URL}/api/admin/providers?page=1&limit=5`);
    const providersData = await providersRes.json();
    
    if (!providersData.providers || providersData.providers.length === 0) {
      console.log('❌ No providers found');
      return;
    }
    
    const provider = providersData.providers[0];
    console.log('✅ Found provider:', provider.business_name, '(ID:', provider.id, ')');
    console.log('   Current badge:', provider.badge_type || 'None');
    
    // Try to assign a badge
    console.log('\n2️⃣ Assigning "verified" badge...');
    const assignRes = await fetch(`${API_URL}/api/admin/providers/${provider.id}/badge`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        badgeType: 'verified',
        notes: 'Test badge assignment'
      })
    });
    
    console.log('Response status:', assignRes.status);
    const assignData = await assignRes.json();
    console.log('Response data:', JSON.stringify(assignData, null, 2));
    
    if (assignData.success) {
      console.log('\n✅ Badge assigned successfully!');
      
      // Verify the badge was assigned
      console.log('\n3️⃣ Verifying badge assignment...');
      const verifyRes = await fetch(`${API_URL}/api/admin/providers?page=1&limit=5`);
      const verifyData = await verifyRes.json();
      const updatedProvider = verifyData.providers.find(p => p.id === provider.id);
      console.log('Updated badge:', updatedProvider.badge_type);
    } else {
      console.log('\n❌ Failed to assign badge:', assignData.message);
    }
    
  } catch (error) {
    console.error('❌ Test error:', error.message);
    console.error(error);
  }
}

testBadgeAssignment();

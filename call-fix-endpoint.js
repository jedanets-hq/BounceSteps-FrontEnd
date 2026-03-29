// Call the fix endpoint

async function callFix() {
  try {
    console.log('🔧 Calling fix endpoint...\n');
    
    const response = await fetch('http://localhost:5000/api/fix/fix-provider-ids', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    
    console.log('Response:', JSON.stringify(data, null, 2));
    
    if (data.success) {
      console.log(`\n✅ SUCCESS! Fixed ${data.fixed.length} services`);
      
      if (data.fixed.length > 0) {
        console.log('\nFixed services:');
        data.fixed.forEach(f => {
          console.log(`  - Service #${f.service_id}: ${f.title}`);
          console.log(`    Provider: ${f.provider}`);
          console.log(`    Changed: ${f.old_provider_id} → ${f.new_provider_id}\n`);
        });
      }
    } else {
      console.log(`\n❌ FAILED: ${data.message}`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

callFix();

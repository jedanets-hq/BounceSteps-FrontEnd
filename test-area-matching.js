/**
 * Test Area Partial Matching
 */

const API_URL = process.env.VITE_API_URL || 'https://isafarimasterorg.onrender.com/api';

async function testAreaMatching() {
  console.log('🧪 TESTING AREA PARTIAL MATCHING\n');
  console.log('='.repeat(80));
  
  const tests = [
    {
      name: 'Exact match (uppercase)',
      params: { region: 'Mwanza', district: 'ILEMELA', area: 'BUZURUGA KASKAZINI' }
    },
    {
      name: 'Partial match (Buzuruga)',
      params: { region: 'Mwanza', district: 'ILEMELA', area: 'Buzuruga' }
    },
    {
      name: 'Partial match (KASKAZINI)',
      params: { region: 'Mwanza', district: 'ILEMELA', area: 'KASKAZINI' }
    },
    {
      name: 'District only',
      params: { region: 'Mwanza', district: 'ILEMELA' }
    },
    {
      name: 'District as Ilemela (mixed case)',
      params: { region: 'Mwanza', district: 'Ilemela' }
    }
  ];
  
  for (const test of tests) {
    console.log(`\n📍 TEST: ${test.name}`);
    console.log(`   Params:`, test.params);
    
    const queryParams = new URLSearchParams();
    queryParams.append('limit', '100');
    Object.entries(test.params).forEach(([key, value]) => {
      queryParams.append(key, value);
    });
    
    const url = `${API_URL}/services?${queryParams.toString()}`;
    
    try {
      const response = await fetch(url);
      const data = await response.json();
      
      console.log(`   ✅ Result: ${data.services?.length || 0} services found`);
      
      if (data.services && data.services.length > 0) {
        data.services.forEach(s => {
          console.log(`      - ${s.title} (${s.category})`);
          console.log(`        Location: ${s.region} → ${s.district} → ${s.area}`);
        });
      }
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
    }
  }
  
  console.log('\n' + '='.repeat(80));
  console.log('\n🎯 CONCLUSION:\n');
  console.log('   If partial matching works, "Buzuruga" should match "BUZURUGA KASKAZINI"');
  console.log('   If case-insensitive works, "Ilemela" should match "ILEMELA"');
}

testAreaMatching();

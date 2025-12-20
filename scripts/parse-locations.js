const fs = require('fs');
const path = require('path');

// Read all CSV files from location-files directory
const locationFilesDir = path.join(__dirname, '../location-files');
const files = fs.readdirSync(locationFilesDir).filter(f => f.endsWith('.csv'));

const locationsData = {
  regions: []
};

const regionsMap = new Map();
const districtsMap = new Map();
const wardsMap = new Map();
const streetsSet = new Set(); // Track unique streets per ward

console.log('📍 Parsing Tanzania locations with streets...');
console.log(`Found ${files.length} region files\n`);

files.forEach(file => {
  const filePath = path.join(locationFilesDir, file);
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n').filter(line => line.trim());
  
  // Skip header
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    const parts = line.split(',');
    
    if (parts.length < 7) continue;
    
    const region = parts[0]?.trim();
    const regionCode = parts[1]?.trim();
    const district = parts[2]?.trim();
    const districtCode = parts[3]?.trim();
    const ward = parts[4]?.trim();
    const wardCode = parts[5]?.trim();
    const street = parts[6]?.trim();
    
    if (!region || !district || !ward) continue;
    
    // Add region
    if (!regionsMap.has(regionCode)) {
      regionsMap.set(regionCode, {
        name: region,
        code: regionCode,
        districts: []
      });
    }
    
    // Add district
    const districtKey = `${regionCode}-${districtCode}`;
    if (!districtsMap.has(districtKey)) {
      const districtObj = {
        name: district,
        code: districtCode,
        wards: []
      };
      districtsMap.set(districtKey, districtObj);
      regionsMap.get(regionCode).districts.push(districtObj);
    }
    
    // Add ward
    const wardKey = `${districtKey}-${wardCode}`;
    if (!wardsMap.has(wardKey)) {
      const wardObj = {
        name: ward,
        code: wardCode,
        streets: []
      };
      wardsMap.set(wardKey, wardObj);
      districtsMap.get(districtKey).wards.push(wardObj);
    }
    
    // Add street (only unique streets per ward)
    if (street) {
      const streetKey = `${wardKey}-${street}`;
      if (!streetsSet.has(streetKey)) {
        streetsSet.add(streetKey);
        wardsMap.get(wardKey).streets.push(street);
      }
    }
  }
});

// Convert to array and sort
locationsData.regions = Array.from(regionsMap.values()).sort((a, b) => 
  a.name.localeCompare(b.name)
);

// Sort districts, wards, and streets
locationsData.regions.forEach(region => {
  region.districts.sort((a, b) => a.name.localeCompare(b.name));
  region.districts.forEach(district => {
    district.wards.sort((a, b) => a.name.localeCompare(b.name));
    district.wards.forEach(ward => {
      ward.streets.sort((a, b) => a.localeCompare(b));
    });
  });
});

// Statistics
const totalRegions = locationsData.regions.length;
const totalDistricts = locationsData.regions.reduce((sum, r) => sum + r.districts.length, 0);
const totalWards = locationsData.regions.reduce((sum, r) => 
  sum + r.districts.reduce((dSum, d) => dSum + d.wards.length, 0), 0
);
const totalStreets = locationsData.regions.reduce((sum, r) => 
  sum + r.districts.reduce((dSum, d) => 
    dSum + d.wards.reduce((wSum, w) => wSum + w.streets.length, 0), 0
  ), 0
);

console.log('✅ Parsing complete!\n');
console.log('📊 Statistics:');
console.log(`   Regions: ${totalRegions}`);
console.log(`   Districts: ${totalDistricts}`);
console.log(`   Wards: ${totalWards}`);
console.log(`   Streets: ${totalStreets}\n`);

// Write to JSON file
const outputPath = path.join(__dirname, '../src/data/tanzaniaLocations.json');
const outputDir = path.dirname(outputPath);

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

fs.writeFileSync(outputPath, JSON.stringify(locationsData, null, 2));
console.log(`💾 Saved to: ${outputPath}\n`);

// Create a simplified version for quick loading
const simplifiedData = {
  regions: locationsData.regions.map(r => ({
    name: r.name,
    code: r.code,
    districts: r.districts.map(d => ({
      name: d.name,
      code: d.code,
      wardsCount: d.wards.length,
      streetsCount: d.wards.reduce((sum, w) => sum + w.streets.length, 0)
    }))
  }))
};

const simplifiedPath = path.join(__dirname, '../src/data/tanzaniaLocationsSimplified.json');
fs.writeFileSync(simplifiedPath, JSON.stringify(simplifiedData, null, 2));
console.log(`💾 Saved simplified version to: ${simplifiedPath}\n`);

console.log('🎉 Done!');

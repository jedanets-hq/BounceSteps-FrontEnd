/**
 * Migration Script for Route Files
 * This script helps update route files from MongoDB to PostgreSQL
 * 
 * Usage: node migrate-routes.js
 */

const fs = require('fs');
const path = require('path');

const routeFiles = [
  'auth.js',
  'services.js',
  'bookings.js',
  'providers.js',
  'users.js',
  'admin.js',
  'payments.js',
  'notifications.js',
  'travelerStories.js'
];

console.log('🔄 Starting route migration...\n');

routeFiles.forEach(file => {
  const filePath = path.join(__dirname, 'routes', file);
  
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  File not found: ${file}`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  
  // Backup original file
  const backupPath = filePath + '.mongodb.backup';
  if (!fs.existsSync(backupPath)) {
    fs.writeFileSync(backupPath, content);
    console.log(`✅ Backed up: ${file} → ${file}.mongodb.backup`);
  }

  // Replace model imports
  content = content.replace(
    /const \{([^}]+)\} = require\('\.\.\/models'\);/g,
    "const {$1} = require('../models/pg');"
  );

  // Replace helper imports
  content = content.replace(
    /const \{([^}]+)\} = require\('\.\.\/utils\/mongodb-helpers'\);/g,
    "const {$1} = require('../utils/pg-helpers');"
  );

  // Replace mongoose-specific patterns
  content = content.replace(/new (\w+)\(/g, '$1.create(');
  content = content.replace(/\._id/g, '.id');
  content = content.replace(/toObjectId\(/g, 'parseInt(');

  // Write updated content
  fs.writeFileSync(filePath, content);
  console.log(`✅ Updated: ${file}`);
});

console.log('\n✅ Route migration completed!');
console.log('\n📝 Next steps:');
console.log('1. Review the updated route files');
console.log('2. Test each endpoint');
console.log('3. Fix any remaining MongoDB-specific code manually');
console.log('4. Remove .mongodb.backup files once everything works');
const fs = require('fs');
const path = require('path');

const filesToFix = [
  'server.js',
  'backend/render.yaml',
  'backend/package.json',
  'postcss.config.js',
  'public/robots.txt',
  'README.md',
  'render.yaml',
  'src/App.css'
];

function fixMergeConflict(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Remove merge conflict markers and keep HEAD version
    const lines = content.split('\n');
    const result = [];
    let inConflict = false;
    let inHead = false;
    
    for (const line of lines) {
      if (line.startsWith('<<<<<<< HEAD')) {
        inConflict = true;
        inHead = true;
        continue;
      }
      if (line.startsWith('=======') && inConflict) {
        inHead = false;
        continue;
      }
      if (line.startsWith('>>>>>>> ') && inConflict) {
        inConflict = false;
        inHead = false;
        continue;
      }
      
      if (!inConflict || inHead) {
        result.push(line);
      }
    }
    
    fs.writeFileSync(filePath, result.join('\n'), 'utf8');
    console.log(`✅ Fixed: ${filePath}`);
  } catch (error) {
    console.error(`❌ Error fixing ${filePath}:`, error.message);
  }
}

console.log('Fixing merge conflicts...\n');
filesToFix.forEach(fixMergeConflict);
console.log('\n✅ All merge conflicts resolved!');

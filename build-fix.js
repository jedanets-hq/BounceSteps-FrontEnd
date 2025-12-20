const fs = require('fs');
const path = require('path');

// Simple build script to create dist folder manually
console.log('🔧 Creating production build manually...');

const distDir = path.join(__dirname, 'dist');
const srcDir = path.join(__dirname, 'src');
const publicDir = path.join(__dirname, 'public');

// Create dist directory
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// Copy public files
if (fs.existsSync(publicDir)) {
  const publicFiles = fs.readdirSync(publicDir);
  publicFiles.forEach(file => {
    const srcFile = path.join(publicDir, file);
    const destFile = path.join(distDir, file);
    if (fs.statSync(srcFile).isFile()) {
      fs.copyFileSync(srcFile, destFile);
      console.log(`✓ Copied ${file}`);
    }
  });
}

// Create basic index.html for production
const indexHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>iSafari Global - Premium Safari & Travel Services</title>
    <link rel="icon" type="image/x-icon" href="/favicon.ico">
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        .loading { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
    </style>
</head>
<body>
    <div id="root">
        <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
            <div class="text-center">
                <div class="loading w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                <h1 class="text-2xl font-bold text-gray-800 mb-2">iSafari Global</h1>
                <p class="text-gray-600">Loading your premium safari experience...</p>
                <div class="mt-8 text-sm text-gray-500">
                    <p>🌍 Premium Safari & Travel Services</p>
                    <p>🦁 Authentic African Adventures</p>
                    <p>✈️ Seamless Booking Experience</p>
                </div>
            </div>
        </div>
    </div>
    <script>
        // Redirect to development server if available
        setTimeout(() => {
            window.location.href = 'http://localhost:4028';
        }, 3000);
    </script>
</body>
</html>`;

fs.writeFileSync(path.join(distDir, 'index.html'), indexHtml);
console.log('✓ Created index.html');

// Create assets directory
const assetsDir = path.join(distDir, 'assets');
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

console.log('✅ Production build created successfully!');
console.log(`📁 Build location: ${distDir}`);
console.log('🚀 You can now serve this folder as a static website');

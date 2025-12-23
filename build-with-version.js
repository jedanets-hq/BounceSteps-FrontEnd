#!/usr/bin/env node

/**
 * Build script that injects version information
 * This replaces placeholders in index.html with actual build info
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Get git commit hash (or generate one if not in git repo)
function getBuildHash() {
  try {
    return execSync('git rev-parse --short HEAD').toString().trim();
  } catch (error) {
    // If not in git repo, use timestamp-based hash
    return Date.now().toString(36);
  }
}

// Get current timestamp
function getBuildTime() {
  return new Date().toISOString();
}

// Main build process
async function build() {
  console.log('\n🔨 Starting build with version injection...\n');
  
  const buildHash = getBuildHash();
  const buildTime = getBuildTime();
  
  console.log(`📦 Build Hash: ${buildHash}`);
  console.log(`⏰ Build Time: ${buildTime}\n`);
  
  // Set environment variables for the build
  process.env.BUILD_HASH = buildHash;
  process.env.BUILD_TIME = buildTime;
  process.env.GIT_COMMIT = buildHash;
  
  // Run Vite build
  console.log('🏗️  Running Vite build...\n');
  execSync('vite build', { stdio: 'inherit' });
  
  // Replace placeholders in index.html
  console.log('\n📝 Injecting version into index.html...');
  const indexPath = path.join(__dirname, 'dist', 'index.html');
  
  if (fs.existsSync(indexPath)) {
    let html = fs.readFileSync(indexPath, 'utf8');
    
    // Replace placeholders
    html = html.replace(/__BUILD_HASH__/g, buildHash);
    html = html.replace(/__BUILD_TIME__/g, buildTime);
    
    fs.writeFileSync(indexPath, html);
    console.log('✅ Version injected successfully');
  } else {
    console.error('❌ dist/index.html not found!');
    process.exit(1);
  }
  
  // Verify version.json was created
  const versionPath = path.join(__dirname, 'dist', 'version.json');
  if (fs.existsSync(versionPath)) {
    const version = JSON.parse(fs.readFileSync(versionPath, 'utf8'));
    console.log('\n✅ version.json created:');
    console.log(JSON.stringify(version, null, 2));
  } else {
    console.error('\n❌ version.json not found!');
    process.exit(1);
  }
  
  console.log('\n🎉 Build completed successfully!\n');
}

// Run build
build().catch(error => {
  console.error('\n❌ Build failed:', error);
  process.exit(1);
});
#!/usr/bin/env node
/**
 * ═══════════════════════════════════════════════════════════════════════════
 * 🔍 ISAFARI GLOBAL - SYSTEM VERIFICATION SCRIPT
 * ═══════════════════════════════════════════════════════════════════════════
 * This script verifies that all parts of the iSafari system are properly
 * configured and connected to MongoDB
 * ═══════════════════════════════════════════════════════════════════════════
 */

const fs = require('fs');
const path = require('path');

console.log('\n═══════════════════════════════════════════════════════════════════════════');
console.log('🔍 iSAFARI GLOBAL - SYSTEM VERIFICATION');
console.log('═══════════════════════════════════════════════════════════════════════════\n');

let allChecks = true;

// Check 1: Backend .env file exists
console.log('📋 Check 1: Backend Configuration');
console.log('─'.repeat(50));
const envPath = path.join(__dirname, 'backend', '.env');
if (fs.existsSync(envPath)) {
    console.log('✅ backend\\.env file exists');

    // Check if password is set
    const envContent = fs.readFileSync(envPath, 'utf8');
    if (envContent.includes('<db_password>')) {
        console.log('⚠️  WARNING: MongoDB password not set!');
        console.log('   Run: .\\setup-mongodb-password.ps1');
        allChecks = false;
    } else {
        console.log('✅ MongoDB password is set');
    }

    // Check for required variables
    const requiredVars = ['MONGODB_URI', 'MONGODB_DB_NAME', 'JWT_SECRET', 'PORT'];
    requiredVars.forEach(varName => {
        if (envContent.includes(varName)) {
            console.log(`✅ ${varName} is defined`);
        } else {
            console.log(`❌ ${varName} is missing`);
            allChecks = false;
        }
    });
} else {
    console.log('❌ backend\\.env file not found');
    allChecks = false;
}

// Check 2: Backend dependencies
console.log('\n📦 Check 2: Backend Dependencies');
console.log('─'.repeat(50));
const backendPackageJson = path.join(__dirname, 'backend', 'package.json');
const backendNodeModules = path.join(__dirname, 'backend', 'node_modules');
if (fs.existsSync(backendPackageJson)) {
    console.log('✅ backend\\package.json exists');
    if (fs.existsSync(backendNodeModules)) {
        console.log('✅ backend\\node_modules exists');
    } else {
        console.log('⚠️  WARNING: backend\\node_modules not found');
        console.log('   Run: cd backend && npm install');
        allChecks = false;
    }
} else {
    console.log('❌ backend\\package.json not found');
    allChecks = false;
}

// Check 3: Frontend dependencies
console.log('\n📦 Check 3: Frontend Dependencies');
console.log('─'.repeat(50));
const frontendPackageJson = path.join(__dirname, 'package.json');
const frontendNodeModules = path.join(__dirname, 'node_modules');
if (fs.existsSync(frontendPackageJson)) {
    console.log('✅ package.json exists');
    if (fs.existsSync(frontendNodeModules)) {
        console.log('✅ node_modules exists');
    } else {
        console.log('⚠️  WARNING: node_modules not found');
        console.log('   Run: npm install');
        allChecks = false;
    }
} else {
    console.log('❌ package.json not found');
    allChecks = false;
}

// Check 4: Admin Portal dependencies
console.log('\n📦 Check 4: Admin Portal Dependencies');
console.log('─'.repeat(50));
const adminPackageJson = path.join(__dirname, 'admin-portal', 'package.json');
const adminNodeModules = path.join(__dirname, 'admin-portal', 'node_modules');
if (fs.existsSync(adminPackageJson)) {
    console.log('✅ admin-portal\\package.json exists');
    if (fs.existsSync(adminNodeModules)) {
        console.log('✅ admin-portal\\node_modules exists');
    } else {
        console.log('⚠️  WARNING: admin-portal\\node_modules not found');
        console.log('   Run: cd admin-portal && npm install');
    }
} else {
    console.log('❌ admin-portal\\package.json not found');
}

// Check 5: MongoDB Models
console.log('\n📊 Check 5: MongoDB Models');
console.log('─'.repeat(50));
const modelsDir = path.join(__dirname, 'backend', 'models');
if (fs.existsSync(modelsDir)) {
    const models = fs.readdirSync(modelsDir).filter(f => f.endsWith('.js'));
    console.log(`✅ Found ${models.length} model files:`);
    models.forEach(model => {
        console.log(`   - ${model}`);
    });
} else {
    console.log('❌ backend\\models directory not found');
    allChecks = false;
}

// Check 6: MongoDB Configuration
console.log('\n🔧 Check 6: MongoDB Configuration');
console.log('─'.repeat(50));
const mongoConfigPath = path.join(__dirname, 'backend', 'config', 'mongodb.js');
if (fs.existsSync(mongoConfigPath)) {
    console.log('✅ backend\\config\\mongodb.js exists');
    const mongoConfig = fs.readFileSync(mongoConfigPath, 'utf8');
    if (mongoConfig.includes('mongoose')) {
        console.log('✅ Mongoose is configured');
    }
    if (mongoConfig.includes('MongoClient')) {
        console.log('✅ Native MongoDB driver is configured');
    }
} else {
    console.log('❌ backend\\config\\mongodb.js not found');
    allChecks = false;
}

// Check 7: Routes
console.log('\n🛣️  Check 7: API Routes');
console.log('─'.repeat(50));
const routesDir = path.join(__dirname, 'backend', 'routes');
if (fs.existsSync(routesDir)) {
    const routes = fs.readdirSync(routesDir).filter(f => f.endsWith('.js'));
    console.log(`✅ Found ${routes.length} route files:`);
    const requiredRoutes = ['auth.js', 'users.js', 'services.js', 'bookings.js', 'payments.js', 'admin.js'];
    requiredRoutes.forEach(route => {
        if (routes.includes(route)) {
            console.log(`   ✅ ${route}`);
        } else {
            console.log(`   ❌ ${route} missing`);
            allChecks = false;
        }
    });
} else {
    console.log('❌ backend\\routes directory not found');
    allChecks = false;
}

// Check 8: Test Scripts
console.log('\n🧪 Check 8: Test Scripts');
console.log('─'.repeat(50));
const testScript = path.join(__dirname, 'backend', 'test-new-mongodb-connection.js');
if (fs.existsSync(testScript)) {
    console.log('✅ test-new-mongodb-connection.js exists');
} else {
    console.log('❌ test-new-mongodb-connection.js not found');
}

// Check 9: Setup Scripts
console.log('\n⚙️  Check 9: Setup Scripts');
console.log('─'.repeat(50));
const setupScripts = [
    'setup-mongodb-password.ps1',
    'setup-mongodb-password.bat',
    'start-with-new-mongodb.bat'
];
setupScripts.forEach(script => {
    if (fs.existsSync(path.join(__dirname, script))) {
        console.log(`✅ ${script}`);
    } else {
        console.log(`⚠️  ${script} not found`);
    }
});

// Check 10: Documentation
console.log('\n📚 Check 10: Documentation');
console.log('─'.repeat(50));
const docs = [
    'MONGODB-INTEGRATION-COMPLETE-GUIDE.md',
    'MONGODB-INTEGRATION-SUMMARY.md',
    'MONGODB-QUICK-START.md'
];
docs.forEach(doc => {
    if (fs.existsSync(path.join(__dirname, doc))) {
        console.log(`✅ ${doc}`);
    } else {
        console.log(`⚠️  ${doc} not found`);
    }
});

// Final Summary
console.log('\n═══════════════════════════════════════════════════════════════════════════');
console.log('📊 VERIFICATION SUMMARY');
console.log('═══════════════════════════════════════════════════════════════════════════\n');

if (allChecks) {
    console.log('✅ All critical checks passed!');
    console.log('\n🚀 Next Steps:');
    console.log('1. Set MongoDB password: .\\setup-mongodb-password.ps1');
    console.log('2. Test connection: cd backend && node test-new-mongodb-connection.js');
    console.log('3. Start system: .\\start-with-new-mongodb.bat');
} else {
    console.log('⚠️  Some checks failed. Please review the issues above.');
    console.log('\n📝 Common fixes:');
    console.log('1. Install backend dependencies: cd backend && npm install');
    console.log('2. Install frontend dependencies: npm install');
    console.log('3. Install admin dependencies: cd admin-portal && npm install');
    console.log('4. Set MongoDB password: .\\setup-mongodb-password.ps1');
}

console.log('\n═══════════════════════════════════════════════════════════════════════════\n');

process.exit(allChecks ? 0 : 1);

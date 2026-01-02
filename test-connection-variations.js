/**
 * MongoDB Connection String Tester
 * 
 * Hii script inasaidia kutest connection strings tofauti
 * ili kuona ni ipi inafanya kazi
 */

const { MongoClient, ServerApiVersion } = require('mongodb');

// Test different connection string variations
const connectionStrings = [
    {
        name: 'Option 1: Password = @Jctnftr01 (URL encoded as %40Jctnftr01)',
        uri: 'mongodb+srv://mfungojoctan01_db_user:%40Jctnftr01@cluster0.yvx6dyz.mongodb.net/iSafari-Global?retryWrites=true&w=majority&appName=Cluster0'
    },
    {
        name: 'Option 2: Password = Jctnftr01 (without @)',
        uri: 'mongodb+srv://mfungojoctan01_db_user:Jctnftr01@cluster0.yvx6dyz.mongodb.net/iSafari-Global?retryWrites=true&w=majority&appName=Cluster0'
    },
    {
        name: 'Option 3: Password = %40Jctnftr01 (double encoded)',
        uri: 'mongodb+srv://mfungojoctan01_db_user:%2540Jctnftr01@cluster0.yvx6dyz.mongodb.net/iSafari-Global?retryWrites=true&w=majority&appName=Cluster0'
    }
];

async function testConnection(connectionString) {
    const client = new MongoClient(connectionString.uri, {
        serverApi: {
            version: ServerApiVersion.v1,
            strict: true,
            deprecationErrors: true,
        },
        serverSelectionTimeoutMS: 5000
    });

    try {
        console.log(`\n🔍 Testing: ${connectionString.name}`);
        console.log('⏳ Connecting...');

        await client.connect();
        await client.db("admin").command({ ping: 1 });

        console.log('✅ SUCCESS! This connection string works!\n');
        console.log('📋 Use this connection string:');
        console.log(connectionString.uri);
        console.log('');

        return true;
    } catch (error) {
        console.log(`❌ FAILED: ${error.message}\n`);
        return false;
    } finally {
        await client.close();
    }
}

async function runTests() {
    console.log('═══════════════════════════════════════════════════════');
    console.log('🧪 MongoDB Connection String Tester');
    console.log('═══════════════════════════════════════════════════════');
    console.log('\nTesting different connection string variations...\n');

    let successCount = 0;

    for (const connStr of connectionStrings) {
        const success = await testConnection(connStr);
        if (success) {
            successCount++;
        }
        // Wait a bit between tests
        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log('═══════════════════════════════════════════════════════');
    console.log(`\n📊 Results: ${successCount}/${connectionStrings.length} connection(s) successful\n`);

    if (successCount === 0) {
        console.log('❌ None of the connection strings worked!');
        console.log('\n🔧 Please verify:');
        console.log('1. Username is correct: mfungojoctan01_db_user');
        console.log('2. Password is correct (check MongoDB Atlas)');
        console.log('3. Cluster URL is correct: cluster0.yvx6dyz.mongodb.net');
        console.log('4. Your IP address is whitelisted in MongoDB Atlas');
        console.log('5. Database user has proper permissions');
        console.log('\n💡 To check your connection string:');
        console.log('   - Go to MongoDB Atlas → Clusters → Connect');
        console.log('   - Choose "Connect your application"');
        console.log('   - Copy the connection string');
        console.log('');
    }
}

runTests();

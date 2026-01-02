/**
 * Test MongoDB Connection - Direct from C Code
 * Using exact connection string from the C code provided
 */

const { MongoClient, ServerApiVersion } = require('mongodb');

// Exact connection string from C code (with URL encoding for @)
const connectionStrings = [
    {
        name: 'From C Code - No database in URI',
        uri: 'mongodb+srv://mfungojoctan01_db_user:%40Jctnftr01@cluster0.yvx6dyz.mongodb.net/?appName=Cluster0',
        dbName: 'iSafari-Global'
    },
    {
        name: 'From C Code - With database in URI',
        uri: 'mongodb+srv://mfungojoctan01_db_user:%40Jctnftr01@cluster0.yvx6dyz.mongodb.net/iSafari-Global?appName=Cluster0',
        dbName: 'iSafari-Global'
    },
    {
        name: 'With retryWrites and w=majority',
        uri: 'mongodb+srv://mfungojoctan01_db_user:%40Jctnftr01@cluster0.yvx6dyz.mongodb.net/iSafari-Global?retryWrites=true&w=majority&appName=Cluster0',
        dbName: 'iSafari-Global'
    }
];

async function testConnection(config) {
    const client = new MongoClient(config.uri, {
        serverApi: {
            version: ServerApiVersion.v1,
            strict: true,
            deprecationErrors: true,
        },
        serverSelectionTimeoutMS: 10000
    });

    try {
        console.log(`\n🔍 Testing: ${config.name}`);
        console.log(`📊 Database: ${config.dbName}`);
        console.log('⏳ Connecting...');

        await client.connect();
        console.log('✅ Connected to MongoDB Atlas!');

        // Ping the database
        await client.db("admin").command({ ping: 1 });
        console.log('🏓 Ping successful!');

        // List all databases
        const adminDb = client.db().admin();
        const dbs = await adminDb.listDatabases();

        console.log('\n📚 Available Databases:');
        dbs.databases.forEach(db => {
            const size = (db.sizeOnDisk / 1024 / 1024).toFixed(2);
            console.log(`   - ${db.name} (${size} MB)`);
        });

        // Check our specific database
        const ourDb = client.db(config.dbName);
        const collections = await ourDb.listCollections().toArray();

        console.log(`\n📦 Collections in '${config.dbName}':`);
        if (collections.length === 0) {
            console.log('   (No collections yet - database is empty)');
        } else {
            for (const col of collections) {
                const stats = await ourDb.collection(col.name).stats();
                console.log(`   - ${col.name} (${stats.count} documents)`);
            }
        }

        console.log('\n✅ SUCCESS! This connection works!\n');
        console.log('📋 Working Connection String:');
        console.log(config.uri);
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
    console.log('🧪 MongoDB Connection Test - From C Code');
    console.log('═══════════════════════════════════════════════════════');

    let successCount = 0;

    for (const config of connectionStrings) {
        const success = await testConnection(config);
        if (success) {
            successCount++;
            break; // Stop on first success
        }
        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log('═══════════════════════════════════════════════════════');
    console.log(`\n📊 Results: ${successCount}/${connectionStrings.length} connection(s) successful\n`);

    if (successCount === 0) {
        console.log('❌ All connection attempts failed!');
        console.log('\n🔧 Please verify in MongoDB Atlas:');
        console.log('1. Go to: https://cloud.mongodb.com/');
        console.log('2. Select your cluster');
        console.log('3. Click "Database Access" → Check user exists');
        console.log('4. Click "Network Access" → Add IP: 0.0.0.0/0 (for testing)');
        console.log('5. Click "Connect" → Get correct connection string');
        console.log('');
    }
}

runTests();

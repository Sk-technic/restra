import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

import mongoose from 'mongoose';
import { ensureAdminUser } from '../src/lib/ensure-admin';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/restra_db';

async function clearDatabase() {
  console.log('🗑️  Connecting to MongoDB to clear all collections...');
  console.log(`📡 URI: ${MONGODB_URI}`);

  try {
    await mongoose.connect(MONGODB_URI);
    const db = mongoose.connection.db;

    if (!db) {
      throw new Error('Could not establish database connection handle.');
    }

    const collections = await db.listCollections().toArray();

    if (collections.length === 0) {
      console.log('ℹ️  Database is already empty (no collections found).');
    } else {
      console.log(`Found ${collections.length} collection(s) to clear:`);

      for (const collInfo of collections) {
        const collName = collInfo.name;
        // Skip system collections
        if (collName.startsWith('system.')) continue;

        const collection = db.collection(collName);
        const count = await collection.countDocuments();
        await collection.deleteMany({});
        console.log(`  ❌ Cleared collection [${collName}] - deleted ${count} document(s).`);
      }

      console.log('\n✨ All data successfully cleared from database!');
    }

    // Auto-create Admin user so the application remains instantly accessible
    console.log('\n👑 Ensuring default Admin user exists...');
    await ensureAdminUser();
    console.log('✅ Admin user verified & ready.');

  } catch (error) {
    console.error('❌ Error while clearing database:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Database connection closed.\n');
    process.exit(0);
  }
}

clearDatabase();

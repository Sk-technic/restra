import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

import { seedDatabase } from '../src/lib/seed';

async function runSeed() {
  console.log('🌱 Starting Restaurant Management System database seeding...');
  try {
    const res = await seedDatabase();
    console.log('✅ ' + res.message);
    console.log('\nDefault Accounts Created:');
    console.log('----------------------------------------------------');
    console.log('👑 Admin Account:    admin@restra.com   / admin123');
    console.log('👔 General Manager:  manager@restra.com / manager123');
    console.log('🚪 Floor Manager:    floor@restra.com   / floor123');
    console.log('----------------------------------------------------');
    process.exit(0);
  } catch (error: any) {
    console.error('❌ Database seeding failed:', error.message);
    process.exit(1);
  }
}

runSeed();

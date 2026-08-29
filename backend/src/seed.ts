import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

import { connectDB } from './config/db.js';
import { seedDemoUser } from './services/seed.service.js';
import mongoose from 'mongoose';

async function run() {
  try {
    await connectDB();
    const result = await seedDemoUser();
    console.log('\n--- Seed Complete ---');
    console.log(JSON.stringify(result, null, 2));
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  }
}

run();

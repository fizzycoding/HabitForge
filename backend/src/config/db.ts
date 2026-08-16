import mongoose from 'mongoose';
import dns from 'node:dns';
import { env } from './env.js';

try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {
}

export async function connectDB(): Promise<void> {
  try {
    const conn = await mongoose.connect(env.MONGODB_URI);
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('MongoDB connection failed:', error);
    process.exit(1);
  }
}


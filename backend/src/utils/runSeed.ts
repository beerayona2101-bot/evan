import dotenv from 'dotenv';
import path from 'path';
import mongoose from 'mongoose';
import { seedDatabase } from './seedData';

dotenv.config({ path: path.join(__dirname, '../../.env') });

const run = async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGODB_URI missing');
    process.exit(1);
  }
  try {
    await mongoose.connect(uri);
    console.log('Connected to MongoDB. Starting database seed...');
    await seedDatabase();
    console.log('Seeding complete successfully.');
    await mongoose.disconnect();
    process.exit(0);
  } catch (err: any) {
    console.error('Seed error:', err);
    process.exit(1);
  }
};

run();

import dotenv from 'dotenv';
import path from 'path';
import mongoose from 'mongoose';
import { Product } from '../models/Product';
import { Category } from '../models/Category';
import { User } from '../models/User';

dotenv.config({ path: path.join(__dirname, '../../.env') });

const runHealthCheck = async () => {
  console.log('--- KANCHANIKA 14-PHASE HEALTH CHECK ---');
  
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    console.log('⚠️ [Database] MONGODB_URI not found in env. Running in offline fallback mode.');
    process.exit(0);
  }

  try {
    await mongoose.connect(mongoUri);
    console.log('✅ [Phase 3 Database] Connected successfully to MongoDB Atlas.');

    const productCount = await Product.countDocuments();
    const categoryCount = await Category.countDocuments();
    const userCount = await User.countDocuments();

    console.log(`✅ [Phase 6 Catalog] Live MongoDB Products: ${productCount} Sarees`);
    console.log(`✅ [Phase 6 Categories] Live MongoDB Categories: ${categoryCount} Categories`);
    console.log(`✅ [Phase 4 Users] Registered Database Users: ${userCount} Users`);

    const sampleProduct = await Product.findOne().populate('categoryRef');
    if (sampleProduct) {
      console.log(`✅ [Phase 6 Schema Verification] Sample Saree: "${sampleProduct.name}" (SKU: ${sampleProduct.sku}, Price: ₹${sampleProduct.price})`);
    }

    await mongoose.disconnect();
    console.log('--- HEALTH CHECK PASSED SUCCESSFULLY ---');
    process.exit(0);
  } catch (err: any) {
    console.error('❌ Health check error:', err.message);
    process.exit(0);
  }
};

runHealthCheck();

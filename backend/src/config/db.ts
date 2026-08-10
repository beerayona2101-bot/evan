import mongoose from 'mongoose';
import dns from 'dns';

// Configure DNS resolution servers for reliable SRV record resolution
try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
  if (dns.setDefaultResultOrder) {
    dns.setDefaultResultOrder('ipv4first');
  }
} catch (dnsErr: any) {
  console.warn('DNS server configuration notice:', dnsErr.message);
}

export const connectDB = async (): Promise<void> => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/evan_db';
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 3000,
    });
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.warn(`[Database] MongoDB Offline / Fallback Mode: ${(error as Error).message}`);
  }
};

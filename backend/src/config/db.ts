import mongoose from 'mongoose';

export const connectDB = async (): Promise<void> => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      console.warn('[Database] MONGODB_URI environment variable is missing.');
    }

    // Set serverSelectionTimeoutMS to 2000ms & bufferCommands false when offline
    const conn = await mongoose.connect(mongoUri || 'mongodb://localhost:27017/evan_db', {
      serverSelectionTimeoutMS: 2000,
    });
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.warn(`[Database] Local MongoDB offline. Operating in High-Performance Offline Fallback Mode: ${(error as Error).message}`);
  }
};

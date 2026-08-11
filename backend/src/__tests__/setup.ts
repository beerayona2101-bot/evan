import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

let mongoServer: MongoMemoryServer;

jest.setTimeout(60000);

beforeAll(async () => {
  process.env.JWT_SECRET = 'test_secret_key_123456789_kanchanika';
  process.env.NODE_ENV = 'test';

  mongoServer = await MongoMemoryServer.create({
    binary: {
      checkMD5: false,
    },
  });
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
}, 60000);

afterEach(async () => {
  if (mongoose.connection.db) {
    const collections = await mongoose.connection.db.collections();
    for (const collection of collections) {
      await collection.deleteMany({});
    }
  }
});

afterAll(async () => {
  if (mongoServer) {
    await mongoose.disconnect();
    await mongoServer.stop();
  }
});

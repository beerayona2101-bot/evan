import dotenv from 'dotenv';
import path from 'path';
import { v2 as cloudinary } from 'cloudinary';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

async function testCloudinaryUpload() {
  const cloud_name = process.env.CLOUDINARY_CLOUD_NAME;
  const api_key = process.env.CLOUDINARY_API_KEY;
  const api_secret = process.env.CLOUDINARY_API_SECRET;

  console.log('[Cloudinary Test] Testing upload with credentials:');
  console.log(`Cloud Name: ${cloud_name}`);
  console.log(`API Key: ${api_key}`);

  cloudinary.config({
    cloud_name,
    api_key,
    api_secret,
  });

  const sampleBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

  try {
    const res = await cloudinary.uploader.upload(sampleBase64, {
      folder: 'evan_test',
    });
    console.log('✅ SUCCESS! Cloudinary image uploaded:', res.secure_url);
  } catch (error) {
    console.error('❌ Cloudinary Upload Error:', (error as Error).message);
  }
}

testCloudinaryUpload();

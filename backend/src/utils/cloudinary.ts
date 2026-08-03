import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary SDK from process.env
export const configureCloudinary = () => {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'evan_collections',
    api_key: process.env.CLOUDINARY_API_KEY || 'your_cloudinary_api_key',
    api_secret: process.env.CLOUDINARY_API_SECRET || 'your_cloudinary_api_secret',
  });
  return cloudinary;
};

// Check if valid credentials provided
export const isCloudinaryConfigured = (): boolean => {
  const name = process.env.CLOUDINARY_CLOUD_NAME;
  const key = process.env.CLOUDINARY_API_KEY;
  const secret = process.env.CLOUDINARY_API_SECRET;

  return (
    Boolean(name && key && secret) &&
    name !== 'your_cloud_name' &&
    key !== 'your_cloudinary_api_key' &&
    secret !== 'your_cloudinary_api_secret'
  );
};

/**
 * Upload Image to Cloudinary (Supports Base64 Data URL, Local File Path, or HTTP URL)
 */
export const uploadImageToCloudinary = async (
  fileData: string,
  folder = 'evan_sarees'
): Promise<{ url: string; public_id: string }> => {
  try {
    configureCloudinary();

    // If Cloudinary credentials are not configured yet, return fileData as fallback URL/base64
    if (!isCloudinaryConfigured()) {
      console.log('[Cloudinary] Credentials not configured in .env. Returning base64/URL payload.');
      return { url: fileData, public_id: `local_${Date.now()}` };
    }

    const result = await cloudinary.uploader.upload(fileData, {
      folder,
      resource_type: 'auto',
      transformation: [{ quality: 'auto', fetch_format: 'auto' }],
    });

    console.log(`[Cloudinary] Uploaded image successfully: ${result.secure_url}`);
    return {
      url: result.secure_url,
      public_id: result.public_id,
    };
  } catch (error) {
    console.error('[Cloudinary Error] Failed to upload image:', (error as Error).message);
    // Fallback gracefully
    return { url: fileData, public_id: `fallback_${Date.now()}` };
  }
};

/**
 * Delete Image from Cloudinary by public_id
 */
export const deleteImageFromCloudinary = async (public_id: string): Promise<boolean> => {
  try {
    if (!isCloudinaryConfigured()) return true;
    configureCloudinary();
    await cloudinary.uploader.destroy(public_id);
    console.log(`[Cloudinary] Deleted image public_id: ${public_id}`);
    return true;
  } catch (error) {
    console.error('[Cloudinary Error] Failed to delete image:', (error as Error).message);
    return false;
  }
};

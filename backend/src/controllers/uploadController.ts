import { Request, Response } from 'express';
import { uploadImageToCloudinary } from '../utils/cloudinary';

// POST /api/upload
export const uploadImage = async (req: Request, res: Response): Promise<void> => {
  try {
    const { image, folder } = req.body;

    if (!image) {
      res.status(400).json({ message: 'No image payload provided' });
      return;
    }

    const result = await uploadImageToCloudinary(image, folder || 'evan_sarees');
    res.status(200).json({
      success: true,
      url: result.url,
      imageUrl: result.url,
      public_id: result.public_id,
    });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

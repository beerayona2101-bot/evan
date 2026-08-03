import { Response } from 'express';
import { Review } from '../models/Review';
import { Product } from '../models/Product';
import { AuthRequest } from '../middleware/authMiddleware';
import { emitRealtimeEvent } from '../config/socket';

export const createProductReview = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { rating, comment, productId: bodyProductId } = req.body;
    const productId = req.params.productId || bodyProductId;
    const product = await Product.findById(productId);

    if (product) {
      const alreadyReviewed = await Review.findOne({ product: productId, user: req.user?._id });
      if (alreadyReviewed) {
        res.status(400).json({ message: 'Product already reviewed' });
        return;
      }

      const review = new Review({
        user: req.user?._id,
        userName: req.user?.name || 'Customer',
        userAvatar: req.user?.avatar || '',
        product: productId,
        rating: Number(rating),
        comment,
      });

      await review.save();
      const reviews = await Review.find({ product: productId });
      product.numReviews = reviews.length;
      product.rating = reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length;

      await product.save();
      emitRealtimeEvent('reviewUpdated', { productId, review, numReviews: product.numReviews, rating: product.rating });
      res.status(201).json(review);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

export const getProductReviews = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const reviews = await Review.find({ product: req.params.productId }).sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

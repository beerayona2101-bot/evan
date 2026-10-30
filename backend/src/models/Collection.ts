import mongoose, { Document, Schema } from 'mongoose';

export interface ICollection extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  slug: string;
  description: string;
  coverImage: string;
  bannerImage?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';
  featured: boolean;
  displayOrder: number;
  productCount: number;
  seoTitle?: string;
  seoDescription?: string;
  deletedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const CollectionSchema = new Schema<ICollection>(
  {
    name: { type: String, required: true, unique: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true },
    description: { type: String, default: '' },
    coverImage: { type: String, default: '' },
    bannerImage: { type: String, default: '' },
    status: {
      type: String,
      enum: ['ACTIVE', 'INACTIVE', 'ARCHIVED'],
      default: 'ACTIVE',
    },
    featured: { type: Boolean, default: false },
    displayOrder: { type: Number, default: 0 },
    productCount: { type: Number, default: 0 },
    seoTitle: { type: String, default: '' },
    seoDescription: { type: String, default: '' },
    deletedAt: { type: Date, default: null },
  },
  {
    timestamps: true,
  }
);

CollectionSchema.index({ name: 'text', slug: 'text' });

export const Collection = mongoose.model<ICollection>('Collection', CollectionSchema);

import mongoose, { Document, Schema } from 'mongoose';

export interface ICategory extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  slug: string;
  description: string;
  image: string;
  banner?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'HIDDEN' | 'ARCHIVED';
  isLive: boolean;
  featured: boolean;
  displayOrder: number;
  productCount: number;
  seoTitle?: string;
  seoDescription?: string;
  parentCategory?: mongoose.Types.ObjectId;
  createdBy: string;
  deletedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const CategorySchema = new Schema<ICategory>(
  {
    name: { type: String, required: true, unique: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true },
    description: { type: String, default: '' },
    image: { type: String, required: true },
    banner: { type: String, default: '' },
    status: {
      type: String,
      enum: ['ACTIVE', 'INACTIVE', 'HIDDEN', 'ARCHIVED'],
      default: 'ACTIVE',
    },
    isLive: { type: Boolean, default: true },
    featured: { type: Boolean, default: false },
    displayOrder: { type: Number, default: 0 },
    productCount: { type: Number, default: 0 },
    seoTitle: { type: String, default: '' },
    seoDescription: { type: String, default: '' },
    parentCategory: { type: Schema.Types.ObjectId, ref: 'Category', default: null },
    createdBy: { type: String, default: 'Admin' },
    deletedAt: { type: Date, default: null },
  },
  {
    timestamps: true,
  }
);

CategorySchema.index({ name: 'text', slug: 'text', description: 'text' });

export const Category = mongoose.model<ICategory>('Category', CategorySchema);

import mongoose, { Schema, Document } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  slug: string;
  brand: string;
  description: string;
  shortDescription: string;
  detailedDescription: string;
  price: number;
  discountPrice?: number;
  mrp: number;
  discountPercentage: number;
  category: string;
  fit: string;
  sizes: string[];
  colors: string[];
  material: string;
  sleeveType: string;
  neckType: string;
  weight: string;
  countryOfOrigin: string;
  washCare: string;
  sku: string;
  stock: number;
  images: string[];
  hoverImage?: string;
  galleryImages?: string[];
  rating: number;
  numReviews: number;
  tags: string[];
  frequentlyBoughtTogether?: string[];
  isFeatured: boolean;
  trending: boolean;
  bestSeller: boolean;
  newArrival: boolean;
  fabric: string;
  blousePiece: string;
  borderType: string;
  palluStyle: string;
  workType: string;
  occasion: string;
  sareeLength: string;
  sareeWidth: string;
  sareeWeight: string;
  pattern: string;
  status: 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
}

const productSchema: Schema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true },
    brand: { type: String, default: 'EVAN COLLECTIONS' },
    description: { type: String, required: true },
    shortDescription: { type: String, default: '' },
    detailedDescription: { type: String, default: '' },
    price: { type: Number, required: true },
    discountPrice: { type: Number, default: 0 },
    mrp: { type: Number, required: true },
    discountPercentage: { type: Number, default: 0 },
    category: { type: String, required: true, index: true },
    fit: { type: String, default: 'Saree' },
    sizes: { type: [String], default: ['Free Size'] },
    colors: { type: [String], required: true },
    material: { type: String, default: 'Pure Handloom Silk' },
    sleeveType: { type: String, default: 'Unstitched Blouse' },
    neckType: { type: String, default: 'N/A' },
    weight: { type: String, default: '650g' },
    countryOfOrigin: { type: String, default: 'India' },
    washCare: { type: String, default: 'Dry Clean Only. Store in soft muslin cloth.' },
    sku: { type: String, required: true, unique: true },
    stock: { type: Number, required: true, default: 25 },
    images: { type: [String], required: true },
    hoverImage: { type: String, default: '' },
    galleryImages: { type: [String], default: [] },
    rating: { type: Number, default: 4.9 },
    numReviews: { type: Number, default: 0 },
    tags: { type: [String], default: [] },
    frequentlyBoughtTogether: { type: [String], default: [] },
    isFeatured: { type: Boolean, default: false },
    trending: { type: Boolean, default: false },
    bestSeller: { type: Boolean, default: false },
    newArrival: { type: Boolean, default: false },
    fabric: { type: String, default: 'Pure Kanchipuram Silk' },
    blousePiece: { type: String, default: 'Includes Unstitched Blouse Piece (0.8m)' },
    borderType: { type: String, default: 'Heavy Zari Temple Border' },
    palluStyle: { type: String, default: 'Rich Zari Rich Woven Pallu' },
    workType: { type: String, default: 'Handwoven Zari Weave' },
    occasion: { type: String, default: 'Wedding & Festive' },
    sareeLength: { type: String, default: '5.5 Meters' },
    sareeWidth: { type: String, default: '1.15 Meters' },
    sareeWeight: { type: String, default: '650 Grams' },
    pattern: { type: String, default: 'Jacquard Zari Brocade' },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  },
  {
    timestamps: true,
  }
);

productSchema.index({ name: 'text', category: 'text', fabric: 'text', tags: 'text' });
productSchema.index({ category: 1, isFeatured: 1 });

export const Product = mongoose.model<IProduct>('Product', productSchema);

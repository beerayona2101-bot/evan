import mongoose, { Document, Schema } from 'mongoose';

export interface IFabric extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  slug: string;
  description: string;
  image: string;
  banner?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';
  featured: boolean;
  displayOrder: number;
  productCount: number;
  seoTitle?: string;
  seoDescription?: string;
  createdBy: string;
  updatedBy?: string;
  deletedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const FabricSchema = new Schema<IFabric>(
  {
    name: { type: String, required: true, unique: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true },
    description: { type: String, default: '' },
    image: { type: String, required: true },
    banner: { type: String, default: '' },
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
    createdBy: { type: String, default: 'Admin' },
    updatedBy: { type: String, default: 'Admin' },
    deletedAt: { type: Date, default: null },
  },
  {
    timestamps: true,
  }
);

FabricSchema.index({ name: 'text', slug: 'text', description: 'text' });

export const Fabric = mongoose.model<IFabric>('Fabric', FabricSchema);

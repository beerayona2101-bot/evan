import mongoose, { Document, Schema } from 'mongoose';

export interface IOccasion extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  slug: string;
  description: string;
  image: string;
  status: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';
  displayOrder: number;
  productCount: number;
  deletedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const OccasionSchema = new Schema<IOccasion>(
  {
    name: { type: String, required: true, unique: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true },
    description: { type: String, default: '' },
    image: { type: String, default: '' },
    status: {
      type: String,
      enum: ['ACTIVE', 'INACTIVE', 'ARCHIVED'],
      default: 'ACTIVE',
    },
    displayOrder: { type: Number, default: 0 },
    productCount: { type: Number, default: 0 },
    deletedAt: { type: Date, default: null },
  },
  {
    timestamps: true,
  }
);

OccasionSchema.index({ name: 'text', slug: 'text' });

export const Occasion = mongoose.model<IOccasion>('Occasion', OccasionSchema);

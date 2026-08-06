import mongoose, { Schema, Document } from 'mongoose';

export interface IInquiry extends Document {
  name: string;
  email: string;
  phone: string;
  sareeInterest: string;
  message: string;
  status: 'New' | 'In Progress' | 'Contacted' | 'Closed';
  createdAt: Date;
}

const InquirySchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    sareeInterest: { type: String, default: 'General Inquiry' },
    message: { type: String, required: true },
    status: { type: String, enum: ['New', 'In Progress', 'Contacted', 'Closed'], default: 'New' },
  },
  { timestamps: true }
);

export const Inquiry = mongoose.model<IInquiry>('Inquiry', InquirySchema);

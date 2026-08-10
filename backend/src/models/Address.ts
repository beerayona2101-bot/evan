import mongoose, { Schema, Document } from 'mongoose';

export interface IAddress extends Document {
  user: mongoose.Types.ObjectId;
  fullName: string;
  phone: string;
  houseNo?: string;
  street: string;
  area?: string;
  city: string;
  district?: string;
  state: string;
  postalCode: string;
  country: string;
  addressType?: string;
  latitude?: number;
  longitude?: number;
  isDefault: boolean;
}

const addressSchema: Schema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    houseNo: { type: String, default: '' },
    street: { type: String, required: true },
    area: { type: String, default: '' },
    city: { type: String, required: true },
    district: { type: String, default: '' },
    state: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, default: 'India' },
    addressType: { type: String, default: 'Home' },
    latitude: { type: Number },
    longitude: { type: Number },
    isDefault: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

export const Address = mongoose.model<IAddress>('Address', addressSchema);

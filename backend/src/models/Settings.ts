import mongoose, { Document, Schema } from 'mongoose';

export interface ISettings extends Document {
  whatsappNumber: string;
  whatsappGreeting: string;
  whatsappEnabled: boolean;
  whatsappPosition: 'bottom-left' | 'bottom-right';
  whatsappColor: string;
  updatedAt: Date;
}

const SettingsSchema = new Schema<ISettings>(
  {
    whatsappNumber: { type: String, required: true, default: '919490644434' },
    whatsappGreeting: {
      type: String,
      required: true,
      default: 'Hello EVAN Collections, I would like to know more about your sarees.',
    },
    whatsappEnabled: { type: Boolean, default: true },
    whatsappPosition: { type: String, enum: ['bottom-left', 'bottom-right'], default: 'bottom-right' },
    whatsappColor: { type: String, default: '#25D366' },
  },
  {
    timestamps: true,
  }
);

export const Settings = mongoose.model<ISettings>('Settings', SettingsSchema);

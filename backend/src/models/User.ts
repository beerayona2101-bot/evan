import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IAddress {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault?: boolean;
}

export interface ILoginAudit {
  timestamp: Date;
  ip?: string;
  userAgent?: string;
}

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  firstName?: string;
  lastName?: string;
  email: string;
  password?: string;
  phone?: string;
  avatar?: string;
  role: 'customer' | 'admin';
  status: 'active' | 'inactive' | 'suspended';
  isVerified: boolean;
  verificationToken?: string;
  verificationExpiry?: Date;
  resetToken?: string;
  resetExpiry?: Date;
  refreshToken?: string;
  lastLogin?: Date;
  lastLogout?: Date;
  loginHistory: ILoginAudit[];
  addresses: IAddress[];
  wishlist: mongoose.Types.ObjectId[];
  matchPassword(enteredPassword: string): Promise<boolean>;
  createdAt: Date;
  updatedAt: Date;
}

const AddressSchema = new Schema<IAddress>({
  street: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  postalCode: { type: String, required: true },
  country: { type: String, required: true, default: 'India' },
  isDefault: { type: Boolean, default: false },
});

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    firstName: { type: String, default: '' },
    lastName: { type: String, default: '' },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    phone: { type: String, default: '' },
    avatar: { type: String, default: '' },
    role: { type: String, enum: ['customer', 'admin'], default: 'customer' },
    status: { type: String, enum: ['active', 'inactive', 'suspended'], default: 'active' },
    isVerified: { type: Boolean, default: true },
    verificationToken: { type: String, default: '' },
    verificationExpiry: { type: Date },
    resetToken: { type: String, default: '' },
    resetExpiry: { type: Date },
    refreshToken: { type: String, default: '' },
    lastLogin: { type: Date },
    lastLogout: { type: Date },
    loginHistory: [
      {
        timestamp: { type: Date, default: Date.now },
        ip: { type: String, default: '' },
        userAgent: { type: String, default: '' },
      },
    ],
    addresses: [AddressSchema],
    wishlist: [{ type: Schema.Types.ObjectId, ref: 'Product' }],
  },
  {
    timestamps: true,
  }
);

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password!, salt);
  next();
});

UserSchema.methods.matchPassword = async function (enteredPassword: string): Promise<boolean> {
  return await bcrypt.compare(enteredPassword, this.password || '');
};

export const User = mongoose.model<IUser>('User', UserSchema);

import mongoose, { Document, Schema } from 'mongoose';

export interface IAuditLog extends Document {
  adminName: string;
  module: string;
  action: string;
  oldValue?: any;
  newValue?: any;
  ipAddress?: string;
  createdAt: Date;
}

const auditLogSchema = new Schema<IAuditLog>(
  {
    adminName: { type: String, required: true, default: 'Admin Atelier' },
    module: { type: String, required: true },
    action: { type: String, required: true },
    oldValue: { type: Schema.Types.Mixed },
    newValue: { type: Schema.Types.Mixed },
    ipAddress: { type: String, default: '127.0.0.1' },
  },
  { timestamps: true }
);

auditLogSchema.index({ module: 1, createdAt: -1 });

export const AuditLog = mongoose.model<IAuditLog>('AuditLog', auditLogSchema);

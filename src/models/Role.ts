import mongoose, { Schema, Document, Model } from 'mongoose';
import { IRole } from '@/types';

export interface IRoleDocument extends Omit<IRole, '_id'>, Document {}

const RoleSchema = new Schema<IRoleDocument>(
  {
    name: {
      type: String,
      required: [true, 'Please provide role name'],
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    permissions: {
      type: [String],
      default: [],
    },
    isSystemRole: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export const Role: Model<IRoleDocument> =
  mongoose.models.Role || mongoose.model<IRoleDocument>('Role', RoleSchema);

import mongoose, { Schema, Document, Model } from 'mongoose';
import { IStaff } from '@/types';

export interface IStaffDocument extends Omit<IStaff, '_id'>, Document {}

const StaffSchema = new Schema<IStaffDocument>(
  {
    fullName: {
      type: String,
      required: [true, 'Staff full name is required'],
      trim: true,
      index: true,
    },
    profileImage: {
      type: String,
      default: '/images/staff/default-avatar.png',
    },
    mobileNumber: {
      type: String,
      required: [true, 'Mobile number is required'],
      trim: true,
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    gender: {
      type: String,
      enum: ['MALE', 'FEMALE', 'OTHER'],
      default: 'MALE',
    },
    dateOfBirth: {
      type: String,
    },
    joiningDate: {
      type: String,
      required: [true, 'Joining date is required'],
    },
    department: {
      type: String,
      required: [true, 'Department is required'],
      trim: true,
    },
    designation: {
      type: String,
      required: [true, 'Designation is required'],
      trim: true,
    },
    salary: {
      type: Number,
      required: [true, 'Base salary is required'],
      min: 0,
    },
    emergencyContact: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'INACTIVE', 'ON_LEAVE', 'TERMINATED'],
      default: 'ACTIVE',
      index: true,
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Staff: Model<IStaffDocument> =
  mongoose.models.Staff || mongoose.model<IStaffDocument>('Staff', StaffSchema);

import mongoose, { Schema, Document, Model } from 'mongoose';
import { ISalary } from '@/types';

export interface ISalaryDocument extends Omit<ISalary, '_id'>, Document {}

const SalarySchema = new Schema<ISalaryDocument>(
  {
    staffId: {
      type: Schema.Types.ObjectId,
      ref: 'Staff',
      required: [true, 'Staff ID is required'],
      index: true,
    },
    month: {
      type: Number,
      required: [true, 'Month (1-12) is required'],
      min: 1,
      max: 12,
    },
    year: {
      type: Number,
      required: [true, 'Year is required'],
    },
    basicSalary: {
      type: Number,
      required: true,
      min: 0,
    },
    workingDays: {
      type: Number,
      default: 30,
    },
    presentDays: {
      type: Number,
      default: 0,
    },
    absentDays: {
      type: Number,
      default: 0,
    },
    leaveDays: {
      type: Number,
      default: 0,
    },
    halfDays: {
      type: Number,
      default: 0,
    },
    deduction: {
      type: Number,
      default: 0,
    },
    bonus: {
      type: Number,
      default: 0,
    },
    netSalary: {
      type: Number,
      required: true,
      min: 0,
    },
    paymentStatus: {
      type: String,
      enum: ['PENDING', 'PAID'],
      default: 'PENDING',
      index: true,
    },
    paidAt: {
      type: String,
    },
    paidBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    notes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

SalarySchema.index({ staffId: 1, month: 1, year: 1 }, { unique: true });

export const Salary: Model<ISalaryDocument> =
  mongoose.models.Salary || mongoose.model<ISalaryDocument>('Salary', SalarySchema);

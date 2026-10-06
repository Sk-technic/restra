import mongoose, { Schema, Document, Model } from 'mongoose';
import { IAttendance } from '@/types';

export interface IAttendanceDocument extends Omit<IAttendance, '_id'>, Document {}

const AttendanceSchema = new Schema<IAttendanceDocument>(
  {
    staffId: {
      type: Schema.Types.ObjectId,
      ref: 'Staff',
      required: [true, 'Staff ID is required'],
      index: true,
    },
    date: {
      type: String, // YYYY-MM-DD
      required: [true, 'Attendance date is required'],
      index: true,
    },
    status: {
      type: String,
      enum: ['PRESENT', 'ABSENT', 'HALF_DAY', 'LEAVE'],
      required: [true, 'Status is required'],
      default: 'PRESENT',
    },
    checkIn: {
      type: String, // HH:mm
      default: '',
    },
    checkOut: {
      type: String, // HH:mm
      default: '',
    },
    notes: {
      type: String,
      default: '',
    },
    markedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure uniqueness per staff member per date
AttendanceSchema.index({ staffId: 1, date: 1 }, { unique: true });

export const Attendance: Model<IAttendanceDocument> =
  mongoose.models.Attendance || mongoose.model<IAttendanceDocument>('Attendance', AttendanceSchema);

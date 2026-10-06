import mongoose, { Schema, Document, Model } from 'mongoose';
import { IReservation } from '@/types';

export interface IReservationDocument extends Omit<IReservation, '_id'>, Document {}

const ReservationSchema = new Schema<IReservationDocument>(
  {
    customerName: {
      type: String,
      required: [true, 'Customer name is required'],
      trim: true,
      index: true,
    },
    customerPhone: {
      type: String,
      required: [true, 'Customer phone number is required'],
      trim: true,
    },
    customerEmail: {
      type: String,
      trim: true,
      lowercase: true,
    },
    numberOfGuests: {
      type: Number,
      required: [true, 'Number of guests is required'],
      min: 1,
    },
    tableId: {
      type: Schema.Types.ObjectId,
      ref: 'Table',
      required: [true, 'Table is required'],
      index: true,
    },
    date: {
      type: String, // YYYY-MM-DD
      required: [true, 'Reservation date is required'],
      index: true,
    },
    startTime: {
      type: String, // HH:mm
      required: [true, 'Start time is required'],
    },
    endTime: {
      type: String, // HH:mm
      required: [true, 'End time is required'],
    },
    status: {
      type: String,
      enum: ['PENDING', 'CONFIRMED', 'SEATED', 'COMPLETED', 'CANCELLED', 'NO_SHOW'],
      default: 'CONFIRMED',
      index: true,
    },
    notes: {
      type: String,
      default: '',
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

ReservationSchema.index({ tableId: 1, date: 1, status: 1 });

export const Reservation: Model<IReservationDocument> =
  mongoose.models.Reservation || mongoose.model<IReservationDocument>('Reservation', ReservationSchema);

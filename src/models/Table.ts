import mongoose, { Schema, Document, Model } from 'mongoose';
import { ITable } from '@/types';

export interface ITableDocument extends Omit<ITable, '_id'>, Document {}

const TableSchema = new Schema<ITableDocument>(
  {
    tableNumber: {
      type: String,
      required: [true, 'Table number/name is required'],
      unique: true,
      trim: true,
      index: true,
    },
    capacity: {
      type: Number,
      required: [true, 'Table seating capacity is required'],
      min: 1,
    },
    section: {
      type: String,
      enum: ['Indoor', 'Outdoor', 'Rooftop', 'VIP', 'Bar', 'Terrace', 'Main Dining'],
      default: 'Indoor',
    },
    status: {
      type: String,
      enum: ['AVAILABLE', 'RESERVED', 'OCCUPIED', 'CLEANING', 'INACTIVE'],
      default: 'AVAILABLE',
      index: true,
    },
    notes: {
      type: String,
      default: '',
    },
    qrCode: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

export const Table: Model<ITableDocument> =
  mongoose.models.Table || mongoose.model<ITableDocument>('Table', TableSchema);

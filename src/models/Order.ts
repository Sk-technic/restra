import mongoose, { Schema, Document, Model } from 'mongoose';
import { IOrder } from '@/types';

export interface IOrderDocument extends Omit<IOrder, '_id'>, Document {}

const OrderItemSchema = new Schema(
  {
    foodItemId: {
      type: Schema.Types.ObjectId,
      ref: 'FoodItem',
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },
    notes: {
      type: String,
      default: '',
    },
  },
  { _id: false }
);

const OrderSchema = new Schema<IOrderDocument>(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    customerId: {
      type: Schema.Types.ObjectId,
      ref: 'Customer',
      index: true,
    },
    customerName: {
      type: String,
      default: 'Walk-in Guest',
    },
    customerPhone: {
      type: String,
      default: '',
    },
    tableId: {
      type: Schema.Types.ObjectId,
      ref: 'Table',
      index: true,
    },
    orderType: {
      type: String,
      enum: ['DINE_IN', 'TAKEAWAY', 'DELIVERY'],
      default: 'DINE_IN',
      index: true,
    },
    items: [OrderItemSchema],
    subtotal: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    tax: {
      type: Number,
      default: 0,
      min: 0,
    },
    discount: {
      type: Number,
      default: 0,
      min: 0,
    },
    total: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: ['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'SERVED', 'COMPLETED', 'CANCELLED'],
      default: 'PENDING',
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

export const Order: Model<IOrderDocument> =
  mongoose.models.Order || mongoose.model<IOrderDocument>('Order', OrderSchema);

import mongoose, { Schema, Document, Model } from 'mongoose';
import { IPayment } from '@/types';

export interface IPaymentDocument extends Omit<IPayment, '_id'>, Document {}

const PaymentSchema = new Schema<IPaymentDocument>(
  {
    billNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    orderId: {
      type: Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
      index: true,
    },
    customerName: {
      type: String,
      default: 'Valued Guest',
    },
    customerPhone: {
      type: String,
      default: '',
    },
    tableNumber: {
      type: String,
      default: '-',
    },
    items: [
      {
        name: { type: String, required: true },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
        amount: { type: Number, required: true },
      },
    ],
    subtotal: {
      type: Number,
      required: true,
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
    grandTotal: {
      type: Number,
      required: true,
      min: 0,
    },
    paymentMethod: {
      type: String,
      enum: ['CASH', 'CARD', 'UPI', 'OTHER'],
      default: 'CASH',
    },
    paymentStatus: {
      type: String,
      enum: ['PENDING', 'PAID', 'PARTIAL', 'REFUNDED'],
      default: 'PENDING',
      index: true,
    },
    generatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    paidAt: {
      type: String,
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

export const Payment: Model<IPaymentDocument> =
  mongoose.models.Payment || mongoose.model<IPaymentDocument>('Payment', PaymentSchema);

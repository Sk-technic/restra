import mongoose, { Schema, Document, Model } from 'mongoose';
import { IFoodItem } from '@/types';

export interface IFoodItemDocument extends Omit<IFoodItem, '_id'>, Document {}

const FoodItemSchema = new Schema<IFoodItemDocument>(
  {
    name: {
      type: String,
      required: [true, 'Food item name is required'],
      trim: true,
      index: true,
    },
    description: {
      type: String,
      default: '',
    },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: 'MenuCategory',
      required: [true, 'Category is required'],
      index: true,
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: 0,
    },
    image: {
      type: String,
      default: '/images/food/default-food.png',
    },
    foodType: {
      type: String,
      enum: ['VEG', 'NON_VEG', 'EGG'],
      default: 'VEG',
      index: true,
    },
    isAvailable: {
      type: Boolean,
      default: true,
      index: true,
    },
    preparationTime: {
      type: Number,
      default: 15, // in minutes
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'INACTIVE'],
      default: 'ACTIVE',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

export const FoodItem: Model<IFoodItemDocument> =
  mongoose.models.FoodItem || mongoose.model<IFoodItemDocument>('FoodItem', FoodItemSchema);

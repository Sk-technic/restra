import mongoose, { Schema, Document, Model } from 'mongoose';
import { IMenuCategory } from '@/types';

export interface IMenuCategoryDocument extends Omit<IMenuCategory, '_id'>, Document {}

const MenuCategorySchema = new Schema<IMenuCategoryDocument>(
  {
    name: {
      type: String,
      required: [true, 'Category name is required'],
      unique: true,
      trim: true,
      index: true,
    },
    image: {
      type: String,
      default: '/images/categories/default-category.png',
    },
    description: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'INACTIVE'],
      default: 'ACTIVE',
      index: true,
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

export const MenuCategory: Model<IMenuCategoryDocument> =
  mongoose.models.MenuCategory || mongoose.model<IMenuCategoryDocument>('MenuCategory', MenuCategorySchema);

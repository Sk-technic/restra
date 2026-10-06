import { NextRequest, NextResponse } from 'next/server';
import { validateApiAuth } from '@/lib/api-guards';
import { connectToDatabase } from '@/lib/db';
import { MenuCategory } from '@/models/MenuCategory';
import { FoodItem } from '@/models/FoodItem';

export async function GET(req: NextRequest) {
  const auth = await validateApiAuth(req, { requiredPermission: 'menu.view' });
  if (auth.errorResponse) return auth.errorResponse;

  try {
    await connectToDatabase();
    const categories = await MenuCategory.find().sort({ sortOrder: 1, name: 1 });
    return NextResponse.json({ success: true, count: categories.length, categories });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: 'Failed to fetch categories', error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const auth = await validateApiAuth(req, { requiredPermission: 'menu.create' });
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const body = await req.json();
    const { name, description, image, status, sortOrder } = body;

    if (!name) {
      return NextResponse.json({ success: false, message: 'Category name is required.' }, { status: 400 });
    }

    await connectToDatabase();

    const existing = await MenuCategory.findOne({ name: name.trim() });
    if (existing) {
      return NextResponse.json({ success: false, message: 'Category name already exists.' }, { status: 400 });
    }

    const category = await MenuCategory.create({
      name: name.trim(),
      description: description?.trim() || '',
      image: image || '/images/categories/default-category.png',
      status: status || 'ACTIVE',
      sortOrder: Number(sortOrder) || 0,
    });

    return NextResponse.json({
      success: true,
      message: 'Category created successfully.',
      category,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: 'Failed to create category', error: error.message },
      { status: 500 }
    );
  }
}

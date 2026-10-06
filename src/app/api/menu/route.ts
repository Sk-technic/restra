import { NextRequest, NextResponse } from 'next/server';
import { validateApiAuth } from '@/lib/api-guards';
import { connectToDatabase } from '@/lib/db';
import { FoodItem } from '@/models/FoodItem';

export async function GET(req: NextRequest) {
  const auth = await validateApiAuth(req, { requiredPermission: 'menu.view' });
  if (auth.errorResponse) return auth.errorResponse;

  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search');
    const categoryId = searchParams.get('category');
    const foodType = searchParams.get('foodType');
    const isAvailable = searchParams.get('isAvailable');
    const status = searchParams.get('status');

    const filter: Record<string, any> = {};

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    if (categoryId && categoryId !== 'ALL') {
      filter.categoryId = categoryId;
    }

    if (foodType && foodType !== 'ALL') {
      filter.foodType = foodType;
    }

    if (isAvailable !== null && isAvailable !== undefined && isAvailable !== 'ALL') {
      filter.isAvailable = isAvailable === 'true';
    }

    if (status && status !== 'ALL') {
      filter.status = status;
    }

    const items = await FoodItem.find(filter)
      .populate('categoryId')
      .sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      count: items.length,
      items,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: 'Failed to fetch food items', error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const auth = await validateApiAuth(req, { requiredPermission: 'menu.create' });
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const body = await req.json();
    const { name, description, categoryId, price, image, foodType, isAvailable, preparationTime, status } = body;

    if (!name || !categoryId || price === undefined) {
      return NextResponse.json(
        { success: false, message: 'Food item Name, Category, and Price are required.' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const foodItem = await FoodItem.create({
      name: name.trim(),
      description: description?.trim() || '',
      categoryId,
      price: Number(price),
      image: image || '/images/food/default-food.png',
      foodType: foodType || 'VEG',
      isAvailable: isAvailable !== undefined ? Boolean(isAvailable) : true,
      preparationTime: Number(preparationTime) || 15,
      status: status || 'ACTIVE',
    });

    const populated = await FoodItem.findById(foodItem._id).populate('categoryId');

    return NextResponse.json({
      success: true,
      message: 'Food item added to menu.',
      foodItem: populated,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: 'Failed to create food item', error: error.message },
      { status: 500 }
    );
  }
}

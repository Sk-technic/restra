import { NextRequest, NextResponse } from 'next/server';
import { validateApiAuth } from '@/lib/api-guards';
import { connectToDatabase } from '@/lib/db';
import { FoodItem } from '@/models/FoodItem';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await validateApiAuth(req, { requiredPermission: 'menu.view' });
  if (auth.errorResponse) return auth.errorResponse;

  const { id } = await params;
  try {
    await connectToDatabase();
    const item = await FoodItem.findById(id).populate('categoryId');
    if (!item) {
      return NextResponse.json({ success: false, message: 'Food item not found.' }, { status: 404 });
    }
    return NextResponse.json({ success: true, item });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await validateApiAuth(req, { requiredPermission: 'menu.update' });
  if (auth.errorResponse) return auth.errorResponse;

  const { id } = await params;
  try {
    const body = await req.json();
    await connectToDatabase();

    const item = await FoodItem.findById(id);
    if (!item) {
      return NextResponse.json({ success: false, message: 'Food item not found.' }, { status: 404 });
    }

    if (body.name) item.name = body.name.trim();
    if (body.description !== undefined) item.description = body.description.trim();
    if (body.categoryId) item.categoryId = body.categoryId;
    if (body.price !== undefined) item.price = Number(body.price);
    if (body.image) item.image = body.image;
    if (body.foodType) item.foodType = body.foodType;
    if (body.isAvailable !== undefined) item.isAvailable = Boolean(body.isAvailable);
    if (body.preparationTime !== undefined) item.preparationTime = Number(body.preparationTime);
    if (body.status) item.status = body.status;

    await item.save();

    const updated = await FoodItem.findById(id).populate('categoryId');

    return NextResponse.json({
      success: true,
      message: 'Food item updated successfully.',
      foodItem: updated,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await validateApiAuth(req, { requiredPermission: 'menu.delete' });
  if (auth.errorResponse) return auth.errorResponse;

  const { id } = await params;
  try {
    await connectToDatabase();
    const item = await FoodItem.findById(id);
    if (!item) {
      return NextResponse.json({ success: false, message: 'Food item not found.' }, { status: 404 });
    }

    await FoodItem.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: 'Food item removed successfully.',
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { validateApiAuth } from '@/lib/api-guards';
import { connectToDatabase } from '@/lib/db';
import { MenuCategory } from '@/models/MenuCategory';
import { FoodItem } from '@/models/FoodItem';

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

    const category = await MenuCategory.findById(id);
    if (!category) {
      return NextResponse.json({ success: false, message: 'Category not found.' }, { status: 404 });
    }

    if (body.name) category.name = body.name.trim();
    if (body.description !== undefined) category.description = body.description.trim();
    if (body.image) category.image = body.image;
    if (body.status) category.status = body.status;
    if (body.sortOrder !== undefined) category.sortOrder = Number(body.sortOrder);

    await category.save();

    return NextResponse.json({
      success: true,
      message: 'Category updated successfully.',
      category,
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

    const foodCount = await FoodItem.countDocuments({ categoryId: id });
    if (foodCount > 0) {
      return NextResponse.json(
        {
          success: false,
          message: `Cannot delete category. There are ${foodCount} food item(s) assigned to this category.`,
        },
        { status: 400 }
      );
    }

    await MenuCategory.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: 'Category removed successfully.',
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

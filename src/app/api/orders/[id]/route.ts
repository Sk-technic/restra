import { NextRequest, NextResponse } from 'next/server';
import { validateApiAuth } from '@/lib/api-guards';
import { connectToDatabase } from '@/lib/db';
import { Order } from '@/models/Order';
import { Table } from '@/models/Table';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await validateApiAuth(req, { requiredPermission: 'orders.view' });
  if (auth.errorResponse) return auth.errorResponse;

  const { id } = await params;
  try {
    await connectToDatabase();
    const order = await Order.findById(id)
      .populate('tableId')
      .populate('customerId')
      .populate('createdBy', 'name email');

    if (!order) {
      return NextResponse.json({ success: false, message: 'Order not found.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, order });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await validateApiAuth(req, { requiredPermission: 'orders.update' });
  if (auth.errorResponse) return auth.errorResponse;

  const { id } = await params;
  try {
    const body = await req.json();
    await connectToDatabase();

    const order = await Order.findById(id);
    if (!order) {
      return NextResponse.json({ success: false, message: 'Order not found.' }, { status: 404 });
    }

    if (body.status) {
      order.status = body.status;
      if (body.status === 'COMPLETED' || body.status === 'CANCELLED') {
        if (order.tableId) {
          await Table.findByIdAndUpdate(order.tableId, { status: 'AVAILABLE' });
        }
      }
    }

    if (body.items && Array.isArray(body.items)) {
      order.items = body.items;
      const subtotal = body.items.reduce((s: number, i: any) => s + Number(i.price) * Number(i.quantity), 0);
      order.subtotal = subtotal;
      order.tax = Math.round(subtotal * 0.05);
      const disc = body.discount !== undefined ? Number(body.discount) : order.discount;
      order.discount = disc;
      order.total = Math.max(0, order.subtotal + order.tax - disc);
    }

    if (body.notes !== undefined) order.notes = body.notes;

    await order.save();

    const updated = await Order.findById(id).populate('tableId').populate('customerId');

    return NextResponse.json({
      success: true,
      message: 'Order updated successfully.',
      order: updated,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await validateApiAuth(req, { requiredPermission: 'orders.delete' });
  if (auth.errorResponse) return auth.errorResponse;

  const { id } = await params;
  try {
    await connectToDatabase();
    const order = await Order.findById(id);
    if (!order) {
      return NextResponse.json({ success: false, message: 'Order not found.' }, { status: 404 });
    }

    if (order.tableId) {
      await Table.findByIdAndUpdate(order.tableId, { status: 'AVAILABLE' });
    }

    await Order.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: 'Order removed successfully.',
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { validateApiAuth } from '@/lib/api-guards';
import { connectToDatabase } from '@/lib/db';
import { Order } from '@/models/Order';
import { Table } from '@/models/Table';
import { Customer } from '@/models/Customer';

export async function GET(req: NextRequest) {
  const auth = await validateApiAuth(req, { requiredPermission: 'orders.view' });
  if (auth.errorResponse) return auth.errorResponse;

  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const orderType = searchParams.get('orderType');
    const tableId = searchParams.get('tableId');
    const search = searchParams.get('search');

    const filter: Record<string, any> = {};
    if (status && status !== 'ALL') filter.status = status;
    if (orderType && orderType !== 'ALL') filter.orderType = orderType;
    if (tableId && tableId !== 'ALL') filter.tableId = tableId;

    if (search) {
      filter.$or = [
        { orderNumber: { $regex: search, $options: 'i' } },
        { customerName: { $regex: search, $options: 'i' } },
        { customerPhone: { $regex: search, $options: 'i' } },
      ];
    }

    const orders = await Order.find(filter)
      .populate('tableId')
      .populate('customerId')
      .populate('createdBy', 'name email role')
      .sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: 'Failed to fetch orders', error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const auth = await validateApiAuth(req, { requiredPermission: 'orders.create' });
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const body = await req.json();
    const {
      customerId,
      customerName,
      customerPhone,
      tableId,
      orderType,
      items,
      discount = 0,
      notes,
    } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, message: 'An order must contain at least one food item.' },
        { status: 400 }
      );
    }

    if (orderType === 'DINE_IN' && !tableId) {
      return NextResponse.json(
        { success: false, message: 'Please select a dining table for Dine-In order.' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Generate unique sequential order number
    const count = await Order.countDocuments();
    const orderNumber = `ORD-${1000 + count + 1}`;

    // Calculate totals
    const subtotal = items.reduce((sum: number, item: any) => sum + Number(item.price) * Number(item.quantity), 0);
    const tax = Math.round(subtotal * 0.05); // 5% GST
    const discountAmount = Number(discount) || 0;
    const total = Math.max(0, subtotal + tax - discountAmount);

    let customerRef = customerId;
    if (!customerRef && customerPhone) {
      const existingCust = await Customer.findOne({ phone: customerPhone.trim() });
      if (existingCust) {
        customerRef = existingCust._id;
        existingCust.totalOrders += 1;
        existingCust.lastVisit = new Date().toISOString().split('T')[0];
        await existingCust.save();
      } else if (customerName) {
        const newCust = await Customer.create({
          name: customerName.trim(),
          phone: customerPhone.trim(),
          totalOrders: 1,
          totalVisits: 1,
          lastVisit: new Date().toISOString().split('T')[0],
        });
        customerRef = newCust._id;
      }
    }

    const order = await Order.create({
      orderNumber,
      customerId: customerRef || null,
      customerName: customerName || 'Walk-in Guest',
      customerPhone: customerPhone || '',
      tableId: tableId || null,
      orderType: orderType || 'DINE_IN',
      items,
      subtotal,
      tax,
      discount: discountAmount,
      total,
      status: 'PENDING',
      notes: notes || '',
      createdBy: auth.user.userId,
    });

    // If Dine-in, mark table as occupied
    if (tableId && orderType === 'DINE_IN') {
      await Table.findByIdAndUpdate(tableId, { status: 'OCCUPIED' });
    }

    const populated = await Order.findById(order._id)
      .populate('tableId')
      .populate('customerId');

    return NextResponse.json({
      success: true,
      message: `Order ${orderNumber} placed successfully.`,
      order: populated,
    });
  } catch (error: any) {
    console.error('Order creation error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create order', error: error.message },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { validateApiAuth } from '@/lib/api-guards';
import { connectToDatabase } from '@/lib/db';
import { Payment } from '@/models/Payment';
import { Order } from '@/models/Order';
import { Table } from '@/models/Table';

export async function POST(req: NextRequest) {
  const auth = await validateApiAuth(req, { requiredPermission: 'billing.create' });
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const body = await req.json();
    const { orderId, paymentMethod = 'CASH', paymentStatus = 'PENDING', discount } = body;

    if (!orderId) {
      return NextResponse.json({ success: false, message: 'Order ID is required to generate bill.' }, { status: 400 });
    }

    await connectToDatabase();

    const order = await Order.findById(orderId).populate('tableId').populate('customerId');
    if (!order) {
      return NextResponse.json({ success: false, message: 'Order not found.' }, { status: 404 });
    }

    // Check if bill already generated for this order
    const existingBill = await Payment.findOne({ orderId });
    if (existingBill) {
      return NextResponse.json({
        success: true,
        message: 'Bill already exists for this order.',
        bill: existingBill,
      });
    }

    const billCount = await Payment.countDocuments();
    const currentYear = new Date().getFullYear();
    const billNumber = `BILL-${currentYear}-${String(billCount + 1).padStart(4, '0')}`;

    const items = order.items.map((i: any) => ({
      name: i.name,
      quantity: i.quantity,
      price: i.price,
      amount: i.price * i.quantity,
    }));

    const subtotal = items.reduce((sum: number, i: any) => sum + i.amount, 0);
    const tax = Math.round(subtotal * 0.05); // 5% GST
    const finalDiscount = discount !== undefined ? Number(discount) : order.discount || 0;
    const grandTotal = Math.max(0, subtotal + tax - finalDiscount);

    const tableDoc = order.tableId as any;
    const tableNumber = tableDoc ? tableDoc.tableNumber : 'Takeaway';

    const bill = await Payment.create({
      billNumber,
      orderId: order._id,
      customerName: order.customerName || 'Valued Guest',
      customerPhone: order.customerPhone || '',
      tableNumber,
      items,
      subtotal,
      tax,
      discount: finalDiscount,
      grandTotal,
      paymentMethod,
      paymentStatus,
      generatedBy: auth.user.userId,
      paidAt: paymentStatus === 'PAID' ? new Date().toISOString() : undefined,
    });

    if (paymentStatus === 'PAID') {
      order.status = 'COMPLETED';
      await order.save();
      if (order.tableId) {
        await Table.findByIdAndUpdate(order.tableId, { status: 'AVAILABLE' });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Bill ${billNumber} generated successfully.`,
      bill,
    });
  } catch (error: any) {
    console.error('Bill generation error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to generate bill', error: error.message },
      { status: 500 }
    );
  }
}

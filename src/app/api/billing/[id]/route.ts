import { NextRequest, NextResponse } from 'next/server';
import { validateApiAuth } from '@/lib/api-guards';
import { connectToDatabase } from '@/lib/db';
import { Payment } from '@/models/Payment';
import { Order } from '@/models/Order';
import { Table } from '@/models/Table';
import { Customer } from '@/models/Customer';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await validateApiAuth(req, { requiredPermission: 'billing.view' });
  if (auth.errorResponse) return auth.errorResponse;

  const { id } = await params;
  try {
    await connectToDatabase();
    const bill = await Payment.findById(id).populate('orderId').populate('generatedBy', 'name email');
    if (!bill) {
      return NextResponse.json({ success: false, message: 'Bill not found.' }, { status: 404 });
    }
    return NextResponse.json({ success: true, bill });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await validateApiAuth(req, { requiredPermission: 'billing.manage' });
  if (auth.errorResponse) return auth.errorResponse;

  const { id } = await params;
  try {
    const body = await req.json();
    const { paymentStatus, paymentMethod, notes } = body;

    await connectToDatabase();
    const bill = await Payment.findById(id);
    if (!bill) {
      return NextResponse.json({ success: false, message: 'Bill not found.' }, { status: 404 });
    }

    if (paymentMethod) bill.paymentMethod = paymentMethod;
    if (notes !== undefined) bill.notes = notes;

    if (paymentStatus) {
      bill.paymentStatus = paymentStatus;
      if (paymentStatus === 'PAID') {
        bill.paidAt = new Date().toISOString();

        // Update Order to COMPLETED and free Table
        const order = await Order.findById(bill.orderId);
        if (order) {
          order.status = 'COMPLETED';
          await order.save();
          if (order.tableId) {
            await Table.findByIdAndUpdate(order.tableId, { status: 'AVAILABLE' });
          }

          // Update customer lifetime spent
          if (bill.customerPhone) {
            await Customer.findOneAndUpdate(
              { phone: bill.customerPhone },
              { $inc: { totalSpent: bill.grandTotal } }
            );
          }
        }
      }
    }

    await bill.save();

    return NextResponse.json({
      success: true,
      message: 'Payment updated successfully.',
      bill,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

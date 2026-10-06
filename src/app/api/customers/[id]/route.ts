import { NextRequest, NextResponse } from 'next/server';
import { validateApiAuth } from '@/lib/api-guards';
import { connectToDatabase } from '@/lib/db';
import { Customer } from '@/models/Customer';
import { Order } from '@/models/Order';
import { Reservation } from '@/models/Reservation';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await validateApiAuth(req, { requiredPermission: 'customers.view' });
  if (auth.errorResponse) return auth.errorResponse;

  const { id } = await params;
  try {
    await connectToDatabase();
    const customer = await Customer.findById(id);
    if (!customer) {
      return NextResponse.json({ success: false, message: 'Customer not found.' }, { status: 404 });
    }

    const orders = await Order.find({ customerId: id }).sort({ createdAt: -1 });
    const reservations = await Reservation.find({ customerPhone: customer.phone }).populate('tableId').sort({ date: -1 });

    return NextResponse.json({
      success: true,
      customer,
      history: {
        orders,
        reservations,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await validateApiAuth(req, { requiredPermission: 'customers.update' });
  if (auth.errorResponse) return auth.errorResponse;

  const { id } = await params;
  try {
    const body = await req.json();
    await connectToDatabase();

    const customer = await Customer.findById(id);
    if (!customer) {
      return NextResponse.json({ success: false, message: 'Customer not found.' }, { status: 404 });
    }

    if (body.name) customer.name = body.name.trim();
    if (body.phone) customer.phone = body.phone.trim();
    if (body.email !== undefined) customer.email = body.email.trim().toLowerCase();
    if (body.address !== undefined) customer.address = body.address.trim();
    if (body.notes !== undefined) customer.notes = body.notes.trim();

    await customer.save();

    return NextResponse.json({
      success: true,
      message: 'Customer details updated successfully.',
      customer,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await validateApiAuth(req, { requiredPermission: 'customers.delete' });
  if (auth.errorResponse) return auth.errorResponse;

  const { id } = await params;
  try {
    await connectToDatabase();
    const customer = await Customer.findById(id);
    if (!customer) {
      return NextResponse.json({ success: false, message: 'Customer not found.' }, { status: 404 });
    }

    await Customer.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: 'Customer removed successfully.',
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

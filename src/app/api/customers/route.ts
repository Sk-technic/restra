import { NextRequest, NextResponse } from 'next/server';
import { validateApiAuth } from '@/lib/api-guards';
import { connectToDatabase } from '@/lib/db';
import { Customer } from '@/models/Customer';

export async function GET(req: NextRequest) {
  const auth = await validateApiAuth(req, { requiredPermission: 'customers.view' });
  if (auth.errorResponse) return auth.errorResponse;

  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search');

    const filter: Record<string, any> = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const customers = await Customer.find(filter).sort({ totalSpent: -1, lastVisit: -1 });

    return NextResponse.json({
      success: true,
      count: customers.length,
      customers,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: 'Failed to fetch customers', error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const auth = await validateApiAuth(req, { requiredPermission: 'customers.create' });
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const body = await req.json();
    const { name, phone, email, address, notes, profileImage } = body;

    if (!name || !phone) {
      return NextResponse.json(
        { success: false, message: 'Customer name and phone number are required.' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const existing = await Customer.findOne({ phone: phone.trim() });
    if (existing) {
      return NextResponse.json(
        { success: false, message: 'A customer with this phone number already exists.' },
        { status: 400 }
      );
    }

    const customer = await Customer.create({
      name: name.trim(),
      phone: phone.trim(),
      email: email?.trim()?.toLowerCase() || '',
      address: address?.trim() || '',
      notes: notes?.trim() || '',
      profileImage: profileImage || '/images/staff/default-avatar.png',
      totalVisits: 1,
      lastVisit: new Date().toISOString().split('T')[0],
    });

    return NextResponse.json({
      success: true,
      message: 'Customer added successfully.',
      customer,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: 'Failed to create customer', error: error.message },
      { status: 500 }
    );
  }
}

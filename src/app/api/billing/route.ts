import { NextRequest, NextResponse } from 'next/server';
import { validateApiAuth } from '@/lib/api-guards';
import { connectToDatabase } from '@/lib/db';
import { Payment } from '@/models/Payment';

export async function GET(req: NextRequest) {
  const auth = await validateApiAuth(req, { requiredPermission: 'billing.view' });
  if (auth.errorResponse) return auth.errorResponse;

  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const paymentStatus = searchParams.get('status');
    const paymentMethod = searchParams.get('method');
    const search = searchParams.get('search');

    const filter: Record<string, any> = {};
    if (paymentStatus && paymentStatus !== 'ALL') filter.paymentStatus = paymentStatus;
    if (paymentMethod && paymentMethod !== 'ALL') filter.paymentMethod = paymentMethod;

    if (search) {
      filter.$or = [
        { billNumber: { $regex: search, $options: 'i' } },
        { customerName: { $regex: search, $options: 'i' } },
        { customerPhone: { $regex: search, $options: 'i' } },
        { tableNumber: { $regex: search, $options: 'i' } },
      ];
    }

    const bills = await Payment.find(filter)
      .populate('orderId')
      .populate('generatedBy', 'name email')
      .sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      count: bills.length,
      bills,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: 'Failed to fetch billing records', error: error.message },
      { status: 500 }
    );
  }
}

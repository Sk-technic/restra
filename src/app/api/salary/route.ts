import { NextRequest, NextResponse } from 'next/server';
import { validateApiAuth } from '@/lib/api-guards';
import { connectToDatabase } from '@/lib/db';
import { Salary } from '@/models/Salary';

export async function GET(req: NextRequest) {
  const auth = await validateApiAuth(req, { requiredPermission: 'salary.view' });
  if (auth.errorResponse) return auth.errorResponse;

  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const month = searchParams.get('month');
    const year = searchParams.get('year');
    const staffId = searchParams.get('staffId');
    const paymentStatus = searchParams.get('status');

    const filter: Record<string, any> = {};

    if (month) filter.month = Number(month);
    if (year) filter.year = Number(year);
    if (staffId && staffId !== 'ALL') filter.staffId = staffId;
    if (paymentStatus && paymentStatus !== 'ALL') filter.paymentStatus = paymentStatus;

    const salaries = await Salary.find(filter)
      .populate('staffId')
      .populate('paidBy', 'name email role')
      .sort({ year: -1, month: -1, createdAt: -1 });

    return NextResponse.json({
      success: true,
      count: salaries.length,
      salaries,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: 'Failed to fetch salaries', error: error.message },
      { status: 500 }
    );
  }
}

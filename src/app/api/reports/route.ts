import { NextRequest, NextResponse } from 'next/server';
import { validateApiAuth } from '@/lib/api-guards';
import { connectToDatabase } from '@/lib/db';
import { Order, Payment, Reservation, Attendance, Staff, Salary } from '@/models';

export async function GET(req: NextRequest) {
  const auth = await validateApiAuth(req, { requiredPermission: 'reports.view' });
  if (auth.errorResponse) return auth.errorResponse;

  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type') || 'sales'; // sales, attendance, salary, reservations

    if (type === 'sales') {
      const payments = await Payment.find().sort({ createdAt: -1 });
      const totalRevenue = payments.filter((p) => p.paymentStatus === 'PAID').reduce((s, p) => s + p.grandTotal, 0);
      const totalCashRevenue = payments
        .filter((p) => p.paymentStatus === 'PAID' && p.paymentMethod === 'CASH')
        .reduce((s, p) => s + p.grandTotal, 0);
      const totalDigitalRevenue = totalRevenue - totalCashRevenue;

      return NextResponse.json({
        success: true,
        summary: {
          totalTransactions: payments.length,
          totalRevenue,
          totalCashRevenue,
          totalDigitalRevenue,
        },
        records: payments,
      });
    }

    if (type === 'reservations') {
      const reservations = await Reservation.find().populate('tableId').sort({ date: -1, startTime: 1 });
      return NextResponse.json({
        success: true,
        summary: {
          totalBookings: reservations.length,
          completed: reservations.filter((r) => r.status === 'COMPLETED').length,
          confirmed: reservations.filter((r) => r.status === 'CONFIRMED').length,
          cancelled: reservations.filter((r) => r.status === 'CANCELLED').length,
        },
        records: reservations,
      });
    }

    if (type === 'attendance') {
      const month = searchParams.get('month') || new Date().toISOString().substring(0, 7);
      const records = await Attendance.find({ date: { $regex: `^${month}` } }).populate('staffId').sort({ date: -1 });
      return NextResponse.json({
        success: true,
        month,
        summary: {
          totalLogged: records.length,
          present: records.filter((r) => r.status === 'PRESENT').length,
          absent: records.filter((r) => r.status === 'ABSENT').length,
          leaves: records.filter((r) => r.status === 'LEAVE').length,
          halfDays: records.filter((r) => r.status === 'HALF_DAY').length,
        },
        records,
      });
    }

    if (type === 'salary') {
      const salaries = await Salary.find().populate('staffId').populate('paidBy', 'name email').sort({ year: -1, month: -1 });
      const totalPaid = salaries.filter((s) => s.paymentStatus === 'PAID').reduce((sum, s) => sum + s.netSalary, 0);
      const totalPending = salaries.filter((s) => s.paymentStatus === 'PENDING').reduce((sum, s) => sum + s.netSalary, 0);

      return NextResponse.json({
        success: true,
        summary: {
          totalSalariesGenerated: salaries.length,
          totalPaidAmount: totalPaid,
          totalPendingAmount: totalPending,
        },
        records: salaries,
      });
    }

    return NextResponse.json({ success: false, message: 'Invalid report type' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: 'Failed to generate report', error: error.message },
      { status: 500 }
    );
  }
}

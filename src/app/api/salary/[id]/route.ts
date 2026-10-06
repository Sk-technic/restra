import { NextRequest, NextResponse } from 'next/server';
import { validateApiAuth } from '@/lib/api-guards';
import { connectToDatabase } from '@/lib/db';
import { Salary } from '@/models/Salary';

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await validateApiAuth(req, { requiredPermission: 'salary.manage' });
  if (auth.errorResponse) return auth.errorResponse;

  const { id } = await params;
  try {
    const body = await req.json();
    const { paymentStatus, bonus, deduction, notes } = body;

    await connectToDatabase();
    const salary = await Salary.findById(id);
    if (!salary) {
      return NextResponse.json({ success: false, message: 'Salary record not found.' }, { status: 404 });
    }

    if (bonus !== undefined) salary.bonus = Number(bonus);
    if (deduction !== undefined) salary.deduction = Number(deduction);
    if (notes !== undefined) salary.notes = notes;

    // Recalculate net salary
    const perDayRate = salary.basicSalary / (salary.workingDays || 30);
    const effectivePaidDays = salary.presentDays + salary.leaveDays + (salary.halfDays || 0) * 0.5;
    const basePay = Math.round(perDayRate * effectivePaidDays);
    salary.netSalary = Math.max(0, basePay + (salary.bonus || 0) - (salary.deduction || 0));

    if (paymentStatus) {
      salary.paymentStatus = paymentStatus;
      if (paymentStatus === 'PAID') {
        salary.paidAt = new Date().toISOString();
        salary.paidBy = auth.user.userId as any;
      }
    }

    await salary.save();

    const updated = await Salary.findById(id).populate('staffId').populate('paidBy', 'name email');

    return NextResponse.json({
      success: true,
      message: 'Salary record updated successfully.',
      salary: updated,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

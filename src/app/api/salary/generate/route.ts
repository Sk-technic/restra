import { NextRequest, NextResponse } from 'next/server';
import { validateApiAuth } from '@/lib/api-guards';
import { connectToDatabase } from '@/lib/db';
import { Salary } from '@/models/Salary';
import { Staff } from '@/models/Staff';
import { Attendance } from '@/models/Attendance';

export async function POST(req: NextRequest) {
  const auth = await validateApiAuth(req, { requiredPermission: 'salary.manage' });
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const body = await req.json();
    const { month, year, staffId } = body;

    const targetMonth = Number(month) || new Date().getMonth() + 1;
    const targetYear = Number(year) || new Date().getFullYear();

    await connectToDatabase();

    const staffFilter: Record<string, any> = { status: { $ne: 'TERMINATED' } };
    if (staffId && staffId !== 'ALL') {
      staffFilter._id = staffId;
    }

    const staffMembers = await Staff.find(staffFilter);
    if (staffMembers.length === 0) {
      return NextResponse.json(
        { success: false, message: 'No eligible staff members found to generate salary.' },
        { status: 400 }
      );
    }

    const daysInMonth = new Date(targetYear, targetMonth, 0).getDate();
    const monthPrefix = `${targetYear}-${String(targetMonth).padStart(2, '0')}`;

    const generatedSalaries = [];

    for (const staff of staffMembers) {
      // Fetch staff attendance for this month
      const attendance = await Attendance.find({
        staffId: staff._id,
        date: { $regex: `^${monthPrefix}` },
      });

      let presentDays = 0;
      let absentDays = 0;
      let leaveDays = 0;
      let halfDays = 0;

      attendance.forEach((rec) => {
        if (rec.status === 'PRESENT') presentDays++;
        else if (rec.status === 'ABSENT') absentDays++;
        else if (rec.status === 'LEAVE') leaveDays++;
        else if (rec.status === 'HALF_DAY') halfDays++;
      });

      // If no attendance was logged yet, default presentDays to full working days or actual days recorded
      const totalLogged = presentDays + absentDays + leaveDays + halfDays;
      if (totalLogged === 0) {
        presentDays = daysInMonth;
      }

      const basicSalary = staff.salary || 0;
      const perDayRate = basicSalary / daysInMonth;
      
      // Calculate effective payable days
      const effectivePaidDays = presentDays + leaveDays + halfDays * 0.5;
      const calculatedPayable = Math.round(perDayRate * effectivePaidDays);

      // Check if existing salary record
      const existing = await Salary.findOne({
        staffId: staff._id,
        month: targetMonth,
        year: targetYear,
      });

      const bonus = existing?.bonus || 0;
      const deduction = existing?.deduction || 0;
      const netSalary = Math.max(0, calculatedPayable + bonus - deduction);

      const salaryRecord = await Salary.findOneAndUpdate(
        { staffId: staff._id, month: targetMonth, year: targetYear },
        {
          staffId: staff._id,
          month: targetMonth,
          year: targetYear,
          basicSalary,
          workingDays: daysInMonth,
          presentDays,
          absentDays,
          leaveDays,
          halfDays,
          deduction,
          bonus,
          netSalary,
          paymentStatus: existing?.paymentStatus || 'PENDING',
          paidAt: existing?.paidAt,
          paidBy: existing?.paidBy,
        },
        { upsert: true, new: true }
      ).populate('staffId');

      generatedSalaries.push(salaryRecord);
    }

    return NextResponse.json({
      success: true,
      message: `Generated salary calculation for ${generatedSalaries.length} staff member(s) for ${targetMonth}/${targetYear}.`,
      salaries: generatedSalaries,
    });
  } catch (error: any) {
    console.error('Salary generation error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to generate salary calculation', error: error.message },
      { status: 500 }
    );
  }
}

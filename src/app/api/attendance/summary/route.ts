import { NextRequest, NextResponse } from 'next/server';
import { validateApiAuth } from '@/lib/api-guards';
import { connectToDatabase } from '@/lib/db';
import { Attendance } from '@/models/Attendance';
import { Staff } from '@/models/Staff';

export async function GET(req: NextRequest) {
  const auth = await validateApiAuth(req, { requiredPermission: 'attendance.view' });
  if (auth.errorResponse) return auth.errorResponse;

  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0];

    const totalStaff = await Staff.countDocuments({ status: 'ACTIVE' });
    const attendanceRecords = await Attendance.find({ date });

    let presentToday = 0;
    let absentToday = 0;
    let halfDayToday = 0;
    let onLeaveToday = 0;

    attendanceRecords.forEach((rec) => {
      if (rec.status === 'PRESENT') presentToday++;
      else if (rec.status === 'ABSENT') absentToday++;
      else if (rec.status === 'HALF_DAY') halfDayToday++;
      else if (rec.status === 'LEAVE') onLeaveToday++;
    });

    const unmarked = Math.max(0, totalStaff - attendanceRecords.length);

    return NextResponse.json({
      success: true,
      summary: {
        date,
        totalStaff,
        presentToday,
        absentToday,
        halfDayToday,
        onLeaveToday,
        unmarked,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: 'Failed to fetch attendance summary', error: error.message },
      { status: 500 }
    );
  }
}

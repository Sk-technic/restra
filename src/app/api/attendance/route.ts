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
    const date = searchParams.get('date'); // YYYY-MM-DD
    const staffId = searchParams.get('staffId');
    const month = searchParams.get('month'); // YYYY-MM

    const filter: Record<string, any> = {};

    if (date) {
      filter.date = date;
    } else if (month) {
      filter.date = { $regex: `^${month}` };
    }

    if (staffId && staffId !== 'ALL') {
      filter.staffId = staffId;
    }

    const records = await Attendance.find(filter)
      .populate('staffId')
      .populate('markedBy', 'name email role')
      .sort({ date: -1, createdAt: -1 });

    return NextResponse.json({
      success: true,
      count: records.length,
      attendance: records,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: 'Failed to fetch attendance', error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const auth = await validateApiAuth(req, { requiredPermission: 'attendance.manage' });
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const body = await req.json();
    const { staffId, date, status, checkIn, checkOut, notes } = body;

    if (!staffId || !date || !status) {
      return NextResponse.json(
        { success: false, message: 'Staff ID, Date, and Attendance Status are required.' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Upsert or create to prevent duplicates gracefully
    const existing = await Attendance.findOne({ staffId, date });

    if (existing) {
      existing.status = status;
      if (checkIn !== undefined) existing.checkIn = checkIn;
      if (checkOut !== undefined) existing.checkOut = checkOut;
      if (notes !== undefined) existing.notes = notes;
      existing.markedBy = auth.user.userId as any;
      await existing.save();

      const populated = await Attendance.findById(existing._id).populate('staffId');
      return NextResponse.json({
        success: true,
        message: 'Attendance record updated successfully.',
        attendance: populated,
      });
    }

    const record = await Attendance.create({
      staffId,
      date,
      status,
      checkIn: checkIn || '',
      checkOut: checkOut || '',
      notes: notes || '',
      markedBy: auth.user.userId,
    });

    const populated = await Attendance.findById(record._id).populate('staffId');

    return NextResponse.json({
      success: true,
      message: 'Attendance marked successfully.',
      attendance: populated,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: 'Failed to save attendance', error: error.message },
      { status: 500 }
    );
  }
}

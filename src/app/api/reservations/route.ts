import { NextRequest, NextResponse } from 'next/server';
import { validateApiAuth } from '@/lib/api-guards';
import { connectToDatabase } from '@/lib/db';
import { Reservation } from '@/models/Reservation';
import { Table } from '@/models/Table';
import { Customer } from '@/models/Customer';

export async function GET(req: NextRequest) {
  const auth = await validateApiAuth(req, { requiredPermission: 'reservations.view' });
  if (auth.errorResponse) return auth.errorResponse;

  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const date = searchParams.get('date');
    const tableId = searchParams.get('tableId');
    const status = searchParams.get('status');

    const filter: Record<string, any> = {};
    if (date) filter.date = date;
    if (tableId && tableId !== 'ALL') filter.tableId = tableId;
    if (status && status !== 'ALL') filter.status = status;

    const reservations = await Reservation.find(filter)
      .populate('tableId')
      .populate('createdBy', 'name email')
      .sort({ date: 1, startTime: 1 });

    return NextResponse.json({
      success: true,
      count: reservations.length,
      reservations,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: 'Failed to fetch reservations', error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const auth = await validateApiAuth(req, { requiredPermission: 'reservations.create' });
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const body = await req.json();
    const {
      customerName,
      customerPhone,
      customerEmail,
      numberOfGuests,
      tableId,
      date,
      startTime,
      endTime,
      status,
      notes,
    } = body;

    if (!customerName || !customerPhone || !numberOfGuests || !tableId || !date || !startTime || !endTime) {
      return NextResponse.json(
        {
          success: false,
          message: 'Customer Name, Phone, Guests Count, Table, Date, Start Time, and End Time are required.',
        },
        { status: 400 }
      );
    }

    if (startTime >= endTime) {
      return NextResponse.json(
        { success: false, message: 'End time must be after start time.' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const targetTable = await Table.findById(tableId);
    if (!targetTable) {
      return NextResponse.json({ success: false, message: 'Selected table not found.' }, { status: 404 });
    }

    if (Number(numberOfGuests) > targetTable.capacity) {
      return NextResponse.json(
        {
          success: false,
          message: `Guest count (${numberOfGuests}) exceeds table capacity of ${targetTable.capacity} persons.`,
        },
        { status: 400 }
      );
    }

    // CHECK OVERLAPPING RESERVATIONS FOR THIS TABLE AND DATE
    const conflictingBookings = await Reservation.find({
      tableId,
      date,
      status: { $in: ['CONFIRMED', 'SEATED', 'PENDING'] },
      $and: [
        { startTime: { $lt: endTime } },
        { endTime: { $gt: startTime } },
      ],
    });

    if (conflictingBookings.length > 0) {
      const conflict = conflictingBookings[0];
      return NextResponse.json(
        {
          success: false,
          message: `Table ${targetTable.tableNumber} is already booked from ${conflict.startTime} to ${conflict.endTime} on ${date} for ${conflict.customerName}. Please choose another time slot or table.`,
        },
        { status: 400 }
      );
    }

    const reservation = await Reservation.create({
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      customerEmail: customerEmail?.trim()?.toLowerCase() || '',
      numberOfGuests: Number(numberOfGuests),
      tableId,
      date,
      startTime,
      endTime,
      status: status || 'CONFIRMED',
      notes: notes?.trim() || '',
      createdBy: auth.user.userId,
    });

    // Auto-update or create customer record
    if (customerPhone) {
      await Customer.findOneAndUpdate(
        { phone: customerPhone.trim() },
        {
          $setOnInsert: {
            name: customerName.trim(),
            phone: customerPhone.trim(),
            email: customerEmail?.trim()?.toLowerCase() || '',
          },
          $inc: { totalVisits: 1 },
          $set: { lastVisit: date },
        },
        { upsert: true }
      );
    }

    const populated = await Reservation.findById(reservation._id).populate('tableId');

    return NextResponse.json({
      success: true,
      message: 'Reservation created successfully.',
      reservation: populated,
    });
  } catch (error: any) {
    console.error('Reservation create error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create reservation', error: error.message },
      { status: 500 }
    );
  }
}

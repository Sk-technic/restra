import { NextRequest, NextResponse } from 'next/server';
import { validateApiAuth } from '@/lib/api-guards';
import { connectToDatabase } from '@/lib/db';
import { Reservation } from '@/models/Reservation';
import { Table } from '@/models/Table';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await validateApiAuth(req, { requiredPermission: 'reservations.view' });
  if (auth.errorResponse) return auth.errorResponse;

  const { id } = await params;
  try {
    await connectToDatabase();
    const reservation = await Reservation.findById(id).populate('tableId');
    if (!reservation) {
      return NextResponse.json({ success: false, message: 'Reservation not found.' }, { status: 404 });
    }
    return NextResponse.json({ success: true, reservation });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await validateApiAuth(req, { requiredPermission: 'reservations.update' });
  if (auth.errorResponse) return auth.errorResponse;

  const { id } = await params;
  try {
    const body = await req.json();
    await connectToDatabase();

    const reservation = await Reservation.findById(id);
    if (!reservation) {
      return NextResponse.json({ success: false, message: 'Reservation not found.' }, { status: 404 });
    }

    const tableId = body.tableId || reservation.tableId;
    const date = body.date || reservation.date;
    const startTime = body.startTime || reservation.startTime;
    const endTime = body.endTime || reservation.endTime;
    const status = body.status || reservation.status;

    if (body.startTime || body.endTime || body.date || body.tableId) {
      if (startTime >= endTime) {
        return NextResponse.json({ success: false, message: 'End time must be after start time.' }, { status: 400 });
      }

      // Overlap check excluding current reservation
      const conflictingBookings = await Reservation.find({
        _id: { $ne: id },
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
            message: `Table is already booked from ${conflict.startTime} to ${conflict.endTime} for ${conflict.customerName}.`,
          },
          { status: 400 }
        );
      }
    }

    if (body.customerName) reservation.customerName = body.customerName.trim();
    if (body.customerPhone) reservation.customerPhone = body.customerPhone.trim();
    if (body.customerEmail !== undefined) reservation.customerEmail = body.customerEmail.trim();
    if (body.numberOfGuests) reservation.numberOfGuests = Number(body.numberOfGuests);
    if (body.tableId) reservation.tableId = body.tableId;
    if (body.date) reservation.date = body.date;
    if (body.startTime) reservation.startTime = body.startTime;
    if (body.endTime) reservation.endTime = body.endTime;
    if (body.status) reservation.status = body.status;
    if (body.notes !== undefined) reservation.notes = body.notes.trim();

    await reservation.save();

    // If seated, update table status
    if (body.status === 'SEATED') {
      await Table.findByIdAndUpdate(reservation.tableId, { status: 'OCCUPIED' });
    } else if (body.status === 'COMPLETED' || body.status === 'CANCELLED') {
      await Table.findByIdAndUpdate(reservation.tableId, { status: 'AVAILABLE' });
    }

    const updated = await Reservation.findById(id).populate('tableId');

    return NextResponse.json({
      success: true,
      message: 'Reservation updated successfully.',
      reservation: updated,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await validateApiAuth(req, { requiredPermission: 'reservations.cancel' });
  if (auth.errorResponse) return auth.errorResponse;

  const { id } = await params;
  try {
    await connectToDatabase();
    const reservation = await Reservation.findById(id);
    if (!reservation) {
      return NextResponse.json({ success: false, message: 'Reservation not found.' }, { status: 404 });
    }

    await Reservation.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: 'Reservation cancelled and deleted successfully.',
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

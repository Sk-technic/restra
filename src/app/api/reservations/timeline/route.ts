import { NextRequest, NextResponse } from 'next/server';
import { validateApiAuth } from '@/lib/api-guards';
import { connectToDatabase } from '@/lib/db';
import { Table } from '@/models/Table';
import { Reservation } from '@/models/Reservation';

export async function GET(req: NextRequest) {
  const auth = await validateApiAuth(req, { requiredPermission: 'reservations.view' });
  if (auth.errorResponse) return auth.errorResponse;

  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0];
    const section = searchParams.get('section');

    const tableFilter: Record<string, any> = {};
    if (section && section !== 'ALL') {
      tableFilter.section = section;
    }

    const tables = await Table.find(tableFilter).sort({ tableNumber: 1 });
    const reservations = await Reservation.find({
      date,
      status: { $in: ['CONFIRMED', 'SEATED', 'PENDING'] },
    }).populate('createdBy', 'name');

    // Structure timeline per table
    const timeline = tables.map((table) => {
      const tableBookings = reservations.filter(
        (res) => res.tableId.toString() === table._id.toString()
      );

      return {
        table: {
          _id: table._id,
          tableNumber: table.tableNumber,
          capacity: table.capacity,
          section: table.section,
          status: table.status,
        },
        bookings: tableBookings.map((b) => ({
          _id: b._id,
          customerName: b.customerName,
          customerPhone: b.customerPhone,
          numberOfGuests: b.numberOfGuests,
          startTime: b.startTime,
          endTime: b.endTime,
          status: b.status,
          notes: b.notes,
        })),
      };
    });

    return NextResponse.json({
      success: true,
      date,
      timeSlots: [
        '10:00', '11:00', '12:00', '13:00', '14:00', '15:00',
        '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00'
      ],
      timeline,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: 'Failed to fetch timeline data', error: error.message },
      { status: 500 }
    );
  }
}

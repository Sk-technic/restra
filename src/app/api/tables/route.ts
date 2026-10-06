import { NextRequest, NextResponse } from 'next/server';
import { validateApiAuth } from '@/lib/api-guards';
import { connectToDatabase } from '@/lib/db';
import { Table } from '@/models/Table';

export async function GET(req: NextRequest) {
  const auth = await validateApiAuth(req, { requiredPermission: 'tables.view' });
  if (auth.errorResponse) return auth.errorResponse;

  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const section = searchParams.get('section');
    const status = searchParams.get('status');

    const filter: Record<string, any> = {};
    if (section && section !== 'ALL') filter.section = section;
    if (status && status !== 'ALL') filter.status = status;

    const tables = await Table.find(filter).sort({ tableNumber: 1 });

    return NextResponse.json({
      success: true,
      count: tables.length,
      tables,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: 'Failed to fetch tables', error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const auth = await validateApiAuth(req, { requiredPermission: 'tables.create' });
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const body = await req.json();
    const { tableNumber, capacity, section, status, notes } = body;

    if (!tableNumber || !capacity) {
      return NextResponse.json(
        { success: false, message: 'Table number/name and seating capacity are required.' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const existing = await Table.findOne({ tableNumber: tableNumber.trim() });
    if (existing) {
      return NextResponse.json(
        { success: false, message: 'A table with this number/name already exists.' },
        { status: 400 }
      );
    }

    const table = await Table.create({
      tableNumber: tableNumber.trim(),
      capacity: Number(capacity),
      section: section || 'Indoor',
      status: status || 'AVAILABLE',
      notes: notes || '',
    });

    return NextResponse.json({
      success: true,
      message: 'Table added successfully.',
      table,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: 'Failed to create table', error: error.message },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { validateApiAuth } from '@/lib/api-guards';
import { connectToDatabase } from '@/lib/db';
import { Table } from '@/models/Table';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await validateApiAuth(req, { requiredPermission: 'tables.view' });
  if (auth.errorResponse) return auth.errorResponse;

  const { id } = await params;
  try {
    await connectToDatabase();
    const table = await Table.findById(id);
    if (!table) {
      return NextResponse.json({ success: false, message: 'Table not found.' }, { status: 404 });
    }
    return NextResponse.json({ success: true, table });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await validateApiAuth(req, { requiredPermission: 'tables.update' });
  if (auth.errorResponse) return auth.errorResponse;

  const { id } = await params;
  try {
    const body = await req.json();
    await connectToDatabase();

    const table = await Table.findById(id);
    if (!table) {
      return NextResponse.json({ success: false, message: 'Table not found.' }, { status: 404 });
    }

    if (body.tableNumber) table.tableNumber = body.tableNumber.trim();
    if (body.capacity) table.capacity = Number(body.capacity);
    if (body.section) table.section = body.section;
    if (body.status) table.status = body.status;
    if (body.notes !== undefined) table.notes = body.notes.trim();

    await table.save();

    return NextResponse.json({
      success: true,
      message: 'Table updated successfully.',
      table,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await validateApiAuth(req, { requiredPermission: 'tables.delete' });
  if (auth.errorResponse) return auth.errorResponse;

  const { id } = await params;
  try {
    await connectToDatabase();
    const table = await Table.findById(id);
    if (!table) {
      return NextResponse.json({ success: false, message: 'Table not found.' }, { status: 404 });
    }

    await Table.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: 'Table removed successfully.',
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { validateApiAuth } from '@/lib/api-guards';
import { connectToDatabase } from '@/lib/db';
import { Staff } from '@/models/Staff';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await validateApiAuth(req, { requiredPermission: 'staff.view' });
  if (auth.errorResponse) return auth.errorResponse;

  const { id } = await params;
  try {
    await connectToDatabase();
    const staff = await Staff.findById(id);
    if (!staff) {
      return NextResponse.json({ success: false, message: 'Staff member not found.' }, { status: 404 });
    }
    return NextResponse.json({ success: true, staff });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await validateApiAuth(req, { requiredPermission: 'staff.update' });
  if (auth.errorResponse) return auth.errorResponse;

  const { id } = await params;
  try {
    const body = await req.json();
    await connectToDatabase();

    const staff = await Staff.findById(id);
    if (!staff) {
      return NextResponse.json({ success: false, message: 'Staff member not found.' }, { status: 404 });
    }

    if (body.fullName) staff.fullName = body.fullName.trim();
    if (body.profileImage) staff.profileImage = body.profileImage;
    if (body.mobileNumber) staff.mobileNumber = body.mobileNumber.trim();
    if (body.email !== undefined) staff.email = body.email.trim().toLowerCase();
    if (body.address !== undefined) staff.address = body.address.trim();
    if (body.gender) staff.gender = body.gender;
    if (body.dateOfBirth !== undefined) staff.dateOfBirth = body.dateOfBirth;
    if (body.joiningDate) staff.joiningDate = body.joiningDate;
    if (body.department) staff.department = body.department.trim();
    if (body.designation) staff.designation = body.designation.trim();
    if (body.salary !== undefined) staff.salary = Number(body.salary);
    if (body.emergencyContact !== undefined) staff.emergencyContact = body.emergencyContact.trim();
    if (body.status) staff.status = body.status;
    if (body.notes !== undefined) staff.notes = body.notes.trim();

    await staff.save();

    return NextResponse.json({
      success: true,
      message: 'Staff details updated successfully.',
      staff,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await validateApiAuth(req, { requiredPermission: 'staff.delete' });
  if (auth.errorResponse) return auth.errorResponse;

  const { id } = await params;
  try {
    await connectToDatabase();
    const staff = await Staff.findById(id);
    if (!staff) {
      return NextResponse.json({ success: false, message: 'Staff member not found.' }, { status: 404 });
    }

    await Staff.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: 'Staff member removed successfully.',
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

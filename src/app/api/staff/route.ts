import { NextRequest, NextResponse } from 'next/server';
import { validateApiAuth } from '@/lib/api-guards';
import { connectToDatabase } from '@/lib/db';
import { Staff } from '@/models/Staff';

export async function GET(req: NextRequest) {
  const auth = await validateApiAuth(req, { requiredPermission: 'staff.view' });
  if (auth.errorResponse) return auth.errorResponse;

  try {
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const department = searchParams.get('department') || '';
    const status = searchParams.get('status') || '';

    const filter: Record<string, any> = {};

    if (search) {
      filter.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { mobileNumber: { $regex: search, $options: 'i' } },
        { designation: { $regex: search, $options: 'i' } },
      ];
    }

    if (department && department !== 'ALL') {
      filter.department = department;
    }

    if (status && status !== 'ALL') {
      filter.status = status;
    }

    const staff = await Staff.find(filter).sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      count: staff.length,
      staff,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: 'Failed to fetch staff records', error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const auth = await validateApiAuth(req, { requiredPermission: 'staff.create' });
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const body = await req.json();
    const {
      fullName,
      profileImage,
      mobileNumber,
      email,
      address,
      gender,
      dateOfBirth,
      joiningDate,
      department,
      designation,
      salary,
      emergencyContact,
      status,
      notes,
    } = body;

    if (!fullName || !mobileNumber || !department || !designation || salary === undefined || !joiningDate) {
      return NextResponse.json(
        {
          success: false,
          message: 'Full Name, Mobile Number, Department, Designation, Joining Date, and Salary are required.',
        },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const newStaff = await Staff.create({
      fullName: fullName.trim(),
      profileImage: profileImage || '/images/staff/default-avatar.png',
      mobileNumber: mobileNumber.trim(),
      email: email?.trim().toLowerCase() || '',
      address: address?.trim() || '',
      gender: gender || 'MALE',
      dateOfBirth: dateOfBirth || '',
      joiningDate,
      department: department.trim(),
      designation: designation.trim(),
      salary: Number(salary),
      emergencyContact: emergencyContact?.trim() || '',
      status: status || 'ACTIVE',
      notes: notes?.trim() || '',
    });

    return NextResponse.json({
      success: true,
      message: 'Staff member added successfully.',
      staff: newStaff,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: 'Failed to create staff member', error: error.message },
      { status: 500 }
    );
  }
}

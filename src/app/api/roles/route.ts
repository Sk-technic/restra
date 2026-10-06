import { NextRequest, NextResponse } from 'next/server';
import { validateApiAuth } from '@/lib/api-guards';
import { connectToDatabase } from '@/lib/db';
import { Role } from '@/models/Role';

export async function GET(req: NextRequest) {
  const auth = await validateApiAuth(req, { requiredRole: 'ADMIN' });
  if (auth.errorResponse) return auth.errorResponse;

  try {
    await connectToDatabase();
    const roles = await Role.find().sort({ createdAt: -1 });
    return NextResponse.json({ success: true, roles });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: 'Failed to fetch roles', error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const auth = await validateApiAuth(req, { requiredRole: 'ADMIN' });
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const body = await req.json();
    const { name, description, permissions } = body;

    if (!name) {
      return NextResponse.json(
        { success: false, message: 'Role name is required.' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const existing = await Role.findOne({ name: name.trim() });
    if (existing) {
      return NextResponse.json(
        { success: false, message: 'A role with this name already exists.' },
        { status: 400 }
      );
    }

    const role = await Role.create({
      name: name.trim(),
      description: description || '',
      permissions: Array.isArray(permissions) ? permissions : [],
      isSystemRole: false,
    });

    return NextResponse.json({
      success: true,
      message: 'Role created successfully.',
      role,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: 'Failed to create role', error: error.message },
      { status: 500 }
    );
  }
}

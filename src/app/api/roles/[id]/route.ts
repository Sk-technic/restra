import { NextRequest, NextResponse } from 'next/server';
import { validateApiAuth } from '@/lib/api-guards';
import { connectToDatabase } from '@/lib/db';
import { Role } from '@/models/Role';
import { User } from '@/models/User';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await validateApiAuth(req, { requiredRole: 'ADMIN' });
  if (auth.errorResponse) return auth.errorResponse;

  const { id } = await params;
  try {
    await connectToDatabase();
    const role = await Role.findById(id);
    if (!role) {
      return NextResponse.json({ success: false, message: 'Role not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, role });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await validateApiAuth(req, { requiredRole: 'ADMIN' });
  if (auth.errorResponse) return auth.errorResponse;

  const { id } = await params;
  try {
    const body = await req.json();
    const { name, description, permissions } = body;

    await connectToDatabase();

    const role = await Role.findById(id);
    if (!role) {
      return NextResponse.json({ success: false, message: 'Role not found' }, { status: 404 });
    }

    if (name) role.name = name.trim();
    if (description !== undefined) role.description = description;
    if (Array.isArray(permissions)) role.permissions = permissions;

    await role.save();

    return NextResponse.json({
      success: true,
      message: 'Role updated successfully.',
      role,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await validateApiAuth(req, { requiredRole: 'ADMIN' });
  if (auth.errorResponse) return auth.errorResponse;

  const { id } = await params;
  try {
    await connectToDatabase();

    const role = await Role.findById(id);
    if (!role) {
      return NextResponse.json({ success: false, message: 'Role not found' }, { status: 404 });
    }

    if (role.isSystemRole) {
      return NextResponse.json(
        { success: false, message: 'Cannot delete default system role.' },
        { status: 400 }
      );
    }

    // Check if any active manager is using this role
    const assignedUsersCount = await User.countDocuments({ roleId: id });
    if (assignedUsersCount > 0) {
      return NextResponse.json(
        {
          success: false,
          message: `Cannot delete role. It is currently assigned to ${assignedUsersCount} manager(s).`,
        },
        { status: 400 }
      );
    }

    await Role.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: 'Role deleted successfully.',
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

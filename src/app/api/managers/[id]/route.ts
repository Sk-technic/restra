import { NextRequest, NextResponse } from 'next/server';
import { validateApiAuth } from '@/lib/api-guards';
import { connectToDatabase } from '@/lib/db';
import { User } from '@/models/User';
import { hashPassword } from '@/lib/auth';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await validateApiAuth(req, { requiredRole: 'ADMIN' });
  if (auth.errorResponse) return auth.errorResponse;

  const { id } = await params;
  try {
    await connectToDatabase();
    const manager = await User.findOne({ _id: id, role: 'MANAGER' })
      .populate('roleId')
      .select('-password');

    if (!manager) {
      return NextResponse.json({ success: false, message: 'Manager not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, manager });
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
    const { name, email, password, roleId, phone, isActive, avatar } = body;

    await connectToDatabase();

    const manager = await User.findOne({ _id: id, role: 'MANAGER' });
    if (!manager) {
      return NextResponse.json({ success: false, message: 'Manager not found' }, { status: 404 });
    }

    if (name) manager.name = name.trim();
    if (email) manager.email = email.toLowerCase().trim();
    if (roleId) manager.roleId = roleId;
    if (phone !== undefined) manager.phone = phone;
    if (isActive !== undefined) manager.isActive = isActive;
    if (avatar) manager.avatar = avatar;

    if (password && password.trim().length >= 6) {
      manager.password = await hashPassword(password);
    }

    await manager.save();

    const updated = await User.findById(id).populate('roleId').select('-password');

    return NextResponse.json({
      success: true,
      message: 'Manager updated successfully.',
      manager: updated,
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
    const manager = await User.findOne({ _id: id, role: 'MANAGER' });
    if (!manager) {
      return NextResponse.json({ success: false, message: 'Manager not found' }, { status: 404 });
    }

    await User.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: 'Manager deleted successfully.',
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { validateApiAuth } from '@/lib/api-guards';
import { connectToDatabase } from '@/lib/db';
import { User } from '@/models/User';
import { hashPassword } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const auth = await validateApiAuth(req, { requiredRole: 'ADMIN' });
  if (auth.errorResponse) return auth.errorResponse;

  try {
    await connectToDatabase();
    const managers = await User.find({ role: 'MANAGER' })
      .populate('roleId')
      .select('-password')
      .sort({ createdAt: -1 });

    return NextResponse.json({ success: true, managers });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: 'Failed to fetch managers', error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const auth = await validateApiAuth(req, { requiredRole: 'ADMIN' });
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const body = await req.json();
    const { name, email, password, roleId, phone, avatar } = body;

    if (!name || !email || !password || !roleId) {
      return NextResponse.json(
        { success: false, message: 'Name, email, password, and assigned role are required.' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return NextResponse.json(
        { success: false, message: 'A user with this email address already exists.' },
        { status: 400 }
      );
    }

    const hashedPassword = await hashPassword(password);

    const manager = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role: 'MANAGER',
      roleId,
      phone: phone || '',
      avatar: avatar || '/images/staff/default-avatar.png',
      isActive: true,
    });

    const populatedManager = await User.findById(manager._id)
      .populate('roleId')
      .select('-password');

    return NextResponse.json({
      success: true,
      message: 'Manager created successfully.',
      manager: populatedManager,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: 'Failed to create manager', error: error.message },
      { status: 500 }
    );
  }
}

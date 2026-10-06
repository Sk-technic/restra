import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { User, Role } from '@/models';
import { comparePassword, signJwtToken, AUTH_COOKIE_NAME } from '@/lib/auth';
import { ALL_PERMISSIONS } from '@/lib/permissions';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Please provide both email and password.' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const user = await User.findOne({ email: email.toLowerCase().trim() }).populate('roleId');

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Invalid credentials. User not found.' },
        { status: 401 }
      );
    }

    if (!user.isActive) {
      return NextResponse.json(
        { success: false, message: 'Your account has been deactivated. Please contact Administrator.' },
        { status: 403 }
      );
    }

    if (!user.password) {
      return NextResponse.json(
        { success: false, message: 'Invalid credentials. Please contact Administrator.' },
        { status: 401 }
      );
    }

    const isPasswordMatch = await comparePassword(password, user.password);
    if (!isPasswordMatch) {
      return NextResponse.json(
        { success: false, message: 'Invalid credentials. Incorrect password.' },
        { status: 401 }
      );
    }

    // Determine permissions
    let permissions: string[] = [];
    if (user.role === 'ADMIN') {
      permissions = ALL_PERMISSIONS.map((p) => p.id);
    } else if (user.roleId) {
      const roleDoc = user.roleId as unknown as { permissions?: string[] };
      permissions = roleDoc.permissions || [];
    }

    const tokenPayload = {
      userId: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
      permissions,
    };

    const token = signJwtToken(tokenPayload);

    const response = NextResponse.json({
      success: true,
      message: 'Logged in successfully.',
      token,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        phone: user.phone,
        permissions,
        roleDetails: user.roleId,
      },
    });

    // Set HTTP-Only Cookie
    response.cookies.set({
      name: AUTH_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return response;
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, message: 'An internal error occurred during login.', error: error.message },
      { status: 500 }
    );
  }
}

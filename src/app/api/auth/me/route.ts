import { NextRequest, NextResponse } from 'next/server';
import { validateApiAuth } from '@/lib/api-guards';
import { connectToDatabase } from '@/lib/db';
import { User } from '@/models';
import { ALL_PERMISSIONS } from '@/lib/permissions';

export async function GET(req: NextRequest) {
  const auth = await validateApiAuth(req);
  if (auth.errorResponse) return auth.errorResponse;

  try {
    await connectToDatabase();
    const dbUser = await User.findById(auth.user.userId).populate('roleId').select('-password');

    if (!dbUser) {
      return NextResponse.json(
        { success: false, message: 'User record not found.' },
        { status: 404 }
      );
    }

    let permissions: string[] = [];
    if (dbUser.role === 'ADMIN') {
      permissions = ALL_PERMISSIONS.map((p) => p.id);
    } else if (dbUser.roleId) {
      const roleDoc = dbUser.roleId as unknown as { permissions?: string[] };
      permissions = roleDoc.permissions || [];
    }

    return NextResponse.json({
      success: true,
      user: {
        id: dbUser._id.toString(),
        name: dbUser.name,
        email: dbUser.email,
        role: dbUser.role,
        avatar: dbUser.avatar,
        phone: dbUser.phone,
        permissions,
        roleDetails: dbUser.roleId,
        createdAt: dbUser.createdAt,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: 'Failed to fetch current user session', error: error.message },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { getAuthTokenFromRequest, verifyJwtToken } from './auth';
import { IAuthTokenPayload } from '@/types';
import { connectToDatabase } from './db';
import { User } from '@/models/User';
import { Role } from '@/models/Role';

export type GuardResult = 
  | { user: IAuthTokenPayload; errorResponse?: never }
  | { user?: never; errorResponse: NextResponse };

export async function validateApiAuth(
  req: NextRequest,
  options?: {
    requiredRole?: 'ADMIN' | 'MANAGER';
    requiredPermission?: string;
  }
): Promise<GuardResult> {
  const token = getAuthTokenFromRequest(req);

  if (!token) {
    return {
      errorResponse: NextResponse.json(
        { success: false, message: 'Authentication required. Please login.' },
        { status: 401 }
      ),
    };
  }

  const payload = verifyJwtToken(token);
  if (!payload) {
    return {
      errorResponse: NextResponse.json(
        { success: false, message: 'Invalid or expired authentication session.' },
        { status: 401 }
      ),
    };
  }

  // Verify user in database to ensure active status and latest permissions
  await connectToDatabase();
  const dbUser = await User.findById(payload.userId).populate('roleId');

  if (!dbUser || !dbUser.isActive) {
    return {
      errorResponse: NextResponse.json(
        { success: false, message: 'User account is deactivated or not found.' },
        { status: 403 }
      ),
    };
  }

  // Get active permissions from role
  let currentPermissions: string[] = [];
  if (dbUser.role === 'ADMIN') {
    currentPermissions = ['*']; // Admin has universal access
  } else if (dbUser.roleId) {
    // If roleId is populated as a Role document
    const roleDoc = dbUser.roleId as unknown as { permissions?: string[] };
    currentPermissions = roleDoc.permissions || [];
  }

  // Update user payload with current DB data
  const authenticatedUser: IAuthTokenPayload = {
    userId: dbUser._id.toString(),
    email: dbUser.email,
    name: dbUser.name,
    role: dbUser.role,
    permissions: currentPermissions,
  };

  // 1. Role requirement check
  if (options?.requiredRole && options.requiredRole === 'ADMIN' && authenticatedUser.role !== 'ADMIN') {
    return {
      errorResponse: NextResponse.json(
        { success: false, message: 'Access denied: Admin privileges required.' },
        { status: 403 }
      ),
    };
  }

  // 2. Permission requirement check
  if (options?.requiredPermission && authenticatedUser.role !== 'ADMIN') {
    const hasPerm = currentPermissions.includes(options.requiredPermission);
    if (!hasPerm) {
      return {
        errorResponse: NextResponse.json(
          {
            success: false,
            message: `Access denied: Missing required permission [${options.requiredPermission}].`,
          },
          { status: 403 }
        ),
      };
    }
  }

  return { user: authenticatedUser };
}

export function apiSuccess<T>(data: T, message?: string, status = 200) {
  return NextResponse.json(
    {
      success: true,
      data,
      message,
    },
    { status }
  );
}

export function apiError(message: string, status = 400, errors?: unknown) {
  return NextResponse.json(
    {
      success: false,
      message,
      errors,
    },
    { status }
  );
}

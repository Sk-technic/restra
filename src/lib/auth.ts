import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import { IAuthTokenPayload } from '@/types';

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_restra_jwt_key_2026_restaurant_system_production_key';
export const AUTH_COOKIE_NAME = 'restra_auth_token';

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function signJwtToken(payload: IAuthTokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: '7d',
  });
}

export function verifyJwtToken(token: string): IAuthTokenPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as IAuthTokenPayload;
    return decoded;
  } catch {
    return null;
  }
}

export function getAuthTokenFromRequest(req: NextRequest): string | null {
  // 1. Check Authorization header
  const authHeader = req.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  // 2. Check Cookie
  const cookieToken = req.cookies.get(AUTH_COOKIE_NAME)?.value;
  if (cookieToken) {
    return cookieToken;
  }

  return null;
}

export async function getCurrentUserFromCookies(): Promise<IAuthTokenPayload | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
    if (!token) return null;
    return verifyJwtToken(token);
  } catch {
    return null;
  }
}

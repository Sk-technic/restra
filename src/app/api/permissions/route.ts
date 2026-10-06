import { NextRequest, NextResponse } from 'next/server';
import { ALL_PERMISSIONS, PERMISSION_MODULES } from '@/lib/permissions';

export async function GET(req: NextRequest) {
  return NextResponse.json({
    success: true,
    permissions: ALL_PERMISSIONS,
    modules: PERMISSION_MODULES,
  });
}

import { NextRequest, NextResponse } from 'next/server';
import { seedDatabase } from '@/lib/seed';

export async function POST(req: NextRequest) {
  try {
    const result = await seedDatabase();
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Database seeding error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to seed database', error: error.message },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const result = await seedDatabase();
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Database seeding error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to seed database', error: error.message },
      { status: 500 }
    );
  }
}

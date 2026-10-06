import { NextRequest, NextResponse } from 'next/server';
import { validateApiAuth } from '@/lib/api-guards';
import path from 'path';
import fs from 'fs/promises';

export async function POST(req: NextRequest) {
  const auth = await validateApiAuth(req);
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const folder = (formData.get('folder') as string) || 'food'; // staff, food, categories, restaurant

    if (!file) {
      return NextResponse.json(
        { success: false, message: 'No image file provided in upload request.' },
        { status: 400 }
      );
    }

    const validFolders = ['staff', 'food', 'categories', 'restaurant'];
    const targetFolder = validFolders.includes(folder) ? folder : 'food';

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate safe unique filename
    const timestamp = Date.now();
    const originalExt = path.extname(file.name) || '.jpg';
    const cleanName = path.basename(file.name, originalExt).replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase();
    const filename = `${cleanName}-${timestamp}${originalExt}`;

    const uploadDir = path.join(process.cwd(), 'public', 'images', targetFolder);
    await fs.mkdir(uploadDir, { recursive: true });

    const filePath = path.join(uploadDir, filename);
    await fs.writeFile(filePath, buffer);

    const publicUrl = `/images/${targetFolder}/${filename}`;

    return NextResponse.json({
      success: true,
      message: 'Image uploaded successfully.',
      url: publicUrl,
      filename,
    });
  } catch (error: any) {
    console.error('Image upload error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to upload image.', error: error.message },
      { status: 500 }
    );
  }
}

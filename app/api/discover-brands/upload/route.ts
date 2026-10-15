import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file uploaded' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Sanitize filename
    const ext = path.extname(file.name) || '.webp';
    const cleanBase = path.basename(file.name, ext).replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase();
    const uniqueName = `brand_logo_${Date.now()}_${cleanBase}${ext}`;

    const uploadDir = path.join(process.cwd(), 'public', 'assets', 'uploads', 'brands');
    await fs.mkdir(uploadDir, { recursive: true });

    const filePath = path.join(uploadDir, uniqueName);
    await fs.writeFile(filePath, buffer);

    const publicUrl = `/assets/uploads/brands/${uniqueName}`;

    return NextResponse.json({
      success: true,
      url: publicUrl,
      filename: uniqueName
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Brand logo upload failed' },
      { status: 500 }
    );
  }
}

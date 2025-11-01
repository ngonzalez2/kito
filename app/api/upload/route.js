import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export async function POST(request) {
  try {
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      throw new Error('Missing BLOB_READ_WRITE_TOKEN environment variable.');
    }

    const formData = await request.formData();
    const file = formData.get('file');

    if (!file || typeof file === 'string') {
      return NextResponse.json({ error: 'No image file provided.' }, { status: 400 });
    }

    if (typeof file.name !== 'string' || !file.name.trim()) {
      return NextResponse.json({ error: 'File name is required.' }, { status: 400 });
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json({ error: 'Unsupported file type.' }, { status: 415 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'File exceeds 5MB upload limit.' }, { status: 413 });
    }

    const extension = file.name.split('.').pop()?.toLowerCase() ?? 'jpg';
    const safeName = file.name.replace(/[^a-zA-Z0-9.\-]/g, '_');
    const uniqueKey = `listings/${Date.now()}-${safeName}`;

    console.info('[API /upload] storing file %s (%s bytes)', uniqueKey, file.size);

    const { url } = await put(uniqueKey, file, {
      access: 'public',
      contentType: file.type || `image/${extension}`,
    });

    return NextResponse.json({ url });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[API /upload] POST failed:', message);
    return NextResponse.json({ error: 'Failed to upload image.' }, { status: 500 });
  }
}

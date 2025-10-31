import { NextResponse } from 'next/server';
import { createReport, getListingById } from '@/lib/listings';

export async function POST(request) {
  try {
    const payload = await request.json();
    const listingId = Number(payload?.listingId);
    const reason = payload?.reason?.trim();

    if (!listingId || !reason) {
      return NextResponse.json({ error: 'Listing and reason are required.' }, { status: 400 });
    }

    const listing = await getListingById(listingId);
    if (!listing || listing.status !== 'approved') {
      return NextResponse.json({ error: 'Listing not found.' }, { status: 404 });
    }

    const report = await createReport(listingId, reason);
    return NextResponse.json({ report });
  } catch (error) {
    console.error('[POST /api/reports] failed', error);
    return NextResponse.json({ error: 'Failed to submit report.' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createReport, getListingById } from '@/lib/listings';

export const runtime = 'nodejs';

const reportSchema = z.object({
  listingId: z.coerce
    .number({ invalid_type_error: 'Listing is required.' })
    .int('Listing is required.'),
  reason: z.string().trim().min(1, 'Reason is required.'),
});

export async function POST(request) {
  try {
    const payload = await request.json().catch(() => ({}));
    const parsed = reportSchema.safeParse(payload);
    if (!parsed.success) {
      const { fieldErrors } = parsed.error.flatten();
      const message = fieldErrors.reason?.[0] || fieldErrors.listingId?.[0] || 'Listing and reason are required.';
      return NextResponse.json({ error: message }, { status: 400 });
    }

    const { listingId, reason } = parsed.data;
    const listing = await getListingById(listingId);
    if (!listing || listing.status !== 'approved') {
      return NextResponse.json({ error: 'Listing not found.' }, { status: 404 });
    }

    const report = await createReport(listingId, reason);
    return NextResponse.json({ report });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[API /reports] POST failed:', message);
    return NextResponse.json({ error: 'Failed to submit report.' }, { status: 500 });
  }
}

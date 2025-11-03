import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { assertAdminAccessFromRequest } from '@/lib/auth';
import { updateListingStatus, LISTING_STATUSES, ListingStatus } from '@/lib/listings';

export const runtime = 'nodejs';
export const preferredRegion = 'iad1';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

function isListingStatus(value: unknown): value is ListingStatus {
  return LISTING_STATUSES.includes(value as ListingStatus);
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    if (!assertAdminAccessFromRequest(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const listingId = Number(params.id);
    if (!Number.isFinite(listingId)) {
      return NextResponse.json({ error: 'Invalid listing id' }, { status: 400 });
    }
    const { status } = (await request.json().catch(() => ({}))) as { status?: unknown };
    if (!status || !isListingStatus(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }
    const listing = await updateListingStatus(listingId, status);
    if (!listing) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    revalidatePath('/');
    revalidatePath('/listings');
    revalidatePath('/admin');

    return NextResponse.json({ listing, message: `Listing ${status}` });
  } catch (error) {
    console.error('[PATCH /api/listings/:id/status]', error);
    return NextResponse.json({ error: 'Failed to update status' }, { status: 500 });
  }
}

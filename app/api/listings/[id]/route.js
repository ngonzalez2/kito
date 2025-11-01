import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { assertAdminAccess } from '@/lib/auth';
import { LISTING_STATUSES, deleteListing, getListingById, updateListingStatus } from '@/lib/listings';

async function sendModerationNotification(listing, status) {
  // Placeholder for integration with Vercel's email API or any notification provider.
  console.info(`Listing ${listing.id} (${listing.title}) status changed to ${status}.`);
}

function unauthorizedResponse() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}

export async function PUT(request, { params }) {
  try {
    if (!assertAdminAccess(request)) {
      return unauthorizedResponse();
    }

    const listingId = Number(params.id);
    if (!Number.isFinite(listingId)) {
      return NextResponse.json({ error: 'Invalid listing id.' }, { status: 400 });
    }

    const payload = await request.json();
    const nextStatus = payload?.status;
    if (!LISTING_STATUSES.includes(nextStatus)) {
      return NextResponse.json({ error: 'Invalid status provided.' }, { status: 400 });
    }

    const updated = await updateListingStatus(listingId, nextStatus);
    if (!updated) {
      return NextResponse.json({ error: 'Listing not found.' }, { status: 404 });
    }

    await sendModerationNotification(updated, nextStatus);
    revalidatePath('/');
    revalidatePath('/listings');
    revalidatePath('/admin');

    return NextResponse.json({ listing: updated });
  } catch (error) {
    console.error(`[PUT /api/listings/${params.id}] failed`, error);
    return NextResponse.json({ error: 'Failed to update listing.' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    if (!assertAdminAccess(request)) {
      return unauthorizedResponse();
    }

    const listingId = Number(params.id);
    if (!Number.isFinite(listingId)) {
      return NextResponse.json({ error: 'Invalid listing id.' }, { status: 400 });
    }

    const listing = await getListingById(listingId);
    if (!listing) {
      return NextResponse.json({ error: 'Listing not found.' }, { status: 404 });
    }

    await deleteListing(listingId);
    revalidatePath('/');
    revalidatePath('/listings');
    revalidatePath('/admin');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`[DELETE /api/listings/${params.id}] failed`, error);
    return NextResponse.json({ error: 'Failed to delete listing.' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { assertAdminAccessFromRequest } from '@/lib/auth';
import { setListingPrimaryImage } from '@/lib/listings';

export const runtime = 'nodejs';
export const preferredRegion = 'iad1';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string; imageId: string } },
) {
  try {
    if (!assertAdminAccessFromRequest(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, imageId } = params;
    const listingId = Number(id);
    const listingImageId = Number(imageId);

    if (!Number.isFinite(listingId) || !Number.isFinite(listingImageId)) {
      return NextResponse.json({ error: 'Invalid listing or image id.' }, { status: 400 });
    }

    const listing = await setListingPrimaryImage(listingId, listingImageId);
    if (!listing) {
      return NextResponse.json({ error: 'Listing image not found.' }, { status: 404 });
    }

    revalidatePath('/');
    revalidatePath('/listings');
    revalidatePath('/admin');

    return NextResponse.json({ listing, message: 'Primary image updated.' });
  } catch (error) {
    console.error(
      `[PATCH /api/listings/${params.id}/images/${params.imageId}/primary] failed`,
      error,
    );
    return NextResponse.json({ error: 'Failed to update primary image.' }, { status: 500 });
  }
}

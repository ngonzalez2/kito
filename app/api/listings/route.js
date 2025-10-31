import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { assertAdminAccess } from '@/lib/auth';
import { createListing, getAllListings, getApprovedListings } from '@/lib/listings';

function parseFilters(searchParams) {
  return {
    category: searchParams.get('category') || null,
    condition: searchParams.get('condition') || null,
    location: searchParams.get('location') || null,
  };
}

function validateListingPayload(payload) {
  const errors = [];
  if (!payload.title || !payload.title.trim()) {
    errors.push('Title is required.');
  }
  if (payload.price === undefined || payload.price === null || Number.isNaN(Number(payload.price))) {
    errors.push('Price must be a valid number.');
  }
  if (!payload.description || !payload.description.trim()) {
    errors.push('Description is required.');
  }
  if (!payload.condition) {
    errors.push('Condition is required.');
  }
  if (!payload.location) {
    errors.push('Location is required.');
  }
  if (!payload.category) {
    errors.push('Category is required.');
  }
  if (!payload.imageUrl) {
    errors.push('Image URL is required.');
  }
  return errors;
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const includeAll = searchParams.get('includeAll') === 'true';

    if (includeAll) {
      const authorized = assertAdminAccess(request);
      if (!authorized) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      const listings = await getAllListings();
      return NextResponse.json({ listings });
    }

    const listings = await getApprovedListings(parseFilters(searchParams));
    return NextResponse.json({ listings });
  } catch (error) {
    console.error('[GET /api/listings] failed', error);
    return NextResponse.json({ error: 'Failed to load listings.' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const payload = await request.json();
    const errors = validateListingPayload(payload);
    if (errors.length > 0) {
      return NextResponse.json({ error: errors.join(' ') }, { status: 400 });
    }

    const listing = await createListing({
      title: payload.title.trim(),
      description: payload.description.trim(),
      price: Number(payload.price),
      condition: payload.condition,
      location: payload.location,
      category: payload.category,
      imageUrl: payload.imageUrl,
    });

    revalidatePath('/');
    revalidatePath('/listings');
    revalidatePath('/admin');

    return NextResponse.json({ listing, message: 'Listing submitted for approval.' }, { status: 201 });
  } catch (error) {
    console.error('[POST /api/listings] failed', error);
    return NextResponse.json({ error: 'Failed to create listing.' }, { status: 500 });
  }
}

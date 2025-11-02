import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { assertAdminAccess } from '@/lib/auth';
import { attachImagesToListings, createListing, getAllListings, getApprovedListings } from '@/lib/listings';

export const runtime = 'nodejs';
export const preferredRegion = 'iad1';

type ListingPayload = {
  title: string;
  description: string;
  price: number | string;
  condition: string;
  location: string;
  category: string | null;
  brand: string | null;
  model: string | null;
  year: number | string;
  images?: string[];
  imageUrl?: string | null;
};

function parseFilters(searchParams: URLSearchParams) {
  const yearParam = searchParams.get('year');
  const parsedYear = yearParam ? Number(yearParam) : null;
  return {
    category: searchParams.get('category'),
    condition: searchParams.get('condition'),
    location: searchParams.get('location'),
    brand: searchParams.get('brand'),
    model: searchParams.get('model'),
    year: Number.isFinite(parsedYear) ? parsedYear : null,
  };
}

function validateListingPayload(payload: Partial<ListingPayload>) {
  const errors: string[] = [];
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
  if (!payload.brand || !payload.brand.trim()) {
    errors.push('Brand is required.');
  }
  if (!payload.model || !payload.model.trim()) {
    errors.push('Model is required.');
  }
  if (payload.year === undefined || payload.year === null || Number.isNaN(Number(payload.year))) {
    errors.push('Year must be a valid number.');
  }
  const hasLegacyImageUrl = typeof payload.imageUrl === 'string' && payload.imageUrl.trim().length > 0;
  const hasImagesArray = Array.isArray(payload.images) && payload.images.length > 0;

  if (!hasLegacyImageUrl && !hasImagesArray) {
    errors.push('At least one image is required.');
  }

  if (hasImagesArray) {
    if (payload.images!.length > 5) {
      errors.push('You can upload up to 5 images.');
    }
    const invalidImage = payload.images!.some(
      (image) => typeof image !== 'string' || !image || image.trim().length === 0,
    );
    if (invalidImage) {
      errors.push('Image URLs must be non-empty strings.');
    }
  }
  return errors;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const includeAll = searchParams.get('includeAll') === 'true';
    const statusFilter = searchParams.get('status');
    const requestingPending = statusFilter === 'pending';

    if (includeAll || requestingPending) {
      console.log('[GET /api/listings] Fetching pending listings...');

      if (!assertAdminAccess(request)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      const listings = await getAllListings();
      const listingsWithImages = await attachImagesToListings(listings);
      return NextResponse.json({ listings: listingsWithImages });
    }

    const listings = await getApprovedListings(parseFilters(searchParams));
    return NextResponse.json({ listings });
  } catch (error) {
    console.error('[GET /api/listings] Failed to load listings:', error);
    return NextResponse.json({ error: 'Failed to load listings' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as Partial<ListingPayload>;
    const errors = validateListingPayload(payload);
    if (errors.length > 0) {
      return NextResponse.json({ error: errors.join(' ') }, { status: 400 });
    }

    const listing = await createListing({
      title: payload.title!.trim(),
      description: payload.description!.trim(),
      price: Number(payload.price),
      condition: payload.condition!,
      location: payload.location!,
      category: payload.category ?? null,
      brand: payload.brand!.trim(),
      model: payload.model!.trim(),
      year: Number(payload.year),
      images: Array.isArray(payload.images)
        ? payload.images.filter((value): value is string => typeof value === 'string')
        : [],
      imageUrl: payload.imageUrl ?? null,
    });

    revalidatePath('/');
    revalidatePath('/listings');
    revalidatePath('/admin');

    return NextResponse.json(
      { listing, message: 'Listing submitted for approval.' },
      { status: 201 },
    );
  } catch (error) {
    console.error('[POST /api/listings]', error);
    return NextResponse.json({ error: 'Failed to create listing.' }, { status: 500 });
  }
}

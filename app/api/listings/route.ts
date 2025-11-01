import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { assertAdminAccess } from '@/lib/auth';
import { createListing, getAllListings, getApprovedListings } from '@/lib/listings';

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
  imageUrl: string | null;
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
  if (!payload.imageUrl) {
    errors.push('Image URL is required.');
  }
  return errors;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const includeAll = searchParams.get('includeAll') === 'true';

    if (includeAll) {
      if (!assertAdminAccess(request)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      const listings = await getAllListings();
      return NextResponse.json({ listings });
    }

    const listings = await getApprovedListings(parseFilters(searchParams));
    return NextResponse.json({ listings });
  } catch (error) {
    console.error('[GET /api/listings]', error);
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

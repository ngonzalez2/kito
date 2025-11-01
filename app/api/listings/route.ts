import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { assertAdminAccess } from '@/lib/auth';
import { createListing, getAllListings, getApprovedListings } from '@/lib/listings';
import { checkThrottle } from '@/lib/throttle';

export const runtime = 'nodejs';
export const preferredRegion = 'iad1';

const queryFilterSchema = z
  .object({
    category: z.string().trim().min(1).optional(),
    condition: z.string().trim().min(1).optional(),
    location: z.string().trim().min(1).optional(),
    brand: z.string().trim().min(1).optional(),
    model: z.string().trim().min(1).optional(),
    year: z
      .string()
      .trim()
      .regex(/^\d+$/, { message: 'Year must be a valid number.' })
      .transform((value) => Number(value))
      .optional(),
  });

const listingPayloadSchema = z.object({
  title: z.string().trim().min(1, 'Title is required.'),
  description: z.string().trim().min(1, 'Description is required.'),
  price: z.coerce.number({ invalid_type_error: 'Price must be a valid number.' }).nonnegative({
    message: 'Price must be a valid number.',
  }),
  condition: z.string().trim().min(1, 'Condition is required.'),
  location: z.string().trim().min(1, 'Location is required.'),
  category: z.string().trim().min(1, 'Category is required.'),
  brand: z.string().trim().min(1, 'Brand is required.'),
  model: z.string().trim().min(1, 'Model is required.'),
  year: z.coerce
    .number({ invalid_type_error: 'Year must be a valid number.' })
    .int('Year must be a valid number.'),
  imageUrl: z.string().url('Image URL is required.'),
});

function parseFilters(searchParams: URLSearchParams) {
  const rawFilters = Object.fromEntries(searchParams.entries());
  const parsed = queryFilterSchema.safeParse(rawFilters);
  if (!parsed.success) {
    console.warn('[API /listings] filter parse failed', parsed.error.flatten().fieldErrors);
    return {
      category: null,
      condition: null,
      location: null,
      brand: null,
      model: null,
      year: null,
    };
  }

  const normalized = parsed.data;
  const normalizeValue = (value: unknown) => {
    if (value === undefined || value === null) {
      return null;
    }
    if (typeof value === 'string') {
      const trimmed = value.trim();
      if (!trimmed || trimmed === 'null' || trimmed === 'undefined') {
        return null;
      }
      return trimmed;
    }
    return value as string | number;
  };
  return {
    category: normalizeValue(normalized.category) as string | null,
    condition: normalizeValue(normalized.condition) as string | null,
    location: normalizeValue(normalized.location) as string | null,
    brand: normalizeValue(normalized.brand) as string | null,
    model: normalizeValue(normalized.model) as string | null,
    year: typeof normalized.year === 'number' ? normalized.year : null,
  };
}

function getClientIdentifier(request: Request, scope: string) {
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0]?.trim() : '';
  return `${ip || 'unknown'}:${scope}`;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const includeAll = searchParams.get('includeAll') === 'true';
    const filters = parseFilters(searchParams);

    if (includeAll) {
      if (!assertAdminAccess(request)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      console.info('[API /listings] GET includeAll');
      const listings = await getAllListings();
      return NextResponse.json({ listings });
    }

    console.info('[API /listings] GET filters %o', filters);
    const listings = await getApprovedListings(filters);
    return NextResponse.json({ listings });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[API /listings] GET failed:', message);
    return NextResponse.json({ error: 'Failed to load listings.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const throttleKey = getClientIdentifier(request, 'create-listing');
    const throttle = checkThrottle(throttleKey);
    if (throttle.throttled) {
      return NextResponse.json(
        { error: 'Please wait a moment before submitting again.' },
        { status: 429, headers: { 'Retry-After': String(throttle.retryAfterSeconds) } },
      );
    }

    const payload = await request.json().catch(() => ({}));
    const parsedPayload = listingPayloadSchema.safeParse(payload);
    if (!parsedPayload.success) {
      const { fieldErrors } = parsedPayload.error.flatten();
      const errors = Object.fromEntries(
        Object.entries(fieldErrors)
          .filter(([, messages]) => messages && messages.length > 0)
          .map(([field, messages]) => [field, messages[0]!]),
      ) as Record<string, string>;
      return NextResponse.json(
        {
          error: 'Please correct the highlighted fields.',
          fieldErrors: errors,
        },
        { status: 400 },
      );
    }

    console.info('[API /listings] POST create listing request');
    const listing = await createListing({
      title: parsedPayload.data.title,
      description: parsedPayload.data.description,
      price: parsedPayload.data.price,
      condition: parsedPayload.data.condition,
      location: parsedPayload.data.location,
      category: parsedPayload.data.category,
      brand: parsedPayload.data.brand,
      model: parsedPayload.data.model,
      year: parsedPayload.data.year,
      imageUrl: parsedPayload.data.imageUrl,
    });

    revalidatePath('/');
    revalidatePath('/listings');
    revalidatePath('/admin');

    return NextResponse.json(
      { listing, message: 'Listing submitted for approval.' },
      { status: 201 },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[API /listings] POST failed:', message);
    return NextResponse.json({ error: 'Failed to create listing.' }, { status: 500 });
  }
}

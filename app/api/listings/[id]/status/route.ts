import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { assertAdminAccess } from '@/lib/auth';
import { updateListingStatus, ListingStatus } from '@/lib/listings';
import { checkThrottle } from '@/lib/throttle';

export const runtime = 'nodejs';
export const preferredRegion = 'iad1';

const moderatedStatuses = ['approved', 'rejected'] as const satisfies readonly ListingStatus[];

const statusSchema = z.object({
  status: z.enum(moderatedStatuses, {
    errorMap: () => ({ message: 'Status must be approved or rejected.' }),
  }),
});

function getClientIdentifier(request: Request, scope: string) {
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0]?.trim() : '';
  return `${ip || 'unknown'}:${scope}`;
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    if (!assertAdminAccess(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const throttleKey = getClientIdentifier(request, 'update-listing-status');
    const throttle = checkThrottle(throttleKey);
    if (throttle.throttled) {
      return NextResponse.json(
        { error: 'Please wait a moment before submitting again.' },
        { status: 429, headers: { 'Retry-After': String(throttle.retryAfterSeconds) } },
      );
    }

    const payload = await request.json().catch(() => ({}));
    const parsed = statusSchema.safeParse(payload);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid status value provided.' },
        { status: 400 },
      );
    }
    console.info('[API /listings/:id/status] PATCH %s -> %s', params.id, parsed.data.status);
    const listing = await updateListingStatus(Number(params.id), parsed.data.status as ListingStatus);
    if (!listing) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    revalidatePath('/');
    revalidatePath('/listings');
    revalidatePath('/admin');

    return NextResponse.json({ listing, message: `Listing ${parsed.data.status}` });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[API /listings/:id/status] PATCH failed:', message);
    return NextResponse.json({ error: 'Failed to update status' }, { status: 500 });
  }
}

import { withDb, sql } from './db';

export const LISTING_STATUSES = ['pending', 'approved', 'rejected'] as const;
export type ListingStatus = (typeof LISTING_STATUSES)[number];

type Filters = {
  category?: string | null;
  condition?: string | null;
  location?: string | null;
  brand?: string | null;
  model?: string | null;
  year?: number | string | null;
};

type NormalizedFilters = Required<Filters>;

export type ListingRecord = {
  id: number;
  title: string;
  description: string | null;
  price: number;
  condition: string | null;
  location: string | null;
  category: string | null;
  brand: string | null;
  model: string | null;
  year: number | null;
  image_url: string | null;
  status: ListingStatus;
  created_at: string;
};

export type Listing = {
  id: number;
  title: string;
  description: string | null;
  price: number;
  condition: string | null;
  location: string | null;
  category: string | null;
  brand: string | null;
  model: string | null;
  year: number | null;
  imageUrl: string | null;
  status: ListingStatus;
  createdAt: string;
};

export type CreateListingInput = {
  title: string;
  description: string;
  price: number;
  condition: string;
  location: string;
  category: string | null;
  brand: string | null;
  model: string | null;
  year: number | null;
  imageUrl: string | null;
};

function normalizeFilters(filters: Filters = {}): NormalizedFilters {
  const trimmedCategory = filters.category?.trim();
  const trimmedCondition = filters.condition?.trim();
  const trimmedLocation = filters.location?.trim();
  const trimmedBrand = filters.brand?.trim();
  const trimmedModel = filters.model?.trim();
  const normalizedYear = (() => {
    if (typeof filters.year === 'number') {
      return Number.isFinite(filters.year) ? filters.year : null;
    }
    if (typeof filters.year === 'string') {
      const trimmedYear = filters.year.trim();
      if (!trimmedYear) {
        return null;
      }
      const parsed = Number(trimmedYear);
      return Number.isFinite(parsed) ? parsed : null;
    }
    return null;
  })();

  return {
    category: trimmedCategory ? trimmedCategory : null,
    condition: trimmedCondition ? trimmedCondition : null,
    location: trimmedLocation ? trimmedLocation : null,
    brand: trimmedBrand ? trimmedBrand : null,
    model: trimmedModel ? trimmedModel : null,
    year: normalizedYear,
  };
}

function normalizeListing(row: ListingRecord): Listing {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    price: row.price,
    condition: row.condition,
    location: row.location,
    category: row.category,
    brand: row.brand,
    model: row.model,
    year: row.year,
    imageUrl: row.image_url,
    status: row.status,
    createdAt: row.created_at,
  };
}

export async function getApprovedListings(filters: Filters = {}): Promise<Listing[]> {
  const { category, condition, location, brand, model, year } = normalizeFilters(filters);
  const brandPattern = brand ? `%${brand}%` : null;
  const modelPattern = model ? `%${model}%` : null;

  console.info('[DB getApprovedListings] filters %o', {
    category,
    condition,
    location,
    brand,
    model,
    year,
  });

  try {
    return await withDb(async () => {
      const result = await sql`
      SELECT *
      FROM listings
      WHERE status = 'approved'
        AND (${category}::text IS NULL OR category = ${category})
        AND (${condition}::text IS NULL OR condition = ${condition})
        AND (${location}::text IS NULL OR location = ${location})
        AND (${brandPattern}::text IS NULL OR brand ILIKE ${brandPattern})
        AND (${modelPattern}::text IS NULL OR model ILIKE ${modelPattern})
        AND (${year}::int IS NULL OR year = ${year})
      ORDER BY created_at DESC;
      `;
      return (result.rows as ListingRecord[]).map(normalizeListing);
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[DB getApprovedListings] failed:', message);
    throw error;
  }
}

export async function getAllListings(): Promise<Listing[]> {
  console.info('[DB getAllListings] fetch all listings');
  try {
    return await withDb(async () => {
      const result = await sql`SELECT * FROM listings ORDER BY created_at DESC;`;
      return (result.rows as ListingRecord[]).map(normalizeListing);
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[DB getAllListings] failed:', message);
    throw error;
  }
}

export async function getPendingListings(): Promise<Listing[]> {
  console.info('[DB getPendingListings] fetch pending listings');
  try {
    return await withDb(async () => {
      const result = await sql`
      SELECT * FROM listings WHERE status = 'pending' ORDER BY created_at DESC;
    `;
      return (result.rows as ListingRecord[]).map(normalizeListing);
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[DB getPendingListings] failed:', message);
    throw error;
  }
}

export async function getListingById(id: number | string): Promise<Listing | null> {
  const listingId = Number(id);
  if (!Number.isFinite(listingId)) {
    throw new Error('Invalid listing id');
  }
  console.info('[DB getListingById] id=%s', listingId);
  try {
    return await withDb(async () => {
      const result = await sql`SELECT * FROM listings WHERE id = ${listingId} LIMIT 1;`;
      const row = result.rows[0] as ListingRecord | undefined;
      return row ? normalizeListing(row) : null;
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[DB getListingById] failed:', message);
    throw error;
  }
}

export async function createListing(listing: CreateListingInput): Promise<Listing> {
  const {
    title,
    description,
    price,
    condition,
    location,
    category,
    brand,
    model,
    year,
    imageUrl,
  } = listing;

  console.info('[DB createListing] title=%s price=%s', title, price);
  try {
    return await withDb(async () => {
      const result = await sql`
      INSERT INTO listings (
        title,
        description,
        price,
        condition,
        location,
        category,
        image_url,
        brand,
        model,
        year,
        status
      )
      VALUES (
        ${title},
        ${description},
        ${price},
        ${condition},
        ${location},
        ${category},
        ${imageUrl},
        ${brand},
        ${model},
        ${year},
        'pending'
      )
      RETURNING *;
      `;
      return normalizeListing(result.rows[0] as ListingRecord);
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[DB createListing] failed:', message);
    throw error;
  }
}

export async function updateListingStatus(id: number, status: ListingStatus): Promise<Listing | null> {
  if (!LISTING_STATUSES.includes(status)) {
    throw new Error(`Unsupported listing status: ${status}`);
  }
  const listingId = Number(id);
  if (!Number.isFinite(listingId)) {
    throw new Error('Invalid listing id');
  }
  console.info('[DB updateListingStatus] id=%s status=%s', listingId, status);
  try {
    return await withDb(async () => {
      const result = await sql`
      UPDATE listings
      SET status = ${status}
      WHERE id = ${listingId}
      RETURNING *;
    `;
      const row = result.rows[0] as ListingRecord | undefined;
      return row ? normalizeListing(row) : null;
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[DB updateListingStatus] failed:', message);
    throw error;
  }
}

export async function deleteListing(id: number | string): Promise<boolean> {
  const listingId = Number(id);
  if (!Number.isFinite(listingId)) {
    throw new Error('Invalid listing id');
  }
  console.info('[DB deleteListing] id=%s', listingId);
  try {
    return await withDb(async () => {
      const result = await sql`DELETE FROM listings WHERE id = ${listingId} RETURNING id;`;
      return (result.rowCount ?? 0) > 0;
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[DB deleteListing] failed:', message);
    throw error;
  }
}

export async function createReport(listingId: number, reason: string) {
  console.info('[DB createReport] listingId=%s', listingId);
  try {
    return await withDb(async () => {
      const result = await sql`
      INSERT INTO reports (listing_id, reason)
      VALUES (${listingId}, ${reason})
      RETURNING *;
    `;
      return result.rows[0];
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[DB createReport] failed:', message);
    throw error;
  }
}

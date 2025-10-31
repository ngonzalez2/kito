import { withDb, sql } from './db';

export const LISTING_STATUSES = ['pending', 'approved', 'rejected'] as const;
export type ListingStatus = (typeof LISTING_STATUSES)[number];

type Filters = {
  category?: string | null;
  condition?: string | null;
  location?: string | null;
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
  brand?: string | null;
  model?: string | null;
  year?: number | null;
  imageUrl: string | null;
};

function normalizeFilters(filters: Filters = {}): NormalizedFilters {
  return {
    category: filters.category ?? null,
    condition: filters.condition ?? null,
    location: filters.location ?? null,
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
  const { category, condition, location } = normalizeFilters(filters);
  return withDb(async () => {
    const result = await sql`
      SELECT *
      FROM listings
      WHERE status = 'approved'
        AND (${category}::text IS NULL OR category = ${category})
        AND (${condition}::text IS NULL OR condition = ${condition})
        AND (${location}::text IS NULL OR location = ${location})
      ORDER BY created_at DESC;
    `;
    return (result.rows as ListingRecord[]).map(normalizeListing);
  });
}

export async function getAllListings(): Promise<Listing[]> {
  return withDb(async () => {
    const result = await sql`SELECT * FROM listings ORDER BY created_at DESC;`;
    return (result.rows as ListingRecord[]).map(normalizeListing);
  });
}

export async function getPendingListings(): Promise<Listing[]> {
  return withDb(async () => {
    const result = await sql`
      SELECT * FROM listings WHERE status = 'pending' ORDER BY created_at DESC;
    `;
    return (result.rows as ListingRecord[]).map(normalizeListing);
  });
}

export async function getListingById(id: number | string): Promise<Listing | null> {
  const listingId = Number(id);
  if (!Number.isFinite(listingId)) {
    throw new Error('Invalid listing id');
  }
  return withDb(async () => {
    const result = await sql`SELECT * FROM listings WHERE id = ${listingId} LIMIT 1;`;
    const row = result.rows[0] as ListingRecord | undefined;
    return row ? normalizeListing(row) : null;
  });
}

export async function createListing(listing: CreateListingInput): Promise<Listing> {
  const {
    title,
    description,
    price,
    condition,
    location,
    category,
    brand = null,
    model = null,
    year = null,
    imageUrl,
  } = listing;

  return withDb(async () => {
    const result = await sql`
      INSERT INTO listings (title, description, price, condition, location, category, brand, model, year, image_url, status)
      VALUES (
        ${title},
        ${description},
        ${price},
        ${condition},
        ${location},
        ${category},
        ${brand},
        ${model},
        ${year},
        ${imageUrl},
        'pending'
      )
      RETURNING *;
    `;
    return normalizeListing(result.rows[0] as ListingRecord);
  });
}

export async function updateListingStatus(id: number, status: ListingStatus): Promise<Listing | null> {
  if (!LISTING_STATUSES.includes(status)) {
    throw new Error(`Unsupported listing status: ${status}`);
  }
  const listingId = Number(id);
  if (!Number.isFinite(listingId)) {
    throw new Error('Invalid listing id');
  }
  return withDb(async () => {
    const result = await sql`
      UPDATE listings
      SET status = ${status}
      WHERE id = ${listingId}
      RETURNING *;
    `;
    const row = result.rows[0] as ListingRecord | undefined;
    return row ? normalizeListing(row) : null;
  });
}

export async function deleteListing(id: number | string): Promise<boolean> {
  const listingId = Number(id);
  if (!Number.isFinite(listingId)) {
    throw new Error('Invalid listing id');
  }
  return withDb(async () => {
    const result = await sql`DELETE FROM listings WHERE id = ${listingId} RETURNING id;`;
    return (result.rowCount ?? 0) > 0;
  });
}

export async function createReport(listingId: number, reason: string) {
  return withDb(async () => {
    const result = await sql`
      INSERT INTO reports (listing_id, reason)
      VALUES (${listingId}, ${reason})
      RETURNING *;
    `;
    return result.rows[0];
  });
}

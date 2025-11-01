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
  const trimmedCategory =
    typeof filters.category === 'string' ? filters.category.trim() : filters.category ?? null;
  const trimmedCondition =
    typeof filters.condition === 'string' ? filters.condition.trim() : filters.condition ?? null;
  const trimmedLocation =
    typeof filters.location === 'string' ? filters.location.trim() : filters.location ?? null;
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

  return withDb(async () => {
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

export type AdjacentListings = {
  previous: Listing | null;
  next: Listing | null;
};

export async function getAdjacentApprovedListings(id: number | string): Promise<AdjacentListings> {
  const listingId = Number(id);
  if (!Number.isFinite(listingId)) {
    throw new Error('Invalid listing id');
  }

  return withDb(async () => {
    const currentResult = await sql`
      SELECT created_at
      FROM listings
      WHERE id = ${listingId}
      LIMIT 1;
    `;

    const current = currentResult.rows[0] as { created_at: string } | undefined;
    if (!current) {
      return { previous: null, next: null } satisfies AdjacentListings;
    }

    const previousResult = await sql`
      SELECT *
      FROM listings
      WHERE status = 'approved' AND created_at > ${current.created_at} AND id <> ${listingId}
      ORDER BY created_at ASC
      LIMIT 1;
    `;

    const nextResult = await sql`
      SELECT *
      FROM listings
      WHERE status = 'approved' AND created_at < ${current.created_at} AND id <> ${listingId}
      ORDER BY created_at DESC
      LIMIT 1;
    `;

    const previousRow = previousResult.rows[0] as ListingRecord | undefined;
    const nextRow = nextResult.rows[0] as ListingRecord | undefined;

    return {
      previous: previousRow ? normalizeListing(previousRow) : null,
      next: nextRow ? normalizeListing(nextRow) : null,
    } satisfies AdjacentListings;
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
    brand,
    model,
    year,
    imageUrl,
  } = listing;

  return withDb(async () => {
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

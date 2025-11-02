import { DEFAULT_LISTING_IMAGE_URL } from './constants';
import { withDb, sql } from './db';

const ALLOWED_OFFICIAL_IMAGE_HOSTS = new Set(['external-content.duckduckgo.com']);

function isAllowedImageUrl(url: string): boolean {
  if (!url) {
    return false;
  }

  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'https:') {
      return false;
    }
    return ALLOWED_OFFICIAL_IMAGE_HOSTS.has(parsed.hostname);
  } catch (error) {
    return false;
  }
}

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

export type ListingImageRecord = {
  id: number;
  listing_id: number;
  image_url: string;
  is_primary: boolean;
};

export type ListingImage = {
  id: number;
  listingId: number;
  imageUrl: string;
  isPrimary: boolean;
};

export type ListingWithImages = Listing & { images: ListingImage[] };

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
  images?: string[] | null;
  imageUrl?: string | null;
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

function normalizeListingImage(row: ListingImageRecord): ListingImage {
  return {
    id: row.id,
    listingId: row.listing_id,
    imageUrl: row.image_url,
    isPrimary: row.is_primary,
  };
}

function sanitizeImageUrls(images?: string[] | null): string[] {
  if (!Array.isArray(images)) {
    return [];
  }

  const seen = new Set<string>();
  const sanitized: string[] = [];

  for (const rawUrl of images) {
    if (typeof rawUrl !== 'string') {
      continue;
    }
    const trimmed = rawUrl.trim();
    if (!trimmed || seen.has(trimmed)) {
      continue;
    }
    seen.add(trimmed);
    sanitized.push(trimmed);
  }

  return sanitized;
}

type BrandImageLookupInput = {
  brand?: string | null;
  model?: string | null;
  year?: number | null;
};

export async function fetchOfficialBrandImage({
  brand,
  model,
  year,
}: BrandImageLookupInput): Promise<string | null> {
  const normalizedBrand = typeof brand === 'string' ? brand.trim() : '';
  const normalizedModel = typeof model === 'string' ? model.trim() : '';

  if (!normalizedBrand && !normalizedModel) {
    return null;
  }

  const queryParts = [normalizedBrand, normalizedModel];
  if (Number.isFinite(year)) {
    queryParts.push(String(year));
  }
  queryParts.push('kitesurf');

  const query = queryParts
    .filter(Boolean)
    .join(' ');

  if (!query) {
    return null;
  }

  const endpoint = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json`;

  try {
    const response = await fetch(endpoint);
    if (!response.ok) {
      return null;
    }
    const data = (await response.json().catch(() => null)) as { Image?: unknown } | null;
    const image = data?.Image;
    return typeof image === 'string' && image ? image : null;
  } catch (error) {
    console.warn('Failed to fetch official brand image', error);
    return null;
  }
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
    console.log('🟡 Fetching pending listings from DB...');
    const result = await sql`
      SELECT * FROM listings WHERE status = 'pending' ORDER BY created_at DESC;
    `;
    const listings = (result.rows as ListingRecord[]).map(normalizeListing);
    console.log(`✅ Retrieved ${listings.length} pending listings`);
    return listings;
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

export async function createListing(listing: CreateListingInput): Promise<ListingWithImages> {
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
    images,
    imageUrl,
  } = listing;

  const sanitizedImages = sanitizeImageUrls(images ?? []);
  const fallbackImageUrl = typeof imageUrl === 'string' ? imageUrl.trim() || null : null;
  const officialImageUrl = await fetchOfficialBrandImage({ brand, model, year: year ?? null });

  const imagesToInsert: { url: string; isPrimary: boolean }[] = [];

  if (officialImageUrl) {
    imagesToInsert.push({ url: officialImageUrl, isPrimary: true });
  }

  for (const url of sanitizedImages) {
    if (imagesToInsert.some((image) => image.url === url)) {
      continue;
    }
    imagesToInsert.push({ url, isPrimary: false });
  }

  if (!imagesToInsert.some((image) => image.isPrimary)) {
    if (imagesToInsert.length > 0) {
      imagesToInsert[0].isPrimary = true;
    } else if (fallbackImageUrl) {
      imagesToInsert.push({ url: fallbackImageUrl, isPrimary: true });
    }
  }

  const coverImageUrl =
    imagesToInsert.find((image) => image.isPrimary)?.url ?? fallbackImageUrl ?? DEFAULT_LISTING_IMAGE_URL;

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
        ${coverImageUrl},
        ${brand},
        ${model},
        ${year},
        'pending'
      )
      RETURNING *;
    `;

    const row = result.rows[0] as ListingRecord;
    const listingId = row.id;
    let listingImages: ListingImage[] = [];

    if (imagesToInsert.length > 0) {
      const insertedImages: ListingImageRecord[] = [];

      for (const image of imagesToInsert) {
        const imageResult = await sql`
          INSERT INTO listing_images (listing_id, image_url, is_primary)
          VALUES (${listingId}, ${image.url}, ${image.isPrimary})
          RETURNING *;
        `;
        const inserted = imageResult.rows[0] as ListingImageRecord | undefined;
        if (inserted) {
          insertedImages.push(inserted);
        }
      }

      insertedImages.sort((a, b) => {
        if (a.is_primary === b.is_primary) {
          return a.id - b.id;
        }
        return a.is_primary ? -1 : 1;
      });

      listingImages = insertedImages.map(normalizeListingImage);
    }

    return { ...normalizeListing(row), images: listingImages } satisfies ListingWithImages;
  });
}

export async function getListingImages(id: number | string): Promise<ListingImage[]> {
  const listingId = Number(id);
  if (!Number.isFinite(listingId)) {
    throw new Error('Invalid listing id');
  }

  return withDb(async () => {
    const result = await sql`
      SELECT *
      FROM listing_images
      WHERE listing_id = ${listingId}
      ORDER BY is_primary DESC, id ASC;
    `;
    return (result.rows as ListingImageRecord[]).map(normalizeListingImage);
  });
}

export async function getListingWithImages(id: number | string): Promise<ListingWithImages | null> {
  const listing = await getListingById(id);
  if (!listing) {
    return null;
  }
  const images = await getListingImages(listing.id);
  return { ...listing, images } satisfies ListingWithImages;
}

export async function getImagesForListings(listingIds: number[]): Promise<Record<number, ListingImage[]>> {
  const uniqueIds = Array.from(new Set(listingIds.filter((id) => Number.isFinite(id)))) as number[];
  if (uniqueIds.length === 0) {
    return {};
  }

  return withDb(async () => {
    const result = await sql`
      SELECT *
      FROM listing_images
      WHERE listing_id = ANY(${sql.array(uniqueIds, 'int4')})
      ORDER BY listing_id ASC, is_primary DESC, id ASC;
    `;

    const grouped: Record<number, ListingImage[]> = {};
    for (const row of result.rows as ListingImageRecord[]) {
      const image = normalizeListingImage(row);
      if (!grouped[image.listingId]) {
        grouped[image.listingId] = [];
      }
      grouped[image.listingId].push(image);
    }
    return grouped;
  });
}

export async function attachImagesToListings(listings: Listing[]): Promise<ListingWithImages[]> {
  if (!listings.length) {
    return [];
  }

  const imagesByListing = await getImagesForListings(listings.map((listing) => listing.id));
  return listings.map((listing) => ({ ...listing, images: imagesByListing[listing.id] ?? [] }));
}

export async function setListingPrimaryImage(
  listingIdInput: number | string,
  imageIdInput: number | string,
): Promise<ListingWithImages | null> {
  const listingId = Number(listingIdInput);
  const imageId = Number(imageIdInput);

  if (!Number.isFinite(listingId) || !Number.isFinite(imageId)) {
    throw new Error('Invalid listing or image id');
  }

  return withDb(async () => {
    const targetResult = await sql`
      SELECT *
      FROM listing_images
      WHERE id = ${imageId} AND listing_id = ${listingId}
      LIMIT 1;
    `;

    const targetRow = targetResult.rows[0] as ListingImageRecord | undefined;
    if (!targetRow) {
      return null;
    }

    await sql`UPDATE listing_images SET is_primary = false WHERE listing_id = ${listingId};`;
    await sql`UPDATE listing_images SET is_primary = true WHERE id = ${imageId};`;

    const listingResult = await sql`
      UPDATE listings
      SET image_url = ${targetRow.image_url}
      WHERE id = ${listingId}
      RETURNING *;
    `;

    const listingRow = listingResult.rows[0] as ListingRecord | undefined;
    if (!listingRow) {
      return null;
    }

    const imagesResult = await sql`
      SELECT *
      FROM listing_images
      WHERE listing_id = ${listingId}
      ORDER BY is_primary DESC, id ASC;
    `;

    const images = (imagesResult.rows as ListingImageRecord[]).map(normalizeListingImage);
    return { ...normalizeListing(listingRow), images } satisfies ListingWithImages;
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

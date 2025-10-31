import { withDb, sql } from './db';

export const LISTING_STATUSES = ['pending', 'approved', 'rejected'];

/**
 * Fetch approved listings with optional filters.
 * Safely casts null parameters to text to prevent Neon/Postgres type errors.
 */
export async function getApprovedListings(filters = {}) {
  return withDb(async () => {
    const { category = null, condition = null, location = null } = filters;

    try {
      const result = await sql`
        SELECT *
        FROM listings
        WHERE status = 'approved'
          AND (${category}::text IS NULL OR category = ${category})
          AND (${condition}::text IS NULL OR condition = ${condition})
          AND (${location}::text IS NULL OR location = ${location})
        ORDER BY created_at DESC;
      `;
      return result.rows;
    } catch (error) {
      console.error('[DB ERROR - getApprovedListings]', error.message);
      throw new Error('Failed to fetch approved listings.');
    }
  });
}

/**
 * Fetch a single listing by its ID.
 */
export async function getListingById(id) {
  return withDb(async () => {
    try {
      const result = await sql`SELECT * FROM listings WHERE id = ${id} LIMIT 1;`;
      return result.rows[0] ?? null;
    } catch (error) {
      console.error('[DB ERROR - getListingById]', error.message);
      throw new Error('Failed to fetch listing by ID.');
    }
  });
}

/**
 * Fetch all listings (for admin).
 */
export async function getAllListings() {
  return withDb(async () => {
    try {
      const result = await sql`SELECT * FROM listings ORDER BY created_at DESC;`;
      return result.rows;
    } catch (error) {
      console.error('[DB ERROR - getAllListings]', error.message);
      throw new Error('Failed to fetch all listings.');
    }
  });
}

/**
 * Create a new listing (pending approval).
 */
export async function createListing(listing) {
  const { title, description, price, condition, location, category, imageUrl } = listing;

  return withDb(async () => {
    try {
      const result = await sql`
        INSERT INTO listings (title, description, price, condition, location, category, image_url, status)
        VALUES (
          ${title},
          ${description},
          ${price},
          ${condition},
          ${location},
          ${category},
          ${imageUrl},
          'pending'
        )
        RETURNING *;
      `;
      return result.rows[0];
    } catch (error) {
      console.error('[DB ERROR - createListing]', error.message);
      throw new Error('Failed to create listing.');
    }
  });
}

/**
 * Update the approval status of a listing.
 */
export async function updateListingStatus(id, status) {
  if (!LISTING_STATUSES.includes(status)) {
    throw new Error(`Unsupported listing status: ${status}`);
  }

  return withDb(async () => {
    try {
      const result = await sql`
        UPDATE listings
        SET status = ${status}
        WHERE id = ${id}
        RETURNING *;
      `;
      return result.rows[0] ?? null;
    } catch (error) {
      console.error('[DB ERROR - updateListingStatus]', error.message);
      throw new Error('Failed to update listing status.');
    }
  });
}

/**
 * Delete a listing by ID.
 */
export async function deleteListing(id) {
  return withDb(async () => {
    try {
      const result = await sql`DELETE FROM listings WHERE id = ${id} RETURNING id;`;
      return result.rowCount > 0;
    } catch (error) {
      console.error('[DB ERROR - deleteListing]', error.message);
      throw new Error('Failed to delete listing.');
    }
  });
}

/**
 * Create a report for a listing (e.g., user flagging an issue).
 */
export async function createReport(listingId, reason) {
  return withDb(async () => {
    try {
      const result = await sql`
        INSERT INTO reports (listing_id, reason)
        VALUES (${listingId}, ${reason})
        RETURNING *;
      `;
      return result.rows[0];
    } catch (error) {
      console.error('[DB ERROR - createReport]', error.message);
      throw new Error('Failed to create report.');
    }
  });
}

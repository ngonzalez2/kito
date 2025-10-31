import { withDb, sql } from './db';

export const LISTING_STATUSES = ['pending', 'approved', 'rejected'];

export async function getApprovedListings(filters = {}) {
  return withDb(async () => {
    const { category = null, condition = null, location = null } = filters;
    const result = await sql`
      SELECT *
      FROM listings
      WHERE status = 'approved'
        AND (${category} IS NULL OR category = ${category})
        AND (${condition} IS NULL OR condition = ${condition})
        AND (${location} IS NULL OR location = ${location})
      ORDER BY created_at DESC;
    `;
    return result.rows;
  });
}

export async function getListingById(id) {
  return withDb(async () => {
    const result = await sql`SELECT * FROM listings WHERE id = ${id} LIMIT 1;`;
    return result.rows[0] ?? null;
  });
}

export async function getAllListings() {
  return withDb(async () => {
    const result = await sql`SELECT * FROM listings ORDER BY created_at DESC;`;
    return result.rows;
  });
}

export async function createListing(listing) {
  const { title, description, price, condition, location, category, imageUrl } = listing;
  return withDb(async () => {
    const result = await sql`
      INSERT INTO listings (title, description, price, condition, location, category, image_url, status)
      VALUES (${title}, ${description}, ${price}, ${condition}, ${location}, ${category}, ${imageUrl}, 'pending')
      RETURNING *;
    `;
    return result.rows[0];
  });
}

export async function updateListingStatus(id, status) {
  if (!LISTING_STATUSES.includes(status)) {
    throw new Error(`Unsupported listing status: ${status}`);
  }
  return withDb(async () => {
    const result = await sql`
      UPDATE listings
      SET status = ${status}
      WHERE id = ${id}
      RETURNING *;
    `;
    return result.rows[0] ?? null;
  });
}

export async function deleteListing(id) {
  return withDb(async () => {
    const result = await sql`DELETE FROM listings WHERE id = ${id} RETURNING id;`;
    return result.rowCount > 0;
  });
}

export async function createReport(listingId, reason) {
  return withDb(async () => {
    const result = await sql`
      INSERT INTO reports (listing_id, reason)
      VALUES (${listingId}, ${reason})
      RETURNING *;
    `;
    return result.rows[0];
  });
}

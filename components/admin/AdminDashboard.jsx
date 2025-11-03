'use client';

import Image from 'next/image';
import { useCallback, useEffect, useMemo, useState } from 'react';
import ListingCard from '@/components/listings/ListingCard';
import useTranslations from '@/hooks/useTranslations';

async function fetchAllListings(admin) {
  console.log('[AdminDashboard] Fetching all listings...');
  const response = await fetch('/api/listings?includeAll=true', {
    method: 'GET',
    cache: 'no-store',
  });

  console.log('[AdminDashboard] Listings response status:', response.status);

  let payload;
  try {
    payload = await response.json();
  } catch (error) {
    console.error('[AdminDashboard] Failed to parse listings payload', error);
    payload = null;
  }

  if (!response.ok) {
    const baseMessage = response.status === 401 ? admin.errors.unauthorized : admin.errors.loadFailed;
    const details =
      payload && typeof payload === 'object' && typeof payload.error === 'string' && payload.error.trim()
        ? payload.error.trim()
        : '';
    const message = details ? `${baseMessage} (${details})` : baseMessage;
    throw new Error(message);
  }

  if (!payload || !Array.isArray(payload.listings)) {
    return [];
  }
  return payload.listings;
}

export default function AdminDashboard() {
  const { admin } = useTranslations();
  const [listings, setListings] = useState([]);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState('');

  const refreshListings = useCallback(async () => {
    try {
      setStatus('loading');
      setFeedback('');
      setError('');
      console.log('[AdminDashboard] Refreshing listings...');
      const fetchedListings = await fetchAllListings(admin);
      setListings(fetchedListings);
    } catch (err) {
      console.error('Failed to refresh listings', err);
      setError(err.message || admin.errors.loadFailed);
    } finally {
      setStatus('idle');
    }
  }, [admin]);

  useEffect(() => {
    refreshListings();
  }, [refreshListings]);

  const updateListingStatus = async (id, nextStatus) => {
    try {
      setStatus('saving');
      setError('');
      setFeedback('');

      const response = await fetch(`/api/listings/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: nextStatus }),
      });

      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          response.status === 401
            ? admin.errors.unauthorized
            : payload?.error || admin.errors.saveFailed,
        );
      }

      const updatedListing = payload?.listing;
      const messageKey = typeof nextStatus === 'string' ? nextStatus : '';

      if (updatedListing) {
        setListings((current) =>
          current.map((item) =>
            item.id === updatedListing.id
              ? {
                  ...item,
                  ...updatedListing,
                }
              : item,
          ),
        );
      } else {
        setListings((current) =>
          current.map((item) =>
            item.id === id
              ? {
                  ...item,
                  status: nextStatus,
                }
              : item,
          ),
        );
      }

      const feedbackMessage =
        admin.messages.statusUpdated?.[messageKey] ?? admin.messages.genericStatus ?? 'Listing status updated.';
      setFeedback(feedbackMessage);
    } catch (err) {
      console.error('Failed to update listing', err);
      setError(err.message || admin.errors.saveFailed);
    } finally {
      setStatus('idle');
    }
  };

  const updatePrimaryImage = async (listingId, imageId) => {
    try {
      setStatus('saving');
      setError('');
      setFeedback('');

      const response = await fetch(`/api/listings/${listingId}/images/${imageId}/primary`, {
        method: 'PATCH',
      });

      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        const message =
          response.status === 401
            ? admin.errors.unauthorized
            : payload?.error || admin.errors.imageUpdate;
        throw new Error(message);
      }

      const updatedListing = payload?.listing;
      if (updatedListing) {
        setListings((current) =>
          current.map((item) =>
            item.id === updatedListing.id
              ? {
                  ...item,
                  ...updatedListing,
                }
              : item,
          ),
        );
      }
      setFeedback(admin.messages.primaryUpdated);
    } catch (err) {
      console.error('Failed to update primary image', err);
      setError(err.message || admin.errors.imageUpdate);
    } finally {
      setStatus('idle');
    }
  };

  const statusOrder = useMemo(
    () => ({
      pending: 0,
      approved: 1,
      sold: 2,
      rejected: 3,
    }),
    [],
  );

  const sortedListings = useMemo(() => {
    return [...listings].sort((a, b) => {
      const orderA = statusOrder[a.status] ?? 99;
      const orderB = statusOrder[b.status] ?? 99;
      if (orderA !== orderB) {
        return orderA - orderB;
      }
      return (a.id ?? 0) - (b.id ?? 0);
    });
  }, [listings, statusOrder]);

  const statusOptions = [
    { value: 'pending', label: admin.actions.markPending ?? 'Mark pending' },
    { value: 'approved', label: admin.actions.markApproved ?? 'Approve' },
    { value: 'sold', label: admin.actions.markSold ?? 'Mark sold' },
    { value: 'rejected', label: admin.actions.markRejected ?? 'Reject' },
  ];
  const statusLabelText = admin.statusLabel ?? 'Status:';
  const statusValueCopy = admin.statusValues ?? {};

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-2 text-center">
        <h1 className="font-heading text-3xl uppercase tracking-[0.4em] text-deep-blue">{admin.dashboardTitle}</h1>
        <p className="text-sm text-deep-blue/70">{admin.dashboardSubtitle}</p>
      </header>
      <div className="flex flex-wrap items-center justify-center gap-4">
        <button
          type="button"
          onClick={() => refreshListings()}
          disabled={status === 'saving' || status === 'loading'}
          className="rounded-full border border-deep-blue/20 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-deep-blue disabled:cursor-not-allowed disabled:opacity-60"
        >
          {status === 'loading' ? admin.actions.refreshing : admin.actions.refresh}
        </button>
      </div>
      {feedback && <p className="text-sm text-emerald-600">{feedback}</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}
      <section className="flex flex-col gap-6">
        {sortedListings.length === 0 ? (
          <p className="rounded-3xl border border-dashed border-sand/60 bg-white/60 p-8 text-center text-sm text-deep-blue/70">
            {admin.empty}
          </p>
        ) : (
          sortedListings.map((listing) => (
            <article key={listing.id} className="rounded-3xl bg-white/90 p-6 shadow-lg">
              <ListingCard listing={listing} layout="horizontal" showStatusTag />
              <ListingImagesManager
                listing={listing}
                labels={admin.images}
                disabled={status === 'saving'}
                onSetPrimary={(imageId) => updatePrimaryImage(listing.id, imageId)}
              />
              <div className="mt-4 flex flex-wrap gap-3">
                <span className="mr-auto text-xs uppercase tracking-[0.3em] text-deep-blue/60">
                  {statusLabelText}{' '}
                  <span className="font-semibold text-deep-blue">{statusValueCopy?.[listing.status] ?? listing.status}</span>
                </span>
                {statusOptions.map((option) => {
                  const isActive = listing.status === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => updateListingStatus(listing.id, option.value)}
                      disabled={status === 'saving' || isActive}
                      className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
                        isActive
                          ? 'bg-deep-blue text-white shadow-inner'
                          : 'border border-deep-blue/20 bg-white text-deep-blue hover:border-deep-blue/40 hover:bg-deep-blue hover:text-white'
                      }`}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </article>
          ))
        )}
      </section>
    </div>
  );
}

function ListingImagesManager({ listing, labels = {}, onSetPrimary, disabled }) {
  const images = Array.isArray(listing.images) ? listing.images : [];
  const headingLabel = labels.heading ?? 'Listing images';
  const emptyLabel = labels.empty ?? 'No images uploaded yet.';
  const primaryLabel = labels.primary ?? 'Primary';
  const setPrimaryLabel = labels.setPrimary ?? 'Set as cover';

  if (!images.length) {
    return (
      <div className="mt-4 rounded-2xl border border-dashed border-sand/60 bg-white/60 p-4 text-sm text-deep-blue/60">
        {emptyLabel}
      </div>
    );
  }

  return (
    <div className="mt-4">
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-deep-blue/70">{headingLabel}</p>
      <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {images.map((image) => {
          const isPrimary = Boolean(image.isPrimary);
          return (
            <div
              key={image.id}
              className={`relative overflow-hidden rounded-2xl border ${
                isPrimary ? 'border-coral/70 shadow-lg' : 'border-transparent'
              } bg-white`}
            >
              <div className="relative h-32 w-full">
                <Image
                  src={image.imageUrl}
                  alt={listing.title}
                  fill
                  className="object-cover"
                  sizes="200px"
                />
                {isPrimary && (
                  <span className="absolute left-3 top-3 rounded-full bg-coral/90 px-2 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-white">
                    {primaryLabel}
                  </span>
                )}
              </div>
              <div className="flex items-center justify-end gap-2 px-3 py-2">
                {!isPrimary && (
                  <button
                    type="button"
                    onClick={() => onSetPrimary(image.id)}
                    disabled={disabled}
                    className="rounded-full bg-coral/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-coral transition hover:bg-coral/20 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {setPrimaryLabel}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

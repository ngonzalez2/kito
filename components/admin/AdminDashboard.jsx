'use client';

import { useEffect, useState } from 'react';
import ListingCard from '@/components/listings/ListingCard';
import useTranslations from '@/hooks/useTranslations';

const STORAGE_KEY = 'kito-admin-key';

async function fetchPendingListings(key, admin) {
  const response = await fetch('/api/listings?includeAll=true', {
    headers: {
      'x-admin-key': key,
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(response.status === 401 ? admin.errors.unauthorized : admin.errors.loadFailed);
  }

  const payload = await response.json();
  const items = Array.isArray(payload.listings) ? payload.listings : [];
  return items.filter((listing) => listing.status === 'pending');
}

export default function AdminDashboard() {
  const { admin } = useTranslations();
  const [adminKey, setAdminKey] = useState('');
  const [authorized, setAuthorized] = useState(false);
  const [pendingListings, setPendingListings] = useState([]);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const storedKey = window.localStorage.getItem(STORAGE_KEY);
    if (!storedKey) {
      return;
    }

    setAdminKey(storedKey);
    verifyKey(storedKey);
  }, []);

  const verifyKey = async (key) => {
    try {
      setStatus('loading');
      setError('');
      setFeedback('');

      const listings = await fetchPendingListings(key, admin);

      setPendingListings(listings);
      setAuthorized(true);
      setStatus('idle');

      if (typeof window !== 'undefined') {
        window.localStorage.setItem(STORAGE_KEY, key);
      }
    } catch (err) {
      console.error('Admin authentication failed', err);
      setError(err.message || admin.errors.loadFailed);
      setAuthorized(false);
      setStatus('idle');
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!adminKey) {
      setError(admin.errors.required);
      return;
    }

    verifyKey(adminKey);
  };

  const refreshListings = async (key = adminKey) => {
    try {
      setStatus('loading');
      setFeedback('');
      const listings = await fetchPendingListings(key, admin);
      setPendingListings(listings);
    } catch (err) {
      console.error('Failed to refresh listings', err);
      setError(err.message || admin.errors.loadFailed);
    } finally {
      setStatus('idle');
    }
  };

  const moderateListing = async (id, action) => {
    try {
      setStatus('saving');
      setError('');
      setFeedback('');

      const response = await fetch(`/api/listings/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': adminKey,
        },
        body: JSON.stringify({ status: action }),
      });

      if (!response.ok) {
        throw new Error(response.status === 401 ? admin.errors.unauthorized : admin.errors.saveFailed);
      }

      setPendingListings((current) => current.filter((listing) => listing.id !== id));
      setFeedback(action === 'approved' ? admin.messages.approved : admin.messages.rejected);
    } catch (err) {
      console.error('Failed to update listing', err);
      setError(err.message || admin.errors.saveFailed);
    } finally {
      setStatus('idle');
    }
  };

  const signOut = () => {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(STORAGE_KEY);
    }
    setAuthorized(false);
    setAdminKey('');
    setPendingListings([]);
    setFeedback('');
    setError('');
  };

  if (!authorized) {
    return (
      <div className="mx-auto max-w-md rounded-3xl bg-white/80 p-8 shadow-lg">
        <h1 className="text-center font-heading text-2xl uppercase tracking-[0.4em] text-deep-blue">{admin.title}</h1>
        <p className="mt-3 text-center text-sm text-deep-blue/70">{admin.subtitle}</p>
        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          <input
            type="password"
            value={adminKey}
            onChange={(event) => setAdminKey(event.target.value)}
            className="rounded-2xl border border-transparent bg-white px-4 py-3 text-base text-deep-blue focus:border-coral focus:outline-none focus:ring-2 focus:ring-coral/30"
            placeholder={admin.placeholder}
          />
          <button
            type="submit"
            className="gradient-button rounded-full px-4 py-2 text-sm font-semibold uppercase tracking-[0.3em] text-white"
          >
            {status === 'loading' ? admin.verifying : admin.enter}
          </button>
          {error && <p className="text-center text-sm text-red-600">{error}</p>}
        </form>
      </div>
    );
  }

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
        <button
          type="button"
          onClick={signOut}
          className="rounded-full border border-sand px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-deep-blue"
        >
          {admin.actions.signOut}
        </button>
      </div>
      {feedback && <p className="text-sm text-emerald-600">{feedback}</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}
      <section className="flex flex-col gap-6">
        {pendingListings.length === 0 ? (
          <p className="rounded-3xl border border-dashed border-sand/60 bg-white/60 p-8 text-center text-sm text-deep-blue/70">
            {admin.empty}
          </p>
        ) : (
          pendingListings.map((listing) => (
            <article key={listing.id} className="rounded-3xl bg-white/90 p-6 shadow-lg">
              <ListingCard listing={listing} layout="horizontal" showStatusTag />
              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => moderateListing(listing.id, 'approved')}
                  disabled={status === 'saving'}
                  className="rounded-full bg-emerald-500/90 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {admin.actions.approve}
                </button>
                <button
                  type="button"
                  onClick={() => moderateListing(listing.id, 'rejected')}
                  disabled={status === 'saving'}
                  className="rounded-full bg-red-500/90 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {admin.actions.reject}
                </button>
              </div>
            </article>
          ))
        )}
      </section>
    </div>
  );
}

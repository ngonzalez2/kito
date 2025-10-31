'use client';

import { useEffect, useState } from 'react';
import ListingCard from '@/components/listings/ListingCard';
import useTranslations from '@/hooks/useTranslations';

export default function AdminDashboard() {
  const { admin } = useTranslations();
  const [adminKey, setAdminKey] = useState('');
  const [authorized, setAuthorized] = useState(false);
  const [listings, setListings] = useState([]);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    const storedKey = window.localStorage.getItem('kito-admin-key');
    if (storedKey) {
      setAdminKey(storedKey);
      verifyKey(storedKey);
    }
  }, []);

  const verifyKey = async (key) => {
    try {
      setStatus('loading');
      const response = await fetch('/api/listings?includeAll=true', {
        headers: {
          'x-admin-key': key,
        },
      });
      if (!response.ok) {
        throw new Error(response.status === 401 ? admin.errors.unauthorized : admin.errors.loadFailed);
      }
      const payload = await response.json();
      setListings(payload.listings || []);
      setAuthorized(true);
      setStatus('idle');
      setError('');
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('kito-admin-key', key);
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
      const response = await fetch('/api/listings?includeAll=true', {
        headers: {
          'x-admin-key': key,
        },
      });
      if (!response.ok) {
        throw new Error(admin.errors.loadFailed);
      }
      const payload = await response.json();
      setListings(payload.listings || []);
    } catch (err) {
      console.error('Failed to refresh listings', err);
    }
  };

  const moderateListing = async (id, action) => {
    try {
      setStatus('saving');
      const response = await fetch(`/api/listings/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': adminKey,
        },
        body: JSON.stringify({ status: action }),
      });
      if (!response.ok) {
        throw new Error(admin.errors.saveFailed);
      }
      await refreshListings();
    } catch (err) {
      console.error('Failed to update listing', err);
      setError(err.message || admin.errors.saveFailed);
    } finally {
      setStatus('idle');
    }
  };

  const deleteListing = async (id) => {
    try {
      setStatus('saving');
      const response = await fetch(`/api/listings/${id}`, {
        method: 'DELETE',
        headers: {
          'x-admin-key': adminKey,
        },
      });
      if (!response.ok) {
        throw new Error(admin.errors.saveFailed);
      }
      await refreshListings();
    } catch (err) {
      console.error('Failed to delete listing', err);
      setError(err.message || admin.errors.saveFailed);
    } finally {
      setStatus('idle');
    }
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
      {error && <p className="text-sm text-red-600">{error}</p>}
      <section className="flex flex-col gap-6">
        {listings.length === 0 ? (
          <p className="rounded-3xl border border-dashed border-sand/60 bg-white/60 p-8 text-center text-sm text-deep-blue/70">
            {admin.empty}
          </p>
        ) : (
          listings.map((listing) => (
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
                <button
                  type="button"
                  onClick={() => deleteListing(listing.id)}
                  disabled={status === 'saving'}
                  className="rounded-full border border-red-500 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-red-500 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {admin.actions.delete}
                </button>
              </div>
            </article>
          ))
        )}
      </section>
    </div>
  );
}

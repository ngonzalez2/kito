'use client';

import { useEffect, useState, useCallback } from 'react';

type Listing = {
  id: number;
  title: string;
  price: number;
  condition: string;
  location: string;
  category: string | null;
  image_url: string | null;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
};

export default function AdminPage() {
  const [adminKey, setAdminKey] = useState<string | null>(null);
  const [pending, setPending] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const ensureKey = useCallback(() => {
    const k = typeof window === 'undefined' ? null : localStorage.getItem('ADMIN_KEY');
    if (!k) return false;
    setAdminKey(k);
    return true;
  }, []);

  const load = useCallback(async () => {
    if (!ensureKey()) return;
    setLoading(true);
    setMsg(null);
    try {
      const res = await fetch('/api/listings?includeAll=true', {
        headers: { 'x-admin-key': localStorage.getItem('ADMIN_KEY') || '' },
        cache: 'no-store',
      });
      if (!res.ok) throw new Error(await res.text());
      const data = (await res.json()) as { listings?: Listing[] };
      const items = data?.listings ?? [];
      setPending(items.filter((item) => item.status === 'pending'));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'unknown error';
      setMsg(`Failed to load: ${message}`);
    } finally {
      setLoading(false);
    }
  }, [ensureKey]);

  useEffect(() => {
    load();
  }, [load]);

  const submitKey = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const key = String(form.get('key') || '');
    if (key.trim()) {
      localStorage.setItem('ADMIN_KEY', key.trim());
      setAdminKey(key.trim());
      load();
    }
  };

  const act = async (id: number, status: 'approved' | 'rejected') => {
    setMsg(null);
    try {
      const res = await fetch(`/api/listings/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': localStorage.getItem('ADMIN_KEY') || '',
        },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error(await res.text());
      setPending((curr) => curr.filter((item) => item.id !== id));
      setMsg(`Listing #${id} ${status}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'unknown error';
      setMsg(`Action failed: ${message}`);
    }
  };

  if (!adminKey) {
    return (
      <div className="max-w-xl mx-auto py-12">
        <h1 className="text-2xl font-semibold mb-4">Admin Key Required</h1>
        <form onSubmit={submitKey} className="flex gap-2">
          <input
            name="key"
            type="password"
            placeholder="Enter admin key"
            className="flex-1 border rounded px-3 py-2"
          />
          <button className="px-4 py-2 rounded bg-black text-white">Continue</button>
        </form>
        {msg && <p className="text-red-600 mt-2">{msg}</p>}
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Pending Listings</h1>
        <div className="flex gap-2">
          <button
            onClick={() => {
              localStorage.removeItem('ADMIN_KEY');
              setAdminKey(null);
              setPending([]);
            }}
            className="px-3 py-2 border rounded"
          >
            Sign out
          </button>
          <button onClick={load} className="px-3 py-2 border rounded">
            {loading ? 'Loading…' : 'Refresh'}
          </button>
        </div>
      </div>

      {msg && <p className="mb-4">{msg}</p>}

      {pending.length === 0 ? (
        <p>No items pending approval.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left border-b">
                <th className="py-2 pr-4">ID</th>
                <th className="py-2 pr-4">Title</th>
                <th className="py-2 pr-4">Price</th>
                <th className="py-2 pr-4">Condition</th>
                <th className="py-2 pr-4">Location</th>
                <th className="py-2 pr-4">Category</th>
                <th className="py-2 pr-4">Posted</th>
                <th className="py-2 pr-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pending.map((item) => (
                <tr key={item.id} className="border-b">
                  <td className="py-2 pr-4">{item.id}</td>
                  <td className="py-2 pr-4">{item.title}</td>
                  <td className="py-2 pr-4">${item.price}</td>
                  <td className="py-2 pr-4">{item.condition}</td>
                  <td className="py-2 pr-4">{item.location}</td>
                  <td className="py-2 pr-4">{item.category ?? '-'}</td>
                  <td className="py-2 pr-4">{new Date(item.created_at).toLocaleString()}</td>
                  <td className="py-2 pr-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => act(item.id, 'approved')}
                        className="px-3 py-1 rounded bg-green-600 text-white"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => act(item.id, 'rejected')}
                        className="px-3 py-1 rounded bg-red-600 text-white"
                      >
                        Reject
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

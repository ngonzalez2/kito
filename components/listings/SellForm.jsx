'use client';

import { useEffect, useMemo, useState } from 'react';
import useTranslations from '@/hooks/useTranslations';

const CONDITIONS = ['new', 'excellent', 'good', 'used'];
const LOCATIONS = ['La Guajira', 'Barranquilla', 'Cartagena', 'Medellín', 'Bogotá'];
const CATEGORIES = ['kite', 'board', 'accessories'];

export default function SellForm() {
  const { sell } = useTranslations();
  const [formState, setFormState] = useState({
    title: '',
    description: '',
    price: '',
    condition: CONDITIONS[0],
    location: LOCATIONS[0],
    category: CATEGORIES[0],
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');
  const [pendingListings, setPendingListings] = useState([]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    const stored = window.localStorage.getItem('kito-pending-listings');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setPendingListings(Array.isArray(parsed) ? parsed : []);
      } catch (error) {
        console.warn('Failed to parse pending listings from storage', error);
      }
    }
  }, []);

  const resetForm = () => {
    setFormState({
      title: '',
      description: '',
      price: '',
      condition: CONDITIONS[0],
      location: LOCATIONS[0],
      category: CATEGORIES[0],
    });
    setImageFile(null);
    setImagePreview('');
  };

  const savePendingListing = (listing) => {
    if (typeof window === 'undefined') {
      return;
    }
    const next = [{ id: listing.id, title: listing.title }, ...pendingListings].slice(0, 5);
    setPendingListings(next);
    window.localStorage.setItem('kito-pending-listings', JSON.stringify(next));
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    setImageFile(file || null);
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    } else {
      setImagePreview('');
    }
  };

  const uploadImage = async () => {
    if (!imageFile) {
      throw new Error(sell.errors.imageRequired);
    }
    const formData = new FormData();
    formData.append('file', imageFile);
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });
    const payload = await response.json();
    if (!response.ok) {
      throw new Error(payload?.error || sell.errors.uploadFailed);
    }
    return payload.url;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus('loading');
    setMessage('');

    try {
      const imageUrl = await uploadImage();
      const response = await fetch('/api/listings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formState.title,
          description: formState.description,
          price: Number(formState.price),
          condition: formState.condition,
          location: formState.location,
          category: formState.category,
          imageUrl,
        }),
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.error || sell.errors.submitFailed);
      }

      resetForm();
      setStatus('success');
      setMessage(sell.successMessage);
      savePendingListing(payload.listing);
    } catch (error) {
      console.error('Listing submission failed', error);
      setStatus('error');
      setMessage(error.message || sell.errors.submitFailed);
    }
  };

  const pendingSummary = useMemo(() => {
    if (!pendingListings.length) {
      return null;
    }
    return pendingListings.map((listing) => (
      <li key={listing.id} className="flex items-center justify-between gap-4 rounded-2xl bg-white/60 px-4 py-3">
        <span className="text-sm font-semibold text-deep-blue">{listing.title}</span>
        <span className="rounded-full bg-yellow-500/20 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-yellow-700">
          {sell.pendingTag}
        </span>
      </li>
    ));
  }, [pendingListings, sell.pendingTag]);

  return (
    <section id="list-your-kite" className="bg-white/90 py-16">
      <div className="mx-auto flex max-w-4xl flex-col gap-10 px-4 sm:px-6">
        <div className="text-center">
          <h2 className="font-heading text-3xl uppercase tracking-[0.4em] text-deep-blue">{sell.heading}</h2>
          <p className="mt-3 text-base text-deep-blue/70">{sell.subheading}</p>
        </div>
        <form onSubmit={handleSubmit} className="grid gap-6 rounded-3xl bg-sky/10 p-8 shadow-lg">
          <div className="grid gap-6 md:grid-cols-2">
            <label className="flex flex-col gap-2 text-sm font-semibold uppercase tracking-[0.3em] text-deep-blue">
              {sell.fields.title}
              <input
                required
                name="title"
                value={formState.title}
                onChange={handleInputChange}
                className="rounded-2xl border border-transparent bg-white/80 px-4 py-3 text-base text-deep-blue focus:border-coral focus:outline-none focus:ring-2 focus:ring-coral/30"
                placeholder={sell.placeholders.title}
              />
            </label>
            <label className="flex flex-col gap-2 text-sm font-semibold uppercase tracking-[0.3em] text-deep-blue">
              {sell.fields.price}
              <input
                required
                name="price"
                type="number"
                min="0"
                value={formState.price}
                onChange={handleInputChange}
                className="rounded-2xl border border-transparent bg-white/80 px-4 py-3 text-base text-deep-blue focus:border-coral focus:outline-none focus:ring-2 focus:ring-coral/30"
                placeholder={sell.placeholders.price}
              />
            </label>
          </div>
          <label className="flex flex-col gap-2 text-sm font-semibold uppercase tracking-[0.3em] text-deep-blue">
            {sell.fields.description}
            <textarea
              required
              name="description"
              value={formState.description}
              onChange={handleInputChange}
              className="rounded-2xl border border-transparent bg-white/80 px-4 py-3 text-base text-deep-blue focus:border-coral focus:outline-none focus:ring-2 focus:ring-coral/30"
              rows={4}
              placeholder={sell.placeholders.description}
              maxLength={500}
            />
          </label>
          <div className="grid gap-6 md:grid-cols-3">
            <label className="flex flex-col gap-2 text-sm font-semibold uppercase tracking-[0.3em] text-deep-blue">
              {sell.fields.condition}
              <select
                name="condition"
                value={formState.condition}
                onChange={handleInputChange}
                className="rounded-2xl border border-transparent bg-white/80 px-4 py-3 text-base text-deep-blue focus:border-coral focus:outline-none focus:ring-2 focus:ring-coral/30"
              >
                {CONDITIONS.map((option) => (
                  <option key={option} value={option}>
                    {sell.conditionOptions[option] || option}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-2 text-sm font-semibold uppercase tracking-[0.3em] text-deep-blue">
              {sell.fields.location}
              <select
                name="location"
                value={formState.location}
                onChange={handleInputChange}
                className="rounded-2xl border border-transparent bg-white/80 px-4 py-3 text-base text-deep-blue focus:border-coral focus:outline-none focus:ring-2 focus:ring-coral/30"
              >
                {LOCATIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-2 text-sm font-semibold uppercase tracking-[0.3em] text-deep-blue">
              {sell.fields.category}
              <select
                name="category"
                value={formState.category}
                onChange={handleInputChange}
                className="rounded-2xl border border-transparent bg-white/80 px-4 py-3 text-base text-deep-blue focus:border-coral focus:outline-none focus:ring-2 focus:ring-coral/30"
              >
                {CATEGORIES.map((option) => (
                  <option key={option} value={option}>
                    {sell.categoryOptions[option] || option}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <label className="flex flex-col gap-2 text-sm font-semibold uppercase tracking-[0.3em] text-deep-blue">
            {sell.fields.image}
            <input
              required
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileChange}
              className="rounded-2xl border border-dashed border-coral/60 bg-white/70 px-4 py-6 text-sm text-deep-blue focus:border-coral focus:outline-none"
            />
          </label>
          {imagePreview && (
            <img
              src={imagePreview}
              alt={sell.previewAlt}
              className="h-56 w-full rounded-3xl object-cover"
            />
          )}
          <button
            type="submit"
            disabled={status === 'loading'}
            className="gradient-button rounded-full px-6 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {status === 'loading' ? sell.submitting : sell.submit}
          </button>
          {message && (
            <p
              className={`text-sm font-semibold ${
                status === 'success' ? 'text-emerald-600' : 'text-red-600'
              }`}
            >
              {message}
            </p>
          )}
        </form>
        {pendingSummary && (
          <div className="rounded-3xl bg-white/80 p-6 shadow-lg">
            <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-deep-blue">{sell.pendingHeader}</h3>
            <ul className="mt-4 flex flex-col gap-3">{pendingSummary}</ul>
          </div>
        )}
      </div>
    </section>
  );
}

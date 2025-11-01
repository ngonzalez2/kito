'use client';

import { useEffect, useMemo, useState } from 'react';
import useTranslations from '@/hooks/useTranslations';

const CONDITIONS = ['new', 'excellent', 'good', 'used'];
const LOCATIONS = ['La Guajira', 'Barranquilla', 'Cartagena', 'Medellín', 'Bogotá'];
const CATEGORIES = ['kite', 'board', 'accessories'];
const CURRENT_YEAR = new Date().getFullYear();
const MAX_UPLOAD_SIZE = 5 * 1024 * 1024;
const MAX_CANVAS_DIMENSION = 1800;

const loadImage = (file) =>
  new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(image);
    };
    image.onerror = (error) => {
      URL.revokeObjectURL(objectUrl);
      reject(error);
    };
    image.src = objectUrl;
  });

const canvasToBlob = (canvas, quality) =>
  new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Canvas compression failed.'));
          return;
        }
        resolve(blob);
      },
      'image/jpeg',
      quality
    );
  });

async function compressImageFile(file, maxSizeBytes = MAX_UPLOAD_SIZE) {
  if (typeof window === 'undefined' || !(file instanceof File)) {
    return file;
  }

  if (file.size <= maxSizeBytes) {
    return file;
  }

  try {
    const image = await loadImage(file);
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d', { alpha: false });

    let { width, height } = image;
    const largestSide = Math.max(width, height);

    if (largestSide > MAX_CANVAS_DIMENSION) {
      const scale = MAX_CANVAS_DIMENSION / largestSide;
      width = Math.round(width * scale);
      height = Math.round(height * scale);
    }

    canvas.width = width;
    canvas.height = height;
    context.drawImage(image, 0, 0, width, height);

    let quality = 0.9;
    let blob = await canvasToBlob(canvas, quality);

    while (blob.size > maxSizeBytes && quality > 0.5) {
      quality = Math.max(quality - 0.1, 0.5);
      blob = await canvasToBlob(canvas, quality);
    }

    while (blob.size > maxSizeBytes && (width > 640 || height > 640)) {
      width = Math.round(width * 0.85);
      height = Math.round(height * 0.85);
      canvas.width = width;
      canvas.height = height;
      context.drawImage(image, 0, 0, width, height);
      blob = await canvasToBlob(canvas, quality);
    }

    if (blob.size > maxSizeBytes) {
      return file;
    }

    return new File([blob], file.name.replace(/\.(png|webp)$/i, '.jpg'), {
      type: 'image/jpeg',
      lastModified: Date.now(),
    });
  } catch (error) {
    console.warn('Failed to compress image file', error);
    return file;
  }
}

const parseResponsePayload = async (response) => {
  const contentType = response.headers.get('content-type') || '';

  if (contentType.includes('application/json')) {
    try {
      return await response.clone().json();
    } catch (error) {
      console.warn('Failed to parse JSON response', error);
    }
  }

  try {
    return await response.text();
  } catch (error) {
    console.warn('Failed to read response body', error);
    return null;
  }
};

export default function SellForm() {
  const { sell } = useTranslations();
  const [formState, setFormState] = useState({
    title: '',
    description: '',
    price: '',
    condition: CONDITIONS[0],
    location: LOCATIONS[0],
    category: CATEGORIES[0],
    brand: '',
    model: '',
    year: '',
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');
  const [pendingListings, setPendingListings] = useState([]);
  const [fieldErrors, setFieldErrors] = useState({});

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
      brand: '',
      model: '',
      year: '',
    });
    setImageFile(null);
    setImagePreview((prev) => {
      if (prev) {
        URL.revokeObjectURL(prev);
      }
      return '';
    });
    setFieldErrors({});
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
    setFieldErrors((prev) => {
      if (!prev[name]) {
        return prev;
      }
      const next = { ...prev };
      delete next[name];
      return next;
    });
  };

  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const handleFileChange = async (event) => {
    const input = event.target;
    const file = input.files?.[0];

    if (!file) {
      setImageFile(null);
      setImagePreview((prev) => {
        if (prev) {
          URL.revokeObjectURL(prev);
        }
        return '';
      });
      return;
    }

    try {
      const compressedFile = await compressImageFile(file, MAX_UPLOAD_SIZE);

      if (compressedFile.size > MAX_UPLOAD_SIZE) {
        setImageFile(null);
        setImagePreview((prev) => {
          if (prev) {
            URL.revokeObjectURL(prev);
          }
          return '';
        });
        setStatus('error');
        setMessage(sell.errors.imageTooLarge);
        input.value = '';
        return;
      }

      setImageFile(compressedFile);
      setImagePreview((prev) => {
        if (prev) {
          URL.revokeObjectURL(prev);
        }
        return URL.createObjectURL(compressedFile);
      });
      setStatus('idle');
      setMessage('');
      setFieldErrors((prev) => {
        if (!prev.imageUrl) {
          return prev;
        }
        const next = { ...prev };
        delete next.imageUrl;
        return next;
      });
    } catch (error) {
      console.error('Failed to process selected image', error);
      setImageFile(null);
      setImagePreview((prev) => {
        if (prev) {
          URL.revokeObjectURL(prev);
        }
        return '';
      });
      setStatus('error');
      setMessage(sell.errors.imageProcessing);
      input.value = '';
    }
  };

  const uploadImage = async () => {
    if (!imageFile) {
      throw new Error(sell.errors.imageRequired);
    }

    if (imageFile.size > MAX_UPLOAD_SIZE) {
      throw new Error(sell.errors.imageTooLarge);
    }
    const formData = new FormData();
    formData.append('file', imageFile);
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });
    const payload = await parseResponsePayload(response);
    if (!response.ok) {
      const errorMessage =
        (typeof payload === 'string' && payload) ||
        (payload && typeof payload === 'object' && payload.error) ||
        sell.errors.uploadFailed;
      throw new Error(errorMessage);
    }
    if (!payload || typeof payload !== 'object' || !payload.url) {
      throw new Error(sell.errors.uploadFailed);
    }
    return payload.url;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus('loading');
    setMessage('');
    setFieldErrors({});

    try {
      const imageUrl = await uploadImage();
      const response = await fetch('/api/listings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formState.title.trim(),
          description: formState.description.trim(),
          price: Number(formState.price),
          condition: formState.condition,
          location: formState.location,
          category: formState.category,
          brand: formState.brand.trim(),
          model: formState.model.trim(),
          year: Number(formState.year),
          imageUrl,
        }),
      });
      const payload = await parseResponsePayload(response);
      if (!response.ok) {
        let errorMessage =
          (typeof payload === 'string' && payload) ||
          (payload && typeof payload === 'object' && payload.error) ||
          sell.errors.submitFailed;
        if (payload && typeof payload === 'object' && payload.fieldErrors) {
          setFieldErrors(payload.fieldErrors);
          errorMessage = payload.error || sell.errors.validation;
        }
        throw new Error(errorMessage);
      }

      if (!payload || typeof payload !== 'object' || !payload.listing) {
        throw new Error(sell.errors.submitFailed);
      }

      resetForm();
      setStatus('success');
      setMessage(sell.successMessage);
      savePendingListing(payload.listing);
    } catch (error) {
      console.error('Listing submission failed', error);
      setStatus('error');
      setMessage(error.message || sell.errors.submitFailed);
      if (error.message === sell.errors.imageRequired || error.message === sell.errors.imageTooLarge) {
        setFieldErrors((prev) => ({ ...prev, imageUrl: error.message }));
      }
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
              {fieldErrors.title && <span className="text-xs font-medium text-red-600">{fieldErrors.title}</span>}
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
              {fieldErrors.price && <span className="text-xs font-medium text-red-600">{fieldErrors.price}</span>}
            </label>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            <label className="flex flex-col gap-2 text-sm font-semibold uppercase tracking-[0.3em] text-deep-blue">
              {sell.fields.brand}
              <input
                required
                type="text"
                name="brand"
                value={formState.brand}
                onChange={handleInputChange}
                className="rounded-2xl border border-transparent bg-white/80 px-4 py-3 text-base text-deep-blue focus:border-coral focus:outline-none focus:ring-2 focus:ring-coral/30"
                placeholder={sell.placeholders.brand}
              />
              {fieldErrors.brand && <span className="text-xs font-medium text-red-600">{fieldErrors.brand}</span>}
            </label>
            <label className="flex flex-col gap-2 text-sm font-semibold uppercase tracking-[0.3em] text-deep-blue">
              {sell.fields.model}
              <input
                required
                type="text"
                name="model"
                value={formState.model}
                onChange={handleInputChange}
                className="rounded-2xl border border-transparent bg-white/80 px-4 py-3 text-base text-deep-blue focus:border-coral focus:outline-none focus:ring-2 focus:ring-coral/30"
                placeholder={sell.placeholders.model}
              />
              {fieldErrors.model && <span className="text-xs font-medium text-red-600">{fieldErrors.model}</span>}
            </label>
            <label className="flex flex-col gap-2 text-sm font-semibold uppercase tracking-[0.3em] text-deep-blue">
              {sell.fields.year}
              <input
                required
                type="number"
                name="year"
                value={formState.year}
                onChange={handleInputChange}
                min="1985"
                max={CURRENT_YEAR}
                className="rounded-2xl border border-transparent bg-white/80 px-4 py-3 text-base text-deep-blue focus:border-coral focus:outline-none focus:ring-2 focus:ring-coral/30"
                placeholder={sell.placeholders.year}
              />
              {fieldErrors.year && <span className="text-xs font-medium text-red-600">{fieldErrors.year}</span>}
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
            {fieldErrors.description && <span className="text-xs font-medium text-red-600">{fieldErrors.description}</span>}
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
              {fieldErrors.condition && <span className="text-xs font-medium text-red-600">{fieldErrors.condition}</span>}
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
              {fieldErrors.location && <span className="text-xs font-medium text-red-600">{fieldErrors.location}</span>}
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
              {fieldErrors.category && <span className="text-xs font-medium text-red-600">{fieldErrors.category}</span>}
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
            {fieldErrors.imageUrl && <span className="text-xs font-medium text-red-600">{fieldErrors.imageUrl}</span>}
          </label>
          {imagePreview && (
            /* eslint-disable-next-line @next/next/no-img-element */
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

'use client';

import { useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import useTranslations from '@/hooks/useTranslations';

const normalizeSelectedFilters = (filters = {}) => ({
  category: filters.category ?? '',
  condition: filters.condition ?? '',
  location: filters.location ?? '',
  brand: filters.brand ?? '',
  model: filters.model ?? '',
  year: filters.year ? String(filters.year) : '',
});

export default function FilterBar({ initialFilters = {} }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { filters: filterCopy } = useTranslations();
  const [selected, setSelected] = useState(() => normalizeSelectedFilters(initialFilters));

  const yearOptions = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 10 }, (_, index) => String(currentYear - index));
  }, []);

  useEffect(() => {
    setSelected(normalizeSelectedFilters(initialFilters));
  }, [initialFilters]);

  const updateQueryParams = (key, value) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  };

  const handleChange = (key, value) => {
    const next = { ...selected, [key]: value };
    setSelected(next);
    updateQueryParams(key, value);
  };

  return (
    <div className="grid gap-4 rounded-3xl bg-white/80 p-4 shadow-lg backdrop-blur-sm md:grid-cols-2 lg:grid-cols-5">
      {filterCopy.items.map((filter) => (
        <label key={filter.key} className="flex flex-col gap-2 text-xs uppercase tracking-[0.3em] text-deep-blue/80">
          {filter.label}
          <select
            className="rounded-full border-none bg-sand/40 px-4 py-2 text-sm capitalize text-deep-blue focus:ring-2 focus:ring-coral"
            onChange={(event) => handleChange(filter.key, event.target.value)}
            value={selected[filter.key] || ''}
          >
            <option value="">{filterCopy.any}</option>
            {filter.options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      ))}
      <label className="flex flex-col gap-2 text-xs uppercase tracking-[0.3em] text-deep-blue/80">
        {filterCopy.brand.label}
        <select
          className="rounded-full border-none bg-sand/40 px-4 py-2 text-sm capitalize text-deep-blue focus:ring-2 focus:ring-coral"
          onChange={(event) => handleChange('brand', event.target.value)}
          value={selected.brand}
        >
          <option value="">{filterCopy.brand.any}</option>
          {filterCopy.brand.options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-2 text-xs uppercase tracking-[0.3em] text-deep-blue/80">
        {filterCopy.model.label}
        <input
          type="text"
          className="rounded-full border-none bg-sand/40 px-4 py-2 text-sm text-deep-blue focus:ring-2 focus:ring-coral"
          onChange={(event) => handleChange('model', event.target.value)}
          placeholder={filterCopy.model.placeholder}
          value={selected.model}
        />
      </label>
      <label className="flex flex-col gap-2 text-xs uppercase tracking-[0.3em] text-deep-blue/80">
        {filterCopy.year.label}
        <select
          className="rounded-full border-none bg-sand/40 px-4 py-2 text-sm capitalize text-deep-blue focus:ring-2 focus:ring-coral"
          onChange={(event) => handleChange('year', event.target.value)}
          value={selected.year}
        >
          <option value="">{filterCopy.year.any}</option>
          {yearOptions.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}

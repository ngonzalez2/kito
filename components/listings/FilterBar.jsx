'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import useTranslations from '@/hooks/useTranslations';

export default function FilterBar({ initialFilters = {} }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { filters: filterCopy } = useTranslations();
  const [selected, setSelected] = useState(initialFilters);

  useEffect(() => {
    setSelected(initialFilters);
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
    <div className="flex flex-col gap-4 rounded-3xl bg-white/80 p-4 shadow-lg backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between">
      {filterCopy.items.map((filter) => (
        <label key={filter.key} className="flex flex-1 flex-col gap-2 text-xs uppercase tracking-[0.3em] text-deep-blue/80">
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
    </div>
  );
}

import { useState } from 'react';

const filters = [
  { label: 'Category', key: 'category', options: ['Kites', 'Boards', 'Harnesses'] },
  { label: 'Condition', key: 'condition', options: ['New', 'Excellent', 'Good', 'Fair'] },
  { label: 'Price', key: 'price', options: ['< $3M', '$3M - $6M', '$6M+'] },
  { label: 'Location', key: 'location', options: ['Mayapo', 'Cabo de la Vela', 'Santa Verónica', 'Cartagena', 'Puerto Velero', 'Santa Marta'] },
];

export default function FilterBar({ onFilter }) {
  const [selected, setSelected] = useState({});

  const handleChange = (key, value) => {
    const next = { ...selected, [key]: value };
    setSelected(next);
    onFilter?.(next);
  };

  return (
    <div className="flex flex-col gap-4 rounded-3xl bg-white/80 p-4 shadow-lg backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between">
      {filters.map((filter) => (
        <label key={filter.key} className="flex flex-1 flex-col gap-2 text-xs uppercase tracking-[0.3em] text-deep-blue/80">
          {filter.label}
          <select
            className="rounded-full border-none bg-sand/40 px-4 py-2 text-sm capitalize text-deep-blue focus:ring-2 focus:ring-coral"
            onChange={(event) => handleChange(filter.key, event.target.value)}
            value={selected[filter.key] || ''}
          >
            <option value="">Any</option>
            {filter.options.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
      ))}
    </div>
  );
}

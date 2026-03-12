"use client";

import { useState } from "react";

interface Filters {
  city?: string;
  ethnicity?: string;
  bodyType?: string;
  hairColor?: string;
  ageMin?: number;
  ageMax?: number;
  verified?: boolean;
  sortBy?: string;
}

interface FilterBarProps {
  filters: Filters;
  onChange: (filters: Filters) => void;
}

const CITIES = ["All", "Miami", "New York", "Los Angeles", "Las Vegas", "Chicago", "Houston", "Dallas", "Atlanta"];
const ETHNICITIES = ["All", "Latina", "European", "Asian", "African", "Middle Eastern", "Mixed"];
const BODY_TYPES = ["All", "Slim", "Athletic", "Curvy", "Petite"];
const HAIR_COLORS = ["All", "Blonde", "Brunette", "Black", "Red", "Auburn"];
const SORT_OPTIONS = [
  { value: "NEWEST", label: "Newest" },
  { value: "RATING", label: "Top Rated" },
  { value: "PRICE_LOW", label: "Price: Low" },
  { value: "PRICE_HIGH", label: "Price: High" },
];

function SelectFilter({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium uppercase tracking-wider text-zinc-500">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-white outline-none transition focus:border-pink-500 focus:ring-1 focus:ring-pink-500"
      >
        {options.map((opt) => (
          <option key={opt} value={opt === "All" ? "" : opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
}

export function FilterBar({ filters, onChange }: FilterBarProps) {
  const [expanded, setExpanded] = useState(false);

  const update = (key: string, value: string | number | boolean | undefined) => {
    onChange({ ...filters, [key]: value || undefined });
  };

  return (
    <div className="rounded-2xl border border-zinc-800/50 bg-zinc-900/50 p-4 backdrop-blur-sm">
      {/* Primary row - always visible */}
      <div className="flex flex-wrap items-end gap-4">
        <SelectFilter
          label="City"
          value={filters.city ?? ""}
          options={CITIES}
          onChange={(v) => update("city", v)}
        />
        <SelectFilter
          label="Ethnicity"
          value={filters.ethnicity ?? ""}
          options={ETHNICITIES}
          onChange={(v) => update("ethnicity", v)}
        />
        <SelectFilter
          label="Body Type"
          value={filters.bodyType ?? ""}
          options={BODY_TYPES}
          onChange={(v) => update("bodyType", v)}
        />
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium uppercase tracking-wider text-zinc-500">
            Sort
          </label>
          <select
            value={filters.sortBy ?? "NEWEST"}
            onChange={(e) => update("sortBy", e.target.value)}
            className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-white outline-none transition focus:border-pink-500 focus:ring-1 focus:ring-pink-500"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={() => setExpanded(!expanded)}
          className="rounded-lg border border-zinc-700 px-4 py-2 text-sm text-zinc-400 transition hover:border-pink-500 hover:text-white"
        >
          {expanded ? "Less Filters" : "More Filters"}
        </button>

        <label className="flex cursor-pointer items-center gap-2 py-2">
          <input
            type="checkbox"
            checked={filters.verified ?? false}
            onChange={(e) => update("verified", e.target.checked || undefined)}
            className="h-4 w-4 rounded border-zinc-700 bg-zinc-800 text-pink-500 focus:ring-pink-500"
          />
          <span className="text-sm text-zinc-300">Verified only</span>
        </label>
      </div>

      {/* Expanded row */}
      {expanded && (
        <div className="mt-4 flex flex-wrap items-end gap-4 border-t border-zinc-800 pt-4">
          <SelectFilter
            label="Hair"
            value={filters.hairColor ?? ""}
            options={HAIR_COLORS}
            onChange={(v) => update("hairColor", v)}
          />
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium uppercase tracking-wider text-zinc-500">
              Age Range
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder="Min"
                min={18}
                max={99}
                value={filters.ageMin ?? ""}
                onChange={(e) =>
                  update("ageMin", e.target.value ? parseInt(e.target.value) : undefined)
                }
                className="w-20 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-white outline-none focus:border-pink-500"
              />
              <span className="text-zinc-600">-</span>
              <input
                type="number"
                placeholder="Max"
                min={18}
                max={99}
                value={filters.ageMax ?? ""}
                onChange={(e) =>
                  update("ageMax", e.target.value ? parseInt(e.target.value) : undefined)
                }
                className="w-20 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-white outline-none focus:border-pink-500"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

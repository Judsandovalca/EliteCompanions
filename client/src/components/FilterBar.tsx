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

const CITIES = ["Todas", "Miami", "New York", "Los Angeles", "Las Vegas", "Chicago", "Houston", "Dallas", "Atlanta", "Bogotá", "Medellín", "Cali"];
const ETHNICITIES = ["Todas", "Latina", "Europea", "Asiática", "Africana", "Árabe", "Mixta"];
const BODY_TYPES = ["Todos", "Delgada", "Atlética", "Curvilínea", "Petite"];
const HAIR_COLORS = ["Todos", "Rubia", "Castaña", "Negra", "Pelirroja", "Cobriza"];
const SORT_OPTIONS = [
  { value: "NEWEST", label: "Más Recientes" },
  { value: "RATING", label: "Mejor Valoradas" },
  { value: "PRICE_LOW", label: "Precio: Menor" },
  { value: "PRICE_HIGH", label: "Precio: Mayor" },
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
    <div className="flex flex-col gap-1.5">
      <label className="text-[10px] font-semibold uppercase tracking-[0.15em] text-warm-gray">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-lg border border-sand bg-white px-3 py-2.5 text-sm text-charcoal outline-none transition-colors focus:border-gold focus:ring-1 focus:ring-gold/30"
      >
        {options.map((opt) => (
          <option key={opt} value={opt === "Todas" || opt === "Todos" ? "" : opt}>
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

  const activeCount = Object.values(filters).filter(Boolean).length;

  return (
    <div className="rounded-2xl border border-sand/80 bg-white p-5">
      <div className="flex flex-wrap items-end gap-4">
        <SelectFilter
          label="Ciudad"
          value={filters.city ?? ""}
          options={CITIES}
          onChange={(v) => update("city", v)}
        />
        <SelectFilter
          label="Etnia"
          value={filters.ethnicity ?? ""}
          options={ETHNICITIES}
          onChange={(v) => update("ethnicity", v)}
        />
        <SelectFilter
          label="Contextura"
          value={filters.bodyType ?? ""}
          options={BODY_TYPES}
          onChange={(v) => update("bodyType", v)}
        />
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-semibold uppercase tracking-[0.15em] text-warm-gray">
            Ordenar
          </label>
          <select
            value={filters.sortBy ?? "NEWEST"}
            onChange={(e) => update("sortBy", e.target.value)}
            className="rounded-lg border border-sand bg-white px-3 py-2.5 text-sm text-charcoal outline-none transition-colors focus:border-gold focus:ring-1 focus:ring-gold/30"
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
          className="rounded-lg border border-sand px-4 py-2.5 text-sm font-medium text-warm-gray transition-all hover:border-charcoal/30 hover:text-charcoal"
        >
          {expanded ? "Menos" : "Más Filtros"}
        </button>

        <label className="flex cursor-pointer items-center gap-2.5 py-2.5">
          <input
            type="checkbox"
            checked={filters.verified ?? false}
            onChange={(e) => update("verified", e.target.checked || undefined)}
            className="h-4 w-4 rounded border-sand bg-white text-gold accent-gold focus:ring-gold/30"
          />
          <span className="text-sm text-charcoal">Solo verificadas</span>
        </label>

        {activeCount > 0 && (
          <button
            onClick={() => onChange({})}
            className="py-2.5 text-sm font-medium text-gold transition-colors hover:text-charcoal"
          >
            Limpiar todo
          </button>
        )}
      </div>

      {expanded && (
        <div className="mt-4 flex flex-wrap items-end gap-4 border-t border-sand/60 pt-4">
          <SelectFilter
            label="Color de Cabello"
            value={filters.hairColor ?? ""}
            options={HAIR_COLORS}
            onChange={(v) => update("hairColor", v)}
          />
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-semibold uppercase tracking-[0.15em] text-warm-gray">
              Rango de Edad
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder="Mín"
                min={18}
                max={99}
                value={filters.ageMin ?? ""}
                onChange={(e) =>
                  update("ageMin", e.target.value ? parseInt(e.target.value) : undefined)
                }
                className="w-20 rounded-lg border border-sand bg-white px-3 py-2.5 text-sm text-charcoal outline-none focus:border-gold"
              />
              <span className="text-sand">—</span>
              <input
                type="number"
                placeholder="Máx"
                min={18}
                max={99}
                value={filters.ageMax ?? ""}
                onChange={(e) =>
                  update("ageMax", e.target.value ? parseInt(e.target.value) : undefined)
                }
                className="w-20 rounded-lg border border-sand bg-white px-3 py-2.5 text-sm text-charcoal outline-none focus:border-gold"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

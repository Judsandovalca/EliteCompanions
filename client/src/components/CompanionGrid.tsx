"use client";

import { useQuery } from "@apollo/client/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { GET_COMPANIONS } from "@/lib/queries";
import { CompanionCard } from "./CompanionCard";
import { FilterBar } from "./FilterBar";
import type { GetCompanionsData, Companion } from "@/lib/types";

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

export function CompanionGrid() {
  const [filters, setFilters] = useState<Filters>({});

  const { data, loading, error, fetchMore } = useQuery<GetCompanionsData>(GET_COMPANIONS, {
    variables: {
      input: {
        limit: 24,
        ...filters,
      },
    },
  });

  const observer = useRef<IntersectionObserver | null>(null);
  const lastNodeRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    return () => {
      observer.current?.disconnect();
    };
  }, []);

  const lastCardRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (observer.current) observer.current.disconnect();
      lastNodeRef.current = node;

      if (loading || !node) return;

      observer.current = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting && data?.companions?.hasMore) {
            fetchMore({
              variables: {
                input: {
                  ...filters,
                  limit: 24,
                  cursor: data.companions.nextCursor,
                },
              },
            });
          }
        },
        { rootMargin: "400px" }
      );

      observer.current.observe(node);
    },
    [loading, data, fetchMore, filters]
  );

  const handleFilterChange = (newFilters: Filters) => {
    setFilters(newFilters);
  };

  const companions = data?.companions?.edges ?? [];
  const totalCount = data?.companions?.totalCount ?? 0;

  return (
    <div className="space-y-6">
      <FilterBar filters={filters} onChange={handleFilterChange} />

      {!loading && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-warm-gray">
            {totalCount} acompañante{totalCount !== 1 ? "s" : ""}
          </p>
        </div>
      )}

      {/* Grid — tarjetas grandes: 2 cols móvil, 3 tablet, 4 escritorio */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5">
        {companions.map((companion: Companion, index: number) => (
          <div
            key={companion.id}
            ref={index === companions.length - 1 ? lastCardRef : null}
          >
            <CompanionCard
              id={companion.id}
              name={companion.name}
              age={companion.age}
              tagline={companion.tagline}
              city={companion.city}
              tags={companion.tags}
              pricePerHour={companion.pricePerHour}
              currency={companion.currency}
              rating={companion.rating}
              verified={companion.verified}
              featured={companion.featured}
              image={companion.primaryImage}
            />
          </div>
        ))}

        {loading &&
          Array.from({ length: 8 }).map((_, i) => (
            <div key={`skeleton-${i}`} className="animate-pulse rounded-2xl bg-cream">
              <div className="aspect-[3/4] rounded-t-2xl bg-sand/40" />
              <div className="space-y-2 p-4">
                <div className="h-4 w-3/4 rounded bg-sand/40" />
                <div className="h-3 w-1/2 rounded bg-sand/40" />
              </div>
            </div>
          ))}
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center text-red-600">
          Error al cargar acompañantes. Intenta de nuevo.
        </div>
      )}

      {data?.companions?.hasMore && !loading && (
        <div className="flex justify-center py-10">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-sand border-t-gold" />
        </div>
      )}
    </div>
  );
}

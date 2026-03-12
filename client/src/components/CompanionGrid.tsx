"use client";

import { useQuery } from "@apollo/client/react";
import { useCallback, useRef, useState } from "react";
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

  // Infinite scroll trigger
  const observer = useRef<IntersectionObserver | null>(null);
  const lastCardRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();

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

      if (node) observer.current.observe(node);
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

      {/* Results count */}
      {!loading && (
        <p className="text-sm text-zinc-500">
          Showing {companions.length} of {totalCount} companions
        </p>
      )}

      {/* Grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
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
              pricePerHour={companion.pricePerHour}
              currency={companion.currency}
              rating={companion.rating}
              verified={companion.verified}
              featured={companion.featured}
              image={companion.primaryImage}
            />
          </div>
        ))}

        {/* Loading skeletons */}
        {loading &&
          Array.from({ length: 12 }).map((_, i) => (
            <div
              key={`skeleton-${i}`}
              className="animate-pulse rounded-2xl bg-zinc-900"
            >
              <div
                className="rounded-t-2xl bg-zinc-800"
                style={{ paddingBottom: "133%" }}
              />
              <div className="space-y-2 p-4">
                <div className="h-4 w-3/4 rounded bg-zinc-800" />
                <div className="h-3 w-1/2 rounded bg-zinc-800" />
              </div>
            </div>
          ))}
      </div>

      {/* Error state */}
      {error && (
        <div className="rounded-xl border border-red-900/50 bg-red-950/30 p-6 text-center text-red-400">
          Failed to load companions. Please try again.
        </div>
      )}

      {/* Loading more indicator */}
      {data?.companions?.hasMore && !loading && (
        <div className="py-8 text-center text-zinc-600">
          <div className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-zinc-700 border-t-pink-500" />
        </div>
      )}
    </div>
  );
}

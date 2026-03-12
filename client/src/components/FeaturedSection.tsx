"use client";

import { useQuery } from "@apollo/client/react";
import { GET_FEATURED } from "@/lib/queries";
import { CompanionCard } from "./CompanionCard";
import type { GetFeaturedData, Companion } from "@/lib/types";

export function FeaturedSection() {
  const { data, loading } = useQuery<GetFeaturedData>(GET_FEATURED, {
    variables: { limit: 5 },
  });

  const featured = data?.featuredCompanions ?? [];

  if (!loading && featured.length === 0) return null;

  return (
    <section className="mx-auto max-w-screen-2xl px-5 py-12">
      {/* Encabezado */}
      <div className="mb-8 flex items-end justify-between">
        <div>
          <span className="text-[11px] font-medium uppercase tracking-[0.15em] text-warm-gray">
            Destacadas
          </span>
          <h2 className="mt-1 text-xl font-semibold tracking-tight text-espresso sm:text-2xl">
            Perfiles Populares
          </h2>
        </div>
        <a
          href="/featured"
          className="hidden text-sm text-warm-gray transition-colors hover:text-espresso sm:block"
        >
          Ver más →
        </a>
      </div>

      {/* Grid destacadas — todas del mismo tamaño */}
      {loading ? (
        <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="animate-pulse rounded-xl bg-cream">
              <div className="aspect-[3/4] rounded-t-xl bg-sand/50" />
              <div className="space-y-2 p-3">
                <div className="h-4 w-3/4 rounded bg-sand/50" />
                <div className="h-3 w-1/2 rounded bg-sand/50" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-5">
          {featured.map((companion: Companion) => (
            <CompanionCard
              key={companion.id}
              id={companion.id}
              name={companion.name}
              age={companion.age}
              tagline={companion.tagline}
              city={companion.city}
              tags={companion.tags}
              pricePerHour={companion.pricePerHour}
              currency={companion.currency ?? "USD"}
              rating={companion.rating}
              verified={companion.verified}
              featured={companion.featured ?? true}
              image={companion.primaryImage}
            />
          ))}
        </div>
      )}
    </section>
  );
}

"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { VerifiedBadgeIcon } from "./icons/VerifiedBadgeIcon";
import { LocationPinIcon } from "./icons/LocationPinIcon";

interface CompanionCardProps {
  id: string;
  name: string;
  age: number;
  tagline?: string | null;
  city: string;
  tags?: string[];
  pricePerHour?: number | null;
  currency: string;
  rating: number;
  verified: boolean;
  featured: boolean;
  image?: {
    thumbUrl: string;
    mediumUrl: string;
    width: number;
    height: number;
    blurHash?: string | null;
  } | null;
  variant?: "default" | "featured";
}

export function CompanionCard({
  id,
  name,
  age,
  tagline,
  city,
  tags = [],
  pricePerHour,
  currency,
  rating,
  verified,
  image,
  variant = "default",
}: CompanionCardProps) {
  const [loaded, setLoaded] = useState(false);
  const [inView, setInView] = useState(false);
  const [hovered, setHovered] = useState(false);

  const observerRef = useCallback((node: HTMLDivElement | null) => {
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: "300px" }
    );
    observer.observe(node);
  }, []);

  const priceDisplay = pricePerHour
    ? `${currency === "USD" ? "$" : currency}${(pricePerHour / 100).toFixed(0)}`
    : null;

  const isFeatured = variant === "featured";
  const hasExtra = tagline || tags.length > 0;

  return (
    <div
      className="relative"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Link href={`/companion/${id}`} className="group block">
        <div className="relative overflow-hidden rounded-xl bg-cream transition-all duration-300 group-hover:shadow-lg group-hover:shadow-charcoal/6 group-hover:-translate-y-0.5">
          {/* Imagen */}
          <div
            ref={observerRef}
            className={`relative w-full overflow-hidden ${isFeatured ? "aspect-[3/4]" : "aspect-[3/4]"}`}
          >
            <div
              className={`absolute inset-0 bg-gradient-to-br from-sand/80 to-cream transition-opacity duration-700 ${
                loaded ? "opacity-0" : "opacity-100"
              }`}
            />

            {inView && image && (
              <img
                src={image.mediumUrl}
                alt={name}
                loading="lazy"
                decoding="async"
                onLoad={() => setLoaded(true)}
                className={`absolute inset-0 h-full w-full object-cover transition-all duration-700 group-hover:scale-[1.03] ${
                  loaded ? "opacity-100" : "opacity-0"
                }`}
              />
            )}

            {/* Gradiente inferior para legibilidad */}
            <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

            {/* Insignia verificada */}
            {verified && (
              <div className="absolute top-4 left-4">
                <span className="inline-flex items-center gap-1 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-espresso backdrop-blur-sm">
                  <VerifiedBadgeIcon className="h-3 w-3 text-blue-500" />
                  Verificada
                </span>
              </div>
            )}

            {/* Precio sobre imagen */}
            {priceDisplay && (
              <div className="absolute top-4 right-4">
                <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-espresso backdrop-blur-sm">
                  desde {priceDisplay}/hr
                </span>
              </div>
            )}

            {/* Nombre en la parte inferior de la imagen */}
            <div className="absolute inset-x-0 bottom-0 p-4">
              <h3 className="text-base font-semibold text-white">
                {name}, <span className="font-normal text-white/80">{age}</span>
              </h3>
              <div className="mt-1 flex items-center gap-2">
                <span className="flex items-center gap-1 text-xs text-white/70">
                  <LocationPinIcon className="h-3 w-3" />
                  {city}
                </span>
                <span className="text-white/40">|</span>
                <span className="flex items-center gap-1 text-xs text-white/70">
                  <span className="text-amber-400">★</span>
                  {rating.toFixed(1)}
                </span>
              </div>
            </div>
          </div>

          {/* Tags debajo de la imagen */}
          <div className="p-4">
            {tags.length > 0 ? (
              <div className="flex flex-wrap gap-1">
                {tags.slice(0, 3).map((tag) => (
                  <span key={tag} className="rounded-full bg-gold/10 px-2.5 py-0.5 text-xs font-medium text-gold">
                    #{tag}
                  </span>
                ))}
                {tags.length > 3 && (
                  <span className="text-xs text-warm-gray py-0.5">+{tags.length - 3}</span>
                )}
              </div>
            ) : (
              <p className="text-sm text-warm-gray">Ver perfil</p>
            )}
          </div>
        </div>
      </Link>

      {/* Hover tooltip — appears to the right */}
      {hovered && hasExtra && (
        <div className="pointer-events-none absolute left-full top-4 z-50 ml-1 w-60 animate-in fade-in slide-in-from-left-2 duration-200">
          <div className="rounded-xl border border-sand/80 bg-white p-4 shadow-xl">
            <h4 className="text-sm font-semibold text-espresso">{name}, {age}</h4>
            {tagline && (
              <p className="mt-1 text-xs leading-relaxed text-charcoal/70">{tagline}</p>
            )}
            {tags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {tags.map((tag) => (
                  <span key={tag} className="rounded-full bg-gold/10 px-2.5 py-0.5 text-xs font-medium text-gold">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useState, useRef, useCallback } from "react";
import Link from "next/link";

interface CompanionCardProps {
  id: string;
  name: string;
  age: number;
  tagline?: string | null;
  city: string;
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
}

export function CompanionCard({
  id,
  name,
  age,
  tagline,
  city,
  pricePerHour,
  currency,
  rating,
  verified,
  featured,
  image,
}: CompanionCardProps) {
  const [loaded, setLoaded] = useState(false);
  const [inView, setInView] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);

  // Intersection Observer for lazy loading
  const observerRef = useCallback((node: HTMLDivElement | null) => {
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" }
    );
    observer.observe(node);
  }, []);

  const aspectRatio = image ? image.height / image.width : 4 / 3;
  const priceDisplay = pricePerHour
    ? `${currency === "USD" ? "$" : currency}${(pricePerHour / 100).toFixed(0)}/hr`
    : null;

  return (
    <Link href={`/companion/${id}`} className="group block">
      <div className="relative overflow-hidden rounded-2xl bg-zinc-900 shadow-lg transition-all duration-300 group-hover:shadow-2xl group-hover:shadow-pink-500/10 group-hover:-translate-y-1">
        {/* Image container with aspect ratio */}
        <div
          ref={(node) => {
            observerRef(node);
          }}
          className="relative w-full overflow-hidden"
          style={{ paddingBottom: `${aspectRatio * 100}%` }}
        >
          {/* Blur placeholder */}
          <div
            className={`absolute inset-0 bg-gradient-to-br from-pink-900/40 to-purple-900/40 transition-opacity duration-500 ${
              loaded ? "opacity-0" : "opacity-100"
            }`}
          />

          {/* Actual image */}
          {inView && image && (
            <img
              src={image.mediumUrl}
              alt={name}
              loading="lazy"
              decoding="async"
              onLoad={() => setLoaded(true)}
              className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${
                loaded ? "opacity-100" : "opacity-0"
              }`}
            />
          )}

          {/* Badges */}
          <div className="absolute top-3 left-3 flex gap-2">
            {featured && (
              <span className="rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white shadow-lg">
                Featured
              </span>
            )}
            {verified && (
              <span className="rounded-full bg-emerald-500/90 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white shadow-lg">
                Verified
              </span>
            )}
          </div>

          {/* Price badge */}
          {priceDisplay && (
            <div className="absolute top-3 right-3">
              <span className="rounded-full bg-black/70 px-3 py-1 text-sm font-semibold text-white backdrop-blur-sm">
                {priceDisplay}
              </span>
            </div>
          )}

          {/* Bottom gradient overlay */}
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/80 to-transparent" />
        </div>

        {/* Info */}
        <div className="p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">
              {name}, <span className="text-zinc-400">{age}</span>
            </h3>
            <div className="flex items-center gap-1 text-sm">
              <span className="text-amber-400">★</span>
              <span className="text-zinc-300">{rating.toFixed(1)}</span>
            </div>
          </div>
          {tagline && (
            <p className="mt-1 text-sm text-zinc-400 line-clamp-1">{tagline}</p>
          )}
          <div className="mt-2 flex items-center gap-1 text-xs text-zinc-500">
            <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                clipRule="evenodd"
              />
            </svg>
            {city}
          </div>
        </div>
      </div>
    </Link>
  );
}

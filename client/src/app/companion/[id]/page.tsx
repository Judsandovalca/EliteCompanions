"use client";

import { useQuery } from "@apollo/client/react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { GET_COMPANION_DETAIL } from "@/lib/queries";
import { Header } from "@/components/Header";
import type { GetCompanionDetailData, CompanionImage } from "@/lib/types";

export default function CompanionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [selectedImage, setSelectedImage] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const { data, loading, error } = useQuery<GetCompanionDetailData>(GET_COMPANION_DETAIL, {
    variables: { id },
  });

  // Keyboard nav for lightbox
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!lightboxOpen) return;
      const images = data?.companion?.images ?? [];
      if (e.key === "Escape") setLightboxOpen(false);
      if (e.key === "ArrowRight")
        setSelectedImage((i) => (i + 1) % images.length);
      if (e.key === "ArrowLeft")
        setSelectedImage((i) => (i - 1 + images.length) % images.length);
    },
    [lightboxOpen, data]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // Lock body scroll when lightbox is open
  useEffect(() => {
    document.body.style.overflow = lightboxOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [lightboxOpen]);

  if (loading) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="mx-auto max-w-6xl px-4 py-12">
          <div className="mb-6 h-4 w-28 rounded bg-zinc-800" />
          <div className="grid animate-pulse gap-8 lg:grid-cols-5">
            <div className="lg:col-span-3 space-y-3">
              <div className="aspect-[3/4] rounded-2xl bg-zinc-800" />
              <div className="flex gap-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-20 w-16 rounded-lg bg-zinc-800" />
                ))}
              </div>
            </div>
            <div className="lg:col-span-2 space-y-4">
              <div className="h-10 w-56 rounded bg-zinc-800" />
              <div className="h-5 w-40 rounded bg-zinc-800" />
              <div className="h-20 w-full rounded-xl bg-zinc-800" />
              <div className="h-32 w-full rounded bg-zinc-800" />
              <div className="grid grid-cols-2 gap-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-16 rounded-lg bg-zinc-800" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !data?.companion) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="mx-auto max-w-5xl px-4 py-24 text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-zinc-900">
            <svg className="h-10 w-10 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white">Companion not found</h2>
          <p className="mt-2 text-zinc-500">This profile may have been removed or doesn't exist.</p>
          <Link
            href="/"
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-zinc-800 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-700"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to browse
          </Link>
        </div>
      </div>
    );
  }

  const c = data.companion;
  const images = c.images ?? [];
  const currentImage = images[selectedImage];
  const priceDisplay = c.pricePerHour
    ? `${c.currency === "USD" ? "$" : c.currency}${(c.pricePerHour / 100).toFixed(0)}/hr`
    : null;

  return (
    <div className="min-h-screen">
      <Header />

      <div className="mx-auto max-w-6xl px-4 py-8">
        {/* Back link */}
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-zinc-400 transition hover:text-white"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to browse
        </Link>

        <div className="grid gap-8 lg:grid-cols-5">
          {/* Left: Image gallery — takes 3 cols on large */}
          <div className="lg:col-span-3 space-y-3">
            {/* Main image */}
            <div
              className="relative aspect-[3/4] cursor-zoom-in overflow-hidden rounded-2xl bg-zinc-900"
              onClick={() => setLightboxOpen(true)}
            >
              {currentImage && (
                <img
                  src={currentImage.fullUrl}
                  alt={c.name}
                  className="h-full w-full object-cover transition-transform duration-300 hover:scale-[1.02]"
                />
              )}

              {/* Badges overlay */}
              <div className="absolute top-4 left-4 flex gap-2">
                {c.featured && (
                  <span className="rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white shadow-lg">
                    Featured
                  </span>
                )}
                {c.verified && (
                  <span className="rounded-full bg-emerald-500/90 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white shadow-lg backdrop-blur-sm">
                    Verified
                  </span>
                )}
              </div>

              {/* Image counter */}
              {images.length > 1 && (
                <div className="absolute bottom-4 right-4 rounded-full bg-black/60 px-3 py-1 text-xs text-white backdrop-blur-sm">
                  {selectedImage + 1} / {images.length}
                </div>
              )}

              {/* Prev/Next arrows on main image */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedImage((i) => (i - 1 + images.length) % images.length);
                    }}
                    className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white opacity-0 backdrop-blur-sm transition group-hover:opacity-100 hover:bg-black/70 sm:opacity-100"
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedImage((i) => (i + 1) % images.length);
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white opacity-0 backdrop-blur-sm transition group-hover:opacity-100 hover:bg-black/70 sm:opacity-100"
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </>
              )}
            </div>

            {/* Thumbnail strip */}
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {images.map((img: CompanionImage, i: number) => (
                  <button
                    key={img.id}
                    onClick={() => setSelectedImage(i)}
                    className={`h-20 w-16 flex-shrink-0 overflow-hidden rounded-lg transition-all ${
                      i === selectedImage
                        ? "ring-2 ring-pink-500 ring-offset-2 ring-offset-zinc-950"
                        : "opacity-50 hover:opacity-100"
                    }`}
                  >
                    <img
                      src={img.thumbUrl}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Details — takes 2 cols on large */}
          <div className="lg:col-span-2 space-y-6">
            {/* Name + location + rating */}
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-white">
                {c.name}, <span className="text-zinc-400">{c.age}</span>
              </h1>
              {c.tagline && (
                <p className="mt-1 text-lg text-zinc-400">{c.tagline}</p>
              )}
              <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
                <span className="flex items-center gap-1 text-zinc-400">
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {c.city}
                  {c.region ? `, ${c.region}` : ""}
                </span>
                <span className="flex items-center gap-1">
                  <span className="text-amber-400">★</span>
                  <span className="text-zinc-300">{c.rating.toFixed(1)}</span>
                  <span className="text-zinc-600">({c.reviewCount} reviews)</span>
                </span>
              </div>
            </div>

            {/* Price + Availability card */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/80 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                    Starting at
                  </span>
                  <p className="text-3xl font-bold text-white">
                    {priceDisplay ?? "Contact for pricing"}
                  </p>
                </div>
                {c.availability && (
                  <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-medium text-emerald-400">
                    {c.availability}
                  </span>
                )}
              </div>
              <button className="mt-4 w-full rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 py-3.5 text-base font-semibold text-white transition hover:from-pink-600 hover:to-purple-700 active:scale-[0.98]">
                Contact {c.name}
              </button>
            </div>

            {/* About */}
            {c.bio && (
              <div>
                <h3 className="mb-2 text-sm font-medium uppercase tracking-wider text-zinc-500">
                  About
                </h3>
                <p className="leading-relaxed text-zinc-300">{c.bio}</p>
              </div>
            )}

            {/* Attributes grid */}
            <div className="grid grid-cols-2 gap-3">
              {(
                [
                  ["Ethnicity", c.ethnicity],
                  ["Body Type", c.bodyType],
                  ["Hair", c.hairColor],
                  ["Eyes", c.eyeColor],
                  ["Height", c.height ? `${c.height} cm` : null],
                  ["Country", c.country],
                ] as [string, string | null][]
              )
                .filter(([, v]) => v)
                .map(([label, value]) => (
                  <div key={label} className="rounded-lg bg-zinc-900 p-3">
                    <span className="text-xs text-zinc-500">{label}</span>
                    <p className="text-sm font-medium text-white">{value}</p>
                  </div>
                ))}
            </div>

            {/* Languages */}
            {c.languages?.length > 0 && (
              <div>
                <h3 className="mb-2 text-sm font-medium uppercase tracking-wider text-zinc-500">
                  Languages
                </h3>
                <div className="flex flex-wrap gap-2">
                  {c.languages.map((lang: string) => (
                    <span
                      key={lang}
                      className="rounded-full bg-zinc-800 px-3 py-1 text-sm text-zinc-300"
                    >
                      {lang}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Services */}
            {c.services?.length > 0 && (
              <div>
                <h3 className="mb-2 text-sm font-medium uppercase tracking-wider text-zinc-500">
                  Services
                </h3>
                <div className="flex flex-wrap gap-2">
                  {c.services.map((svc: string) => (
                    <span
                      key={svc}
                      className="rounded-full border border-pink-500/30 bg-pink-500/10 px-3 py-1 text-sm text-pink-300"
                    >
                      {svc}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Categories */}
            {c.categories?.length > 0 && (
              <div>
                <h3 className="mb-2 text-sm font-medium uppercase tracking-wider text-zinc-500">
                  Categories
                </h3>
                <div className="flex flex-wrap gap-2">
                  {c.categories.map((cat: { id: string; name: string; slug: string }) => (
                    <Link
                      key={cat.id}
                      href={`/?category=${cat.slug}`}
                      className="rounded-full border border-zinc-700 bg-zinc-800/50 px-3 py-1 text-sm text-zinc-300 transition hover:border-pink-500/50 hover:text-pink-300"
                    >
                      {cat.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-12 border-t border-zinc-800/50 bg-zinc-950">
        <div className="mx-auto max-w-7xl px-4 py-8">
          <p className="text-center text-sm text-zinc-600">
            All companions are independent. Must be 18+ to use this service.
          </p>
        </div>
      </footer>

      {/* Lightbox */}
      {lightboxOpen && currentImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm"
          onClick={() => setLightboxOpen(false)}
        >
          {/* Close button */}
          <button
            onClick={() => setLightboxOpen(false)}
            className="absolute top-4 right-4 z-10 rounded-full bg-white/10 p-2 text-white transition hover:bg-white/20"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Counter */}
          <div className="absolute top-4 left-4 text-sm text-white/60">
            {selectedImage + 1} / {images.length}
          </div>

          {/* Image */}
          <img
            src={currentImage.fullUrl}
            alt={c.name}
            onClick={(e) => e.stopPropagation()}
            className="max-h-[90vh] max-w-[90vw] rounded-lg object-contain"
          />

          {/* Nav arrows */}
          {images.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedImage((i) => (i - 1 + images.length) % images.length);
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white transition hover:bg-white/20"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedImage((i) => (i + 1) % images.length);
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white transition hover:bg-white/20"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

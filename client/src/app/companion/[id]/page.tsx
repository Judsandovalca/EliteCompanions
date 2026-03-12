"use client";

import { useQuery } from "@apollo/client/react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { GET_COMPANION_DETAIL } from "@/lib/queries";
import { Header } from "@/components/Header";
import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";
import { VerifiedBadgeIcon } from "@/components/icons/VerifiedBadgeIcon";
import { LocationPinIcon } from "@/components/icons/LocationPinIcon";
import type { GetCompanionDetailData, CompanionImage } from "@/lib/types";

export default function CompanionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [selectedImage, setSelectedImage] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const { data, loading, error } = useQuery<GetCompanionDetailData>(GET_COMPANION_DETAIL, {
    variables: { id },
  });

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

  useEffect(() => {
    document.body.style.overflow = lightboxOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [lightboxOpen]);

  if (loading) {
    return (
      <div className="min-h-screen bg-ivory">
        <Header />
        <div className="mx-auto max-w-6xl px-5 py-12">
          <div className="mb-6 h-4 w-28 rounded bg-sand/50" />
          <div className="grid animate-pulse gap-10 lg:grid-cols-5">
            <div className="lg:col-span-3 space-y-3">
              <div className="aspect-[3/4] rounded-2xl bg-sand/40" />
            </div>
            <div className="lg:col-span-2 space-y-4">
              <div className="h-10 w-56 rounded bg-sand/40" />
              <div className="h-5 w-40 rounded bg-sand/40" />
              <div className="h-24 w-full rounded-xl bg-sand/40" />
              <div className="h-32 w-full rounded bg-sand/40" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !data?.companion) {
    return (
      <div className="min-h-screen bg-ivory">
        <Header />
        <div className="mx-auto max-w-5xl px-5 py-24 text-center">
          <h2 className="text-2xl font-semibold text-espresso">Perfil no encontrado</h2>
          <p className="mt-2 text-warm-gray">Este perfil puede haber sido eliminado.</p>
          <Link
            href="/"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-espresso px-5 py-2.5 text-sm font-medium text-ivory transition hover:bg-charcoal"
          >
            ← Volver a explorar
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
    <div className="min-h-screen bg-ivory">
      <Header />

      <div className="mx-auto max-w-6xl px-5 py-8">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-1.5 text-sm font-medium text-warm-gray transition hover:text-espresso"
        >
          ← Volver a explorar
        </Link>

        <div className="grid gap-10 lg:grid-cols-5">
          {/* Galería — 3 cols */}
          <div className="lg:col-span-3 space-y-3">
            <div
              className="relative aspect-[3/4] cursor-zoom-in overflow-hidden rounded-2xl bg-cream"
              onClick={() => setLightboxOpen(true)}
            >
              {currentImage && (
                <img
                  src={currentImage.fullUrl}
                  alt={c.name}
                  className="h-full w-full object-cover transition-transform duration-500 hover:scale-[1.02]"
                />
              )}

              <div className="absolute top-4 left-4 flex gap-2">
                {c.featured && (
                  <span className="rounded-full bg-gold px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-white">
                    Destacada
                  </span>
                )}
                {c.verified && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-espresso backdrop-blur-sm">
                    <VerifiedBadgeIcon className="h-3 w-3 text-gold" />
                    Verificada
                  </span>
                )}
              </div>

              {images.length > 1 && (
                <>
                  <div className="absolute bottom-4 right-4 rounded-full bg-white/80 px-3 py-1 text-xs font-medium text-espresso backdrop-blur-sm">
                    {selectedImage + 1} / {images.length}
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); setSelectedImage((i) => (i - 1 + images.length) % images.length); }}
                    className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 text-espresso backdrop-blur-sm transition hover:bg-white"
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); setSelectedImage((i) => (i + 1) % images.length); }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 text-espresso backdrop-blur-sm transition hover:bg-white"
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                  </button>
                </>
              )}
            </div>

            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {images.map((img: CompanionImage, i: number) => (
                  <button
                    key={img.id}
                    onClick={() => setSelectedImage(i)}
                    className={`h-20 w-16 flex-shrink-0 overflow-hidden rounded-lg transition-all ${
                      i === selectedImage
                        ? "ring-2 ring-gold ring-offset-2 ring-offset-ivory"
                        : "opacity-50 hover:opacity-100"
                    }`}
                  >
                    <img src={img.thumbUrl} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Detalles — 2 cols */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-espresso">
                {c.name}, <span className="text-warm-gray">{c.age}</span>
              </h1>
              {c.tagline && (
                <p className="mt-1 text-lg text-warm-gray">{c.tagline}</p>
              )}
              <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
                <span className="flex items-center gap-1 text-warm-gray">
                  <LocationPinIcon className="h-4 w-4" />
                  {c.city}{c.region ? `, ${c.region}` : ""}
                </span>
                <span className="flex items-center gap-1">
                  <span className="text-gold">★</span>
                  <span className="text-charcoal">{c.rating.toFixed(1)}</span>
                  <span className="text-warm-gray">({c.reviewCount} reseñas)</span>
                </span>
                {c.languages?.length > 0 && (
                  <>
                    <span className="text-sand">|</span>
                    <span className="text-warm-gray">{c.languages.join(", ")}</span>
                  </>
                )}
              </div>
            </div>

            {c.tags?.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {c.tags.map((tag: string) => (
                  <span key={tag} className="rounded-full bg-gold/10 px-3 py-1 text-sm font-medium text-gold">#{tag}</span>
                ))}
              </div>
            )}

            {/* Tarjeta de precio */}
            <div className="rounded-xl border border-sand bg-white p-5">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-warm-gray">Desde</span>
                  <p className="text-3xl font-semibold text-espresso">{priceDisplay ?? "Contactar"}</p>
                </div>
                {c.availability && (
                  <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700">{c.availability}</span>
                )}
              </div>
              {/* TODO: Implement WhatsApp contact — needs phone number field on Companion */}
              <button className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] py-3.5 text-sm font-semibold text-white transition-colors hover:bg-[#1da851] active:scale-[0.98]">
                <WhatsAppIcon className="h-5 w-5" />
                Contactar a {c.name}
              </button>
            </div>

            {c.bio && (
              <div>
                <h3 className="mb-2 text-[10px] font-semibold uppercase tracking-[0.15em] text-warm-gray">Sobre mí</h3>
                <p className="leading-relaxed text-charcoal">{c.bio}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              {(
                [
                  ["Etnia", c.ethnicity],
                  ["Contextura", c.bodyType],
                  ["Cabello", c.hairColor],
                  ["Ojos", c.eyeColor],
                  ["Estatura", c.height ? `${c.height} cm` : null],
                  ["País", c.country],
                ] as [string, string | null][]
              )
                .filter(([, v]) => v)
                .map(([label, value]) => (
                  <div key={label} className="rounded-lg border border-sand/80 bg-white p-3">
                    <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-warm-gray">{label}</span>
                    <p className="text-sm font-medium text-espresso">{value}</p>
                  </div>
                ))}
            </div>

            {c.services?.length > 0 && (
              <div>
                <h3 className="mb-2 text-[10px] font-semibold uppercase tracking-[0.15em] text-warm-gray">Servicios</h3>
                <div className="flex flex-wrap gap-2">
                  {c.services.map((svc: string) => (
                    <span key={svc} className="rounded-full border border-gold/30 bg-gold/5 px-3 py-1 text-sm text-charcoal">{svc}</span>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* Pie de página */}
      <footer className="mt-12 border-t border-sand/60 bg-white">
        <div className="mx-auto max-w-7xl px-5 py-8">
          <p className="text-center text-xs text-warm-gray">Todas las acompañantes son independientes. Debes ser mayor de 18 años para usar este servicio.</p>
        </div>
      </footer>

      {/* Lightbox */}
      {lightboxOpen && currentImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-espresso/95 backdrop-blur-sm" onClick={() => setLightboxOpen(false)}>
          <button onClick={() => setLightboxOpen(false)} className="absolute top-4 right-4 z-10 rounded-full bg-white/10 p-2 text-white transition hover:bg-white/20">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
          <div className="absolute top-4 left-4 text-sm text-white/60">{selectedImage + 1} / {images.length}</div>
          <img src={currentImage.fullUrl} alt={c.name} onClick={(e) => e.stopPropagation()} className="max-h-[90vh] max-w-[90vw] rounded-lg object-contain" />
          {images.length > 1 && (
            <>
              <button onClick={(e) => { e.stopPropagation(); setSelectedImage((i) => (i - 1 + images.length) % images.length); }} className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white transition hover:bg-white/20">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              </button>
              <button onClick={(e) => { e.stopPropagation(); setSelectedImage((i) => (i + 1) % images.length); }} className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white transition hover:bg-white/20">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

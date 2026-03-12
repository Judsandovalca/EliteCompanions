"use client";

import { useQuery, useMutation } from "@apollo/client/react";
import Link from "next/link";
import { useState } from "react";
import { GET_MY_COMPANIONS, TOGGLE_COMPANION_STATUS } from "@/lib/queries";
import { useAuth } from "@/lib/auth";
import { Header } from "@/components/Header";
import { AuthModal } from "@/components/AuthModal";
import { UserIcon } from "@/components/icons/UserIcon";
import { EditIcon } from "@/components/icons/EditIcon";
import { ImagePlaceholderIcon } from "@/components/icons/ImagePlaceholderIcon";
import type { MyCompanionsData, ToggleCompanionStatusData, Companion } from "@/lib/types";

type AuthMode = "login" | "register";

export default function MiPerfilPage() {
  const { user, loading: authLoading } = useAuth();
  const [authModal, setAuthModal] = useState<AuthMode | null>(null);

  const { data, loading, error } = useQuery<MyCompanionsData>(GET_MY_COMPANIONS, {
    skip: !user,
  });

  const [toggleStatus, { loading: toggling }] = useMutation<ToggleCompanionStatusData>(
    TOGGLE_COMPANION_STATUS,
    {
      refetchQueries: [{ query: GET_MY_COMPANIONS }],
    }
  );

  const handleToggle = async (id: string) => {
    await toggleStatus({ variables: { id } });
  };

  const companions = data?.myCompanions ?? [];
  const activeCount = companions.filter((c) => c.status === "ACTIVE").length;
  const inactiveCount = companions.filter((c) => c.status === "INACTIVE").length;

  // Auth loading
  if (authLoading) {
    return (
      <div className="min-h-screen bg-ivory">
        <Header />
        <div className="mx-auto max-w-5xl px-5 py-12">
          <div className="animate-pulse space-y-6">
            <div className="h-8 w-48 rounded bg-sand/40" />
            <div className="h-32 rounded-xl bg-sand/40" />
            <div className="grid grid-cols-3 gap-4">
              <div className="h-20 rounded-xl bg-sand/40" />
              <div className="h-20 rounded-xl bg-sand/40" />
              <div className="h-20 rounded-xl bg-sand/40" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-ivory">
        <Header />
        <div className="mx-auto max-w-md px-5 py-24 text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-cream">
            <UserIcon className="h-8 w-8 text-warm-gray" />
          </div>
          <h2 className="text-2xl font-semibold text-espresso">Inicia sesión para ver tu perfil</h2>
          <p className="mt-2 text-warm-gray">
            Accede a tu cuenta para administrar tus publicaciones.
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <button
              onClick={() => setAuthModal("login")}
              className="rounded-full border border-charcoal/15 px-6 py-2.5 text-sm font-medium text-charcoal transition-all hover:border-charcoal hover:bg-charcoal hover:text-ivory"
            >
              Iniciar Sesión
            </button>
            <button
              onClick={() => setAuthModal("register")}
              className="rounded-full bg-espresso px-6 py-2.5 text-sm font-medium text-ivory transition-all hover:bg-charcoal"
            >
              Registrarse
            </button>
          </div>
        </div>
        {authModal && (
          <AuthModal
            mode={authModal}
            onClose={() => setAuthModal(null)}
            onSwitchMode={() => setAuthModal(authModal === "login" ? "register" : "login")}
          />
        )}
      </div>
    );
  }

  const memberSince = new Date(Number(user.createdAt)).toLocaleDateString("es-ES", {
    year: "numeric",
    month: "long",
  });

  return (
    <div className="min-h-screen bg-ivory">
      <Header />

      <div className="mx-auto max-w-5xl px-5 py-8">
        {/* User info card */}
        <div className="mb-8 rounded-xl border border-sand bg-white p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-espresso text-xl font-bold text-ivory">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-espresso">{user.name}</h1>
              <p className="text-sm text-warm-gray">{user.email}</p>
              <p className="mt-0.5 text-xs text-warm-gray/70">Miembro desde {memberSince}</p>
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div className="mb-8 grid grid-cols-3 gap-4">
          <div className="rounded-xl border border-sand bg-white p-4 text-center">
            <p className="text-2xl font-semibold text-espresso">{companions.length}</p>
            <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-warm-gray">Publicaciones</p>
          </div>
          <div className="rounded-xl border border-sand bg-white p-4 text-center">
            <p className="text-2xl font-semibold text-green-600">{activeCount}</p>
            <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-warm-gray">Activas</p>
          </div>
          <div className="rounded-xl border border-sand bg-white p-4 text-center">
            <p className="text-2xl font-semibold text-warm-gray">{inactiveCount}</p>
            <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-warm-gray">Inactivas</p>
          </div>
        </div>

        {/* Section title */}
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-espresso">Mis Publicaciones</h2>
          <Link
            href="/publish"
            className="inline-flex items-center gap-1.5 rounded-full bg-espresso px-4 py-2 text-xs font-medium text-ivory transition hover:bg-charcoal"
          >
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Agregar Publicación
          </Link>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse rounded-xl border border-sand bg-white p-4">
                <div className="mb-3 aspect-[4/5] rounded-lg bg-sand/40" />
                <div className="h-5 w-32 rounded bg-sand/40" />
                <div className="mt-2 h-4 w-20 rounded bg-sand/40" />
              </div>
            ))}
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
            <p className="text-sm text-red-700">Error al cargar tus publicaciones. Intenta de nuevo.</p>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && companions.length === 0 && (
          <div className="rounded-xl border border-sand bg-white py-16 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-cream">
              <EditIcon className="h-8 w-8 text-warm-gray" />
            </div>
            <h3 className="text-lg font-semibold text-espresso">No tienes publicaciones</h3>
            <p className="mt-1 text-sm text-warm-gray">Agrega tu primera publicación para comenzar a recibir visitas.</p>
            <Link
              href="/publish"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-espresso px-5 py-2.5 text-sm font-medium text-ivory transition hover:bg-charcoal"
            >
              Agregar mi primera publicación
            </Link>
          </div>
        )}

        {/* Companions grid */}
        {!loading && !error && companions.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {companions.map((companion: Companion) => (
              <CompanionProfileCard
                key={companion.id}
                companion={companion}
                onToggle={handleToggle}
                toggling={toggling}
              />
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="mt-12 border-t border-sand/60 bg-white">
        <div className="mx-auto max-w-7xl px-5 py-8">
          <p className="text-center text-xs text-warm-gray">
            Todas las acompañantes son independientes. Debes ser mayor de 18 años para usar este servicio.
          </p>
        </div>
      </footer>
    </div>
  );
}

function CompanionProfileCard({
  companion,
  onToggle,
  toggling,
}: {
  companion: Companion;
  onToggle: (id: string) => void;
  toggling: boolean;
}) {
  const c = companion;
  const isSuspended = c.status === "SUSPENDED";
  const isActive = c.status === "ACTIVE";

  const statusConfig = {
    ACTIVE: { label: "Activo", bg: "bg-green-50", text: "text-green-700", dot: "bg-green-500" },
    INACTIVE: { label: "Inactivo", bg: "bg-gray-50", text: "text-gray-600", dot: "bg-gray-400" },
    SUSPENDED: { label: "Suspendido", bg: "bg-red-50", text: "text-red-700", dot: "bg-red-500" },
  } as const;

  const status = statusConfig[c.status as keyof typeof statusConfig] ?? statusConfig.INACTIVE;

  return (
    <div className="overflow-hidden rounded-xl border border-sand bg-white transition-shadow hover:shadow-md">
      {/* Image */}
      <div className="relative aspect-[4/5] bg-cream">
        {c.primaryImage ? (
          <img
            src={c.primaryImage.mediumUrl}
            alt={c.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <ImagePlaceholderIcon className="h-12 w-12 text-sand" />
          </div>
        )}

        {/* Status badge */}
        <div className="absolute top-3 left-3">
          <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider ${status.bg} ${status.text}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
            {status.label}
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="text-base font-semibold text-espresso">{c.name}, {c.age}</h3>
        <p className="mt-0.5 text-xs text-warm-gray">{c.city}</p>
        {c.tagline && (
          <p className="mt-1 line-clamp-1 text-sm text-charcoal/70">{c.tagline}</p>
        )}

        {c.tags?.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {c.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-gold/10 px-2 py-0.5 text-[10px] font-medium text-gold"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        <div className="mt-3 flex items-center gap-2 text-xs text-warm-gray">
          <span className="flex items-center gap-0.5">
            <span className="text-gold">★</span> {c.rating.toFixed(1)}
          </span>
          <span>·</span>
          <span>{c.reviewCount} reseñas</span>
          {c.pricePerHour && (
            <>
              <span>·</span>
              <span className="font-medium text-charcoal">
                {c.currency === "USD" ? "$" : c.currency}{(c.pricePerHour / 100).toFixed(0)}/hr
              </span>
            </>
          )}
        </div>

        {/* Actions */}
        <div className="mt-4 flex gap-2">
          <Link
            href={`/companion/${c.id}`}
            className="flex-1 rounded-lg border border-sand py-2 text-center text-xs font-medium text-charcoal transition hover:border-charcoal hover:bg-cream"
          >
            Ver Publicación
          </Link>
          <button
            onClick={() => onToggle(c.id)}
            disabled={toggling || isSuspended}
            className={`flex-1 rounded-lg py-2 text-xs font-medium transition disabled:opacity-50 ${
              isActive
                ? "border border-sand text-warm-gray hover:border-charcoal hover:bg-cream"
                : "bg-espresso text-ivory hover:bg-charcoal"
            }`}
          >
            {isSuspended ? "Suspendido" : isActive ? "Desactivar" : "Activar"}
          </button>
        </div>
      </div>
    </div>
  );
}

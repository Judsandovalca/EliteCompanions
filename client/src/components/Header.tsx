"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { AuthModal } from "./AuthModal";
import { HeartIcon } from "./icons/HeartIcon";
import { UserIcon } from "./icons/UserIcon";
import { EditIcon } from "./icons/EditIcon";
import { LocationPinIcon } from "./icons/LocationPinIcon";
import { SearchIcon } from "./icons/SearchIcon";

type AuthMode = "login" | "register";

const CATEGORIES = ["Escorts", "Masajes", "Webcam", "Trans", "Hombres"];
const CITIES = ["Bogotá", "Medellín", "Cali", "Miami", "New York", "Los Angeles", "Las Vegas", "Houston", "Dallas"];

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [authModal, setAuthModal] = useState<AuthMode | null>(null);
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  const [category, setCategory] = useState("Escorts");
  const [city, setCity] = useState("");
  const [searchText, setSearchText] = useState("");

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchText.trim()) params.set("q", searchText.trim());
    router.push(`/?${params.toString()}`);
  };

  const openLogin = () => {
    setAuthModal("login");
    setMobileOpen(false);
  };
  const openRegister = () => {
    setAuthModal("register");
    setMobileOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-50">
        {/* Top bar — logo + action links */}
        <div className="border-b border-sand/60 bg-ivory/80 backdrop-blur-xl">
          <div className="mx-auto flex h-14 max-w-screen-2xl items-center justify-between px-5">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-espresso">
                <span className="text-xs font-bold text-ivory">C</span>
              </div>
              <span className="text-base font-semibold tracking-tight text-espresso">
                Companions
              </span>
            </Link>

            {/* Desktop action links */}
            <div className="hidden items-center gap-1 md:flex">
              <Link
                href="/favorites"
                className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-[11px] font-medium uppercase tracking-wide text-warm-gray transition-colors hover:bg-cream hover:text-espresso"
              >
                <HeartIcon className="h-4 w-4" />
                Favoritos
              </Link>
              <Link
                href="/mi-perfil"
                className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-[11px] font-medium uppercase tracking-wide text-warm-gray transition-colors hover:bg-cream hover:text-espresso"
              >
                <UserIcon className="h-4 w-4" />
                Mi Perfil
              </Link>
              <Link
                href="/publish"
                className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-[11px] font-medium uppercase tracking-wide text-warm-gray transition-colors hover:bg-cream hover:text-espresso"
              >
                <EditIcon className="h-4 w-4" />
                Publicar Perfil
              </Link>

              <div className="mx-1.5 h-5 w-px bg-sand/80" />

              <button className="flex items-center gap-1.5 rounded-full border border-sand/80 px-3 py-1.5 text-[11px] font-medium text-charcoal transition-all hover:border-charcoal/30 hover:bg-cream">
                <LocationPinIcon className="h-3.5 w-3.5 text-warm-gray" />
                Colombia
              </button>

              <div className="mx-1.5 h-5 w-px bg-sand/80" />

              {loading ? (
                <div className="h-8 w-24 animate-pulse rounded-full bg-sand/50" />
              ) : user ? (
                <>
                  <span className="text-sm font-medium text-charcoal">{user.name}</span>
                  <button
                    onClick={logout}
                    className="rounded-full border border-charcoal/15 px-4 py-1.5 text-[11px] font-medium text-charcoal transition-all hover:border-charcoal hover:bg-charcoal hover:text-ivory"
                  >
                    Cerrar Sesión
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={openLogin}
                    className="rounded-full border border-charcoal/15 px-4 py-1.5 text-[11px] font-medium text-charcoal transition-all hover:border-charcoal hover:bg-charcoal hover:text-ivory"
                  >
                    Iniciar Sesión
                  </button>
                  <button
                    onClick={openRegister}
                    className="rounded-full bg-espresso px-4 py-1.5 text-[11px] font-medium text-white transition-all hover:bg-charcoal"
                  >
                    Registrarse
                  </button>
                </>
              )}
            </div>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="flex flex-col gap-1.5 md:hidden p-2"
              aria-label="Abrir menú"
            >
              <span className={`h-0.5 w-5 bg-espresso transition-all ${mobileOpen ? "translate-y-2 rotate-45" : ""}`} />
              <span className={`h-0.5 w-5 bg-espresso transition-all ${mobileOpen ? "opacity-0" : ""}`} />
              <span className={`h-0.5 w-5 bg-espresso transition-all ${mobileOpen ? "-translate-y-2 -rotate-45" : ""}`} />
            </button>
          </div>
        </div>

        {/* Search strip — inline filter bar like mileroticos */}
        <div className="border-b border-sand/40 bg-cream/60 backdrop-blur-md">
          <div className="mx-auto flex max-w-screen-2xl items-center gap-2 px-5 py-2">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="hidden h-9 rounded-lg border border-sand/80 bg-white px-3 text-sm text-charcoal outline-none transition focus:border-gold sm:block"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>

            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="hidden h-9 rounded-lg border border-sand/80 bg-white px-3 text-sm text-charcoal outline-none transition focus:border-gold sm:block"
            >
              <option value="">Elige ciudad</option>
              {CITIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            {/* Search input */}
            <div className="relative flex-1">
              <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-warm-gray" />
              <input
                type="text"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="Buscar por nombre, servicio..."
                className="h-9 w-full rounded-lg border border-sand/80 bg-white pl-9 pr-3 text-sm text-charcoal placeholder:text-warm-gray/60 outline-none transition focus:border-gold"
              />
            </div>

            <button
              onClick={handleSearch}
              className="h-9 rounded-lg bg-espresso px-5 text-sm font-semibold text-ivory transition-colors hover:bg-charcoal active:scale-[0.97]"
            >
              Buscar
            </button>

            {/* Page nav — large screens only */}
            <div className="hidden items-center gap-1 lg:flex ml-1">
              {[
                { href: "/", label: "Explorar" },
                { href: "/categories", label: "Categorías" },
                { href: "/featured", label: "Destacadas" },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="rounded-lg px-3 py-1.5 text-[11px] font-medium uppercase tracking-wide text-warm-gray transition-colors hover:bg-white hover:text-espresso"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="border-b border-sand/60 bg-ivory px-5 py-5 md:hidden">
            {/* Mobile category/city selects */}
            <div className="mb-4 flex gap-2">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="h-9 flex-1 rounded-lg border border-sand/80 bg-white px-3 text-sm text-charcoal outline-none"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="h-9 flex-1 rounded-lg border border-sand/80 bg-white px-3 text-sm text-charcoal outline-none"
              >
                <option value="">Elige ciudad</option>
                {CITIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <nav className="flex flex-col gap-1">
              {[
                { href: "/", label: "Explorar", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
                { href: "/categories", label: "Categorías", icon: "M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" },
                { href: "/featured", label: "Destacadas", icon: "M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" },
                { href: "/favorites", label: "Favoritos", icon: "M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" },
                { href: "/dashboard", label: "Mi Perfil", icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" },
                { href: "/publish", label: "Publicar Perfil", icon: "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 rounded-lg px-2 py-2.5 text-sm font-medium text-charcoal transition-colors hover:bg-cream hover:text-gold"
                >
                  <svg className="h-5 w-5 text-warm-gray" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={link.icon} />
                  </svg>
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="mt-4 flex gap-3 border-t border-sand pt-4">
              {user ? (
                <>
                  <span className="flex-1 text-center py-2.5 text-sm font-medium text-charcoal">
                    {user.name}
                  </span>
                  <button
                    onClick={() => { logout(); setMobileOpen(false); }}
                    className="flex-1 rounded-full border border-charcoal/20 py-2.5 text-sm font-medium text-charcoal"
                  >
                    Cerrar Sesión
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={openLogin}
                    className="flex-1 rounded-full border border-charcoal/20 py-2.5 text-sm font-medium text-charcoal"
                  >
                    Iniciar Sesión
                  </button>
                  <button
                    onClick={openRegister}
                    className="flex-1 rounded-full bg-espresso py-2.5 text-sm font-medium text-ivory"
                  >
                    Registrarse
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {authModal && (
        <AuthModal
          mode={authModal}
          onClose={() => setAuthModal(null)}
          onSwitchMode={() =>
            setAuthModal(authModal === "login" ? "register" : "login")
          }
        />
      )}
    </>
  );
}

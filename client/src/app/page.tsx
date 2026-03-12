import { Header } from "@/components/Header";
import { FeaturedSection } from "@/components/FeaturedSection";
import { CompanionGrid } from "@/components/CompanionGrid";

export default function Home() {
  return (
    <div className="min-h-screen bg-ivory">
      <Header />

      {/* Destacadas */}
      <FeaturedSection />

      {/* Separador */}
      <div className="mx-auto max-w-screen-2xl px-5">
        <div className="h-px bg-gradient-to-r from-transparent via-sand to-transparent" />
      </div>

      {/* Todas las acompañantes */}
      <section className="mx-auto max-w-screen-2xl px-5 py-12">
        <div className="mb-8">
          <span className="text-[11px] font-medium uppercase tracking-[0.15em] text-warm-gray">
            Directorio
          </span>
          <h2 className="mt-1 text-xl font-semibold tracking-tight text-espresso sm:text-2xl">
            Todas las Acompañantes
          </h2>
        </div>
        <CompanionGrid />
      </section>

      {/* Pie de página */}
      <footer className="border-t border-sand/60 bg-white">
        <div className="mx-auto max-w-screen-2xl px-5 py-10">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-espresso">
                <span className="text-[8px] font-bold text-ivory">C</span>
              </div>
              <span className="text-sm font-semibold text-espresso">
                Companions
              </span>
            </div>
            <p className="text-xs text-warm-gray">
              Todas las acompañantes son independientes. Debes ser mayor de 18 años para usar este servicio.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

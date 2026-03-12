import { Header } from "@/components/Header";
import { CompanionGrid } from "@/components/CompanionGrid";

export default function Home() {
  return (
    <div className="min-h-screen">
      <Header />

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-zinc-800/50 bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-pink-900/20 via-transparent to-transparent" />
        <div className="relative mx-auto max-w-7xl px-4 py-20 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Find Your Perfect{" "}
            <span className="bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
              Companion
            </span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-zinc-400">
            Browse verified profiles, filter by your preferences, and connect
            with elite companions in your city.
          </p>
        </div>
      </section>

      {/* Main grid */}
      <main className="mx-auto max-w-7xl px-4 py-8">
        <CompanionGrid />
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-800/50 bg-zinc-950">
        <div className="mx-auto max-w-7xl px-4 py-8">
          <p className="text-center text-sm text-zinc-600">
            All companions are independent. Must be 18+ to use this service.
          </p>
        </div>
      </footer>
    </div>
  );
}

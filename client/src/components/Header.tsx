"use client";

import Link from "next/link";

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-zinc-800/50 bg-zinc-950/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-pink-500 to-purple-600">
            <span className="text-sm font-bold text-white">E</span>
          </div>
          <span className="text-lg font-bold tracking-tight text-white">
            Elite<span className="text-pink-500">Companions</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          <Link
            href="/"
            className="text-sm text-zinc-400 transition hover:text-white"
          >
            Browse
          </Link>
          <Link
            href="/categories"
            className="text-sm text-zinc-400 transition hover:text-white"
          >
            Categories
          </Link>
          <Link
            href="/featured"
            className="text-sm text-zinc-400 transition hover:text-white"
          >
            Featured
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <button className="rounded-lg border border-zinc-700 px-4 py-2 text-sm text-zinc-300 transition hover:border-pink-500 hover:text-white">
            Sign In
          </button>
          <button className="rounded-lg bg-gradient-to-r from-pink-500 to-purple-600 px-4 py-2 text-sm font-medium text-white transition hover:from-pink-600 hover:to-purple-700">
            Join
          </button>
        </div>
      </div>
    </header>
  );
}

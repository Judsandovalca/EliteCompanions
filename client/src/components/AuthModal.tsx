"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth";

interface AuthModalProps {
  mode: "login" | "register";
  onClose: () => void;
  onSwitchMode: () => void;
}

export function AuthModal({ mode, onClose, onSwitchMode }: AuthModalProps) {
  const { login, register } = useAuth();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (mode === "login") {
        await login(email, password);
      } else {
        await register(email, name, password);
      }
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ha ocurrido un error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-md rounded-2xl bg-ivory p-8 shadow-2xl mx-4">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-warm-gray hover:text-espresso transition-colors"
          aria-label="Cerrar"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M15 5L5 15M5 5l10 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>

        <h2 className="mb-1 text-2xl font-semibold text-espresso">
          {mode === "login" ? "Iniciar Sesión" : "Crear Cuenta"}
        </h2>
        <p className="mb-6 text-sm text-warm-gray">
          {mode === "login"
            ? "Ingresa tus credenciales para continuar"
            : "Completa tus datos para registrarte"}
        </p>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600 border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {mode === "register" && (
            <div>
              <label htmlFor="name" className="mb-1 block text-sm font-medium text-charcoal">
                Nombre
              </label>
              <input
                id="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg border border-sand bg-white px-4 py-2.5 text-sm text-charcoal placeholder-warm-gray/60 outline-none transition-colors focus:border-gold focus:ring-1 focus:ring-gold"
                placeholder="Tu nombre"
              />
            </div>
          )}

          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-charcoal">
              Correo Electrónico
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-sand bg-white px-4 py-2.5 text-sm text-charcoal placeholder-warm-gray/60 outline-none transition-colors focus:border-gold focus:ring-1 focus:ring-gold"
              placeholder="tu@email.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium text-charcoal">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-sand bg-white px-4 py-2.5 text-sm text-charcoal placeholder-warm-gray/60 outline-none transition-colors focus:border-gold focus:ring-1 focus:ring-gold"
              placeholder="Mínimo 8 caracteres"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full rounded-full bg-espresso py-3 text-sm font-medium text-white transition-all hover:bg-charcoal disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading
              ? "Cargando..."
              : mode === "login"
              ? "Iniciar Sesión"
              : "Registrarse"}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-warm-gray">
          {mode === "login" ? "¿No tienes cuenta?" : "¿Ya tienes cuenta?"}{" "}
          <button
            onClick={onSwitchMode}
            className="font-medium text-gold hover:text-espresso transition-colors"
          >
            {mode === "login" ? "Regístrate" : "Inicia Sesión"}
          </button>
        </p>
      </div>
    </div>
  );
}

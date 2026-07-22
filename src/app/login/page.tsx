"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

const VALID_EMAIL = "orlando@gmail.com";
const VALID_PASSWORD = "123456";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const email = String(form.get("email") || "").trim().toLowerCase();
    const password = String(form.get("password") || "");

    if (email === VALID_EMAIL && password === VALID_PASSWORD) {
      router.push("/dashboard");
      return;
    }

    setError("Email ou senha inválidos.");
    setLoading(false);
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[hsl(160_40%_97%)] px-4 py-10">
      <div className="mb-8 text-center">
        <h1 className="font-display text-3xl font-bold tracking-tight text-foreground">
          RD Digital
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Painel de disparos e gestão de leads
        </p>
      </div>

      <div className="w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-micro sm:p-8">
        <div className="mb-6">
          <h2 className="font-display text-xl font-semibold text-foreground">
            Entrar
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Acesse sua conta para gerenciar disparos
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label
              htmlFor="email"
              className="text-sm font-medium text-foreground"
            >
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="seu@email.com"
              required
              className="flex h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none ring-ring transition-shadow placeholder:text-muted-foreground focus:ring-2"
            />
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="password"
              className="text-sm font-medium text-foreground"
            >
              Senha
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              required
              className="flex h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none ring-ring transition-shadow placeholder:text-muted-foreground focus:ring-2"
            />
          </div>

          {error ? (
            <p className="text-sm text-destructive">{error}</p>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="inline-flex h-10 w-full items-center justify-center rounded-lg bg-primary text-sm font-medium text-primary-foreground shadow-micro transition-opacity hover:opacity-90 disabled:opacity-70"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </div>

      <p className="mt-8 text-center text-sm text-muted-foreground">
        Problemas com acesso? Entre em contato com o suporte.
      </p>
    </div>
  );
}

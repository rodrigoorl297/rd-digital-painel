"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ChevronDown, Plus } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { PaginationFooter, StatusBadge } from "@/components/ui";
import {
  listDisparos,
  subscribeDisparos,
  type DisparoRecord,
  type DisparoStatus,
} from "@/lib/disparos-store";

const statusPills = [
  { key: "", label: "Todos", href: "/disparos" },
  { key: "recebido", label: "Recebido", href: "/disparos?status=recebido" },
  {
    key: "configurando",
    label: "Configurando",
    href: "/disparos?status=configurando",
  },
  {
    key: "disparando",
    label: "Disparando",
    href: "/disparos?status=disparando",
  },
  { key: "realizado", label: "Realizado", href: "/disparos?status=realizado" },
  { key: "cancelado", label: "Cancelado", href: "/disparos?status=cancelado" },
] as const;

function statusVariant(status: DisparoStatus) {
  if (status === "Realizado") return "success" as const;
  if (status === "Cancelado") return "muted" as const;
  if (status === "Disparando") return "default" as const;
  return "muted" as const;
}

function matchesPeriod(d: DisparoRecord, period: string) {
  if (!period) return true;
  const created = new Date(d.createdAt);
  if (Number.isNaN(created.getTime())) return true;
  const now = new Date();
  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  );
  const startOfYesterday = new Date(startOfToday);
  startOfYesterday.setDate(startOfYesterday.getDate() - 1);
  const weekAgo = new Date(startOfToday);
  weekAgo.setDate(weekAgo.getDate() - 7);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  switch (period) {
    case "hoje":
      return created >= startOfToday;
    case "ontem":
      return created >= startOfYesterday && created < startOfToday;
    case "semana":
    case "7d":
      return created >= weekAgo;
    case "mes":
      return created >= monthStart;
    default:
      return true;
  }
}

export default function DisparosPage() {
  const searchParams = useSearchParams();
  const statusParam = (searchParams.get("status") || "").toLowerCase();
  const [search, setSearch] = useState("");
  const [period, setPeriod] = useState("");
  const [items, setItems] = useState<DisparoRecord[]>([]);

  useEffect(() => {
    const refresh = () => setItems(listDisparos());
    refresh();
    return subscribeDisparos(refresh);
  }, []);

  const counts = useMemo(() => {
    return {
      "": items.length,
      recebido: items.filter((d) => d.status === "Recebido").length,
      configurando: items.filter((d) => d.status === "Configurando").length,
      disparando: items.filter((d) => d.status === "Disparando").length,
      realizado: items.filter((d) => d.status === "Realizado").length,
      cancelado: items.filter((d) => d.status === "Cancelado").length,
    } as Record<string, number>;
  }, [items]);

  const filtered = useMemo(() => {
    return items.filter((d) => {
      const matchStatus =
        !statusParam || d.status.toLowerCase() === statusParam;
      const matchSearch =
        !search || d.name.toLowerCase().includes(search.toLowerCase());
      const matchPeriod = matchesPeriod(d, period);
      return matchStatus && matchSearch && matchPeriod;
    });
  }, [items, statusParam, search, period]);

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Meus Disparos</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Acompanhe o status de todos os seus disparos
            </p>
          </div>
          <Link
            href="/disparos/novo"
            className="inline-flex h-10 items-center justify-center whitespace-nowrap rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-micro transition-all duration-150 hover:bg-primary/90"
          >
            <Plus className="mr-2 h-4 w-4" />
            Novo Disparo
          </Link>
        </div>

        <div className="flex flex-wrap gap-2">
          {statusPills.map((pill) => {
            const active = statusParam === pill.key;
            const count = counts[pill.key] ?? 0;
            return (
              <Link
                key={pill.key || "todos"}
                href={pill.href}
                className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  active
                    ? "bg-primary text-primary-foreground"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {pill.label}
                <span className="ml-1.5 tabular-nums opacity-70">{count}</span>
              </Link>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative shrink-0">
            <select
              aria-label="Período do filtro"
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="h-9 cursor-pointer appearance-none rounded-md border border-input bg-background py-0 pl-3 pr-8 text-sm font-medium text-foreground shadow-micro transition-colors hover:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="">Selecionar período</option>
              <option value="hoje">Hoje</option>
              <option value="ontem">Ontem</option>
              <option value="semana">Essa semana</option>
              <option value="7d">Últimos 7D</option>
              <option value="mes">Mês</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          </div>
          <input
            type="search"
            id="dispatch-name-filter"
            aria-label="Buscar por nome do disparo…"
            placeholder="Buscar por nome do disparo…"
            autoComplete="off"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 sm:max-w-xs"
          />
        </div>

        <div className="rounded-lg border border-border bg-card text-card-foreground shadow-micro">
          <div className="divide-y">
            {filtered.length === 0 ? (
              <div className="px-4 py-12 text-center">
                <p className="text-sm text-muted-foreground">
                  {items.length === 0
                    ? "Nenhum disparo ainda. Crie o primeiro para começar."
                    : "Nenhum disparo encontrado com esses filtros."}
                </p>
                {items.length === 0 ? (
                  <Link
                    href="/disparos/novo"
                    className="mt-3 inline-flex text-sm font-semibold text-primary hover:opacity-90"
                  >
                    + Novo Disparo
                  </Link>
                ) : null}
              </div>
            ) : (
              filtered.map((d) => (
                <Link
                  key={d.id}
                  href={`/disparos/${d.id}`}
                  className="flex items-center justify-between gap-3 p-4 transition-colors hover:bg-gray-50"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{d.name}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                      <span className="text-xs text-muted-foreground">
                        {d.date}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        · {d.product}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        · {d.metric}
                      </span>
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
                    {d.draft ? (
                      <span className="inline-flex items-center rounded-full border border-transparent bg-secondary px-2.5 py-0.5 text-[10px] font-semibold text-secondary-foreground">
                        Rascunho
                      </span>
                    ) : null}
                    <StatusBadge
                      status={d.status}
                      variant={statusVariant(d.status)}
                    />
                  </div>
                </Link>
              ))
            )}
          </div>
          <PaginationFooter totalRecords={filtered.length} />
        </div>
      </div>
    </AppShell>
  );
}

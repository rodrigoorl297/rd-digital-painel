"use client";

import { useEffect, useState } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  Building2,
  ChevronDown,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { PaginationFooter } from "@/components/ui";
import { creditTransactions, credits, formatNumber } from "@/lib/data";
import {
  listEmpresas,
  subscribeEmpresas,
  type Empresa,
} from "@/lib/empresas-store";

export default function CreditosPage() {
  const [period, setPeriod] = useState("");
  const [companies, setCompanies] = useState<Empresa[]>([]);

  useEffect(() => {
    const refresh = () => setCompanies(listEmpresas());
    refresh();
    return subscribeEmpresas(refresh);
  }, []);

  return (
    <AppShell>
      <div className="mx-auto max-w-full space-y-6">
        <div className="min-w-0">
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
            Créditos
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Acompanhe seu saldo e histórico de transações
          </p>
        </div>

        <div className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Saldo por empresa
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="min-w-0 rounded-lg border border-border bg-card text-card-foreground shadow-micro">
              <div className="flex flex-col space-y-1.5 p-5 pb-2">
                <h3 className="font-display flex items-center gap-2 text-sm font-medium tracking-tight text-foreground">
                  <Building2 className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <span className="truncate">
                    {companies[0]?.name ?? "—"}
                  </span>
                </h3>
              </div>
              <div className="space-y-2 p-5 pt-0">
                <div>
                  <p className="break-words text-2xl font-bold tabular-nums text-primary">
                    {formatNumber(credits.balance)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    créditos disponíveis
                  </p>
                </div>
                <div className="flex gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <TrendingUp className="h-3 w-3 text-green-600" />
                    {formatNumber(credits.purchased)} comprados
                  </span>
                  <span className="flex items-center gap-1">
                    <TrendingDown className="h-3 w-3 text-orange-600" />
                    {formatNumber(credits.used)} usados
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <div className="min-w-0 rounded-lg border border-border bg-card text-card-foreground shadow-micro">
            <div className="flex flex-col space-y-1.5 p-5 pb-1">
              <h3 className="font-display flex items-center gap-2 text-xs font-medium tracking-tight text-muted-foreground">
                <TrendingUp className="h-3.5 w-3.5 shrink-0 text-green-600" />
                Total Comprado
              </h3>
            </div>
            <div className="p-5 pt-0">
              <p className="text-lg font-bold tabular-nums text-green-700">
                {formatNumber(credits.purchased)}
              </p>
            </div>
          </div>
          <div className="min-w-0 rounded-lg border border-border bg-card text-card-foreground shadow-micro">
            <div className="flex flex-col space-y-1.5 p-5 pb-1">
              <h3 className="font-display flex items-center gap-2 text-xs font-medium tracking-tight text-muted-foreground">
                <TrendingDown className="h-3.5 w-3.5 shrink-0 text-orange-600" />
                Total Utilizado
              </h3>
            </div>
            <div className="p-5 pt-0">
              <p className="text-lg font-bold tabular-nums text-orange-700">
                {formatNumber(credits.used)}
              </p>
            </div>
          </div>
        </div>

        <div className="min-w-0 overflow-hidden rounded-lg border border-border bg-card text-card-foreground shadow-micro">
          <div className="flex flex-col gap-4 space-y-0 p-5 pb-2 sm:pb-4">
            <h3 className="font-display text-base font-semibold tracking-tight text-foreground">
              Histórico de Transações
            </h3>
            <div className="relative w-fit shrink-0">
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
                <option value="__custom__">Personalizado</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            </div>
          </div>

          <div className="divide-y">
            {creditTransactions.length === 0 ? (
              <p className="p-8 text-center text-sm text-muted-foreground">
                Nenhuma transação ainda.
              </p>
            ) : (
              creditTransactions.map((tx) => {
              const positive = tx.amount >= 0;
              return (
                <div
                  key={tx.id}
                  className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
                >
                  <div className="flex min-w-0 flex-1 items-start gap-3">
                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                        positive ? "bg-green-100" : "bg-orange-100"
                      }`}
                    >
                      {positive ? (
                        <ArrowUpRight className="h-4 w-4 text-green-600" />
                      ) : (
                        <ArrowDownRight className="h-4 w-4 text-orange-600" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-1 break-words text-sm font-medium leading-snug">
                        {tx.name}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {tx.company} · {tx.date}
                      </p>
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-row items-baseline justify-between gap-4 border-t border-border pt-3 sm:flex-col sm:items-end sm:border-0 sm:pt-0">
                    <p
                      className={`text-base font-semibold tabular-nums sm:text-right sm:text-sm ${
                        positive ? "text-green-700" : "text-orange-700"
                      }`}
                    >
                      {positive ? "+" : "-"}
                      {formatNumber(Math.abs(tx.amount))}
                    </p>
                  </div>
                </div>
              );
              })
            )}
          </div>

          <PaginationFooter totalRecords={creditTransactions.length} />
        </div>
      </div>
    </AppShell>
  );
}

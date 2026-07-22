"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Activity,
  Building2,
  CalendarDays,
  ChartColumn,
  CheckCircle2,
  ChevronRight,
  Clock,
  CreditCard,
  Plus,
  Send,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { StatusBadge } from "@/components/ui";
import { credits, formatNumber, user } from "@/lib/data";
import {
  listDisparos,
  subscribeDisparos,
  type DisparoRecord,
} from "@/lib/disparos-store";
import {
  listEmpresas,
  subscribeEmpresas,
  type Empresa,
} from "@/lib/empresas-store";

const periodFilters = ["Todos", "Hoje", "Últimos 7 dias", "Personalizado"] as const;

export default function DashboardPage() {
  const [period, setPeriod] = useState<(typeof periodFilters)[number]>("Todos");
  const [companyId, setCompanyId] = useState("");
  const [disparoId, setDisparoId] = useState("");
  const [disparos, setDisparos] = useState<DisparoRecord[]>([]);
  const [companies, setCompanies] = useState<Empresa[]>([]);

  useEffect(() => {
    const refresh = () => setDisparos(listDisparos());
    refresh();
    return subscribeDisparos(refresh);
  }, []);

  useEffect(() => {
    const refresh = () => setCompanies(listEmpresas());
    refresh();
    return subscribeEmpresas(refresh);
  }, []);

  const recebidos = disparos.filter((d) => d.status === "Recebido").length;
  const realizados = disparos.filter((d) => d.status === "Realizado").length;

  return (
    <AppShell>
      <div className="space-y-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="font-display text-[28px] font-bold tracking-tight text-foreground">
              Olá, {user.firstName}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Bem-vindo ao seu painel de disparos
            </p>
          </div>
          <Link
            href="/disparos/novo"
            className="inline-flex h-10 shrink-0 items-center justify-center whitespace-nowrap rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-micro transition-all duration-150 hover:bg-primary/90"
          >
            <Plus className="mr-2 h-4 w-4" />
            Novo disparo
          </Link>
        </div>

        <div className="flex flex-wrap items-end gap-4 rounded-lg border border-border bg-card px-4 py-3 shadow-micro sm:px-5 sm:py-4">
          <div className="min-w-[200px] flex-1 space-y-1.5">
            <label
              htmlFor="dashboard-company"
              className="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
            >
              Empresa
            </label>
            <select
              id="dashboard-company"
              aria-label="Empresa"
              value={companyId}
              onChange={(e) => setCompanyId(e.target.value)}
              className="flex h-10 w-full max-w-md rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm"
            >
              <option value="">Todas as empresas</option>
              {companies.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <section>
          <h2 className="font-display mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Resumo da conta
          </h2>
          <div className="grid min-w-0 grid-cols-2 gap-4 lg:grid-cols-4">
            <Link
              href="/creditos"
              className="group relative overflow-hidden rounded-lg border border-primary/20 bg-primary/5 p-4 shadow-micro transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover"
            >
              <div className="relative z-10 flex flex-col items-start text-left">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-primary/10 ring-1 ring-primary/20">
                  <CreditCard
                    className="h-[22px] w-[22px] text-primary"
                    strokeWidth={1.75}
                  />
                </div>
                <p className="font-display mt-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  SALDO DE CRÉDITOS
                </p>
                <p className="font-display mt-3 text-[30px] font-bold leading-none tracking-tight text-foreground sm:text-[34px]">
                  {formatNumber(credits.balance)}
                </p>
                <p className="mt-2 max-w-[18rem] text-[11px] leading-snug text-muted-foreground">
                  {formatNumber(credits.used)} utilizados de{" "}
                  {formatNumber(credits.purchased)} comprados
                </p>
              </div>
              <div className="relative z-10 mt-4 flex items-center gap-1 text-[11px] font-medium text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100">
                <span>Ver créditos</span>
                <ChevronRight className="h-3 w-3" />
              </div>
            </Link>

            <Link
              href="/disparos"
              className="group relative overflow-hidden rounded-lg border border-border bg-card p-4 shadow-micro transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover"
            >
              <div className="relative z-10 flex flex-col items-start text-left">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-primary/10 ring-1 ring-primary/20">
                  <Activity
                    className="h-[22px] w-[22px] text-primary"
                    strokeWidth={1.75}
                  />
                </div>
                <p className="font-display mt-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  EM EXECUÇÃO
                </p>
                <p className="font-display mt-3 text-[30px] font-bold leading-none tracking-tight text-foreground sm:text-[34px]">
                  {recebidos}
                </p>
                <p className="mt-2 max-w-[18rem] text-[11px] leading-snug text-muted-foreground">
                  Recebidos e em configuração
                </p>
              </div>
              <div className="relative z-10 mt-4 flex items-center gap-1 text-[11px] font-medium text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100">
                <span>Ver disparos</span>
                <ChevronRight className="h-3 w-3" />
              </div>
            </Link>

            <Link
              href="/disparos?status=disparando"
              className="group relative overflow-hidden rounded-lg border border-border bg-card p-4 shadow-micro transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover"
            >
              <div className="relative z-10 flex flex-col items-start text-left">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-primary/10 ring-1 ring-primary/20">
                  <Clock
                    className="h-[22px] w-[22px] text-primary"
                    strokeWidth={1.75}
                  />
                </div>
                <p className="font-display mt-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  EM DISPARO
                </p>
                <p className="font-display mt-3 text-[30px] font-bold leading-none tracking-tight text-foreground sm:text-[34px]">
                  0
                </p>
                <p className="mt-2 max-w-[18rem] text-[11px] leading-snug text-muted-foreground">
                  Na fila de envio ou aguardando horário
                </p>
              </div>
              <div className="relative z-10 mt-4 flex items-center gap-1 text-[11px] font-medium text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100">
                <span>Ver disparos</span>
                <ChevronRight className="h-3 w-3" />
              </div>
            </Link>

            <Link
              href="/disparos?status=realizado"
              className="group relative overflow-hidden rounded-lg border border-border bg-card p-4 shadow-micro transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover"
            >
              <div
                className="pointer-events-none absolute -right-6 -top-10 h-[7.25rem] w-[7.25rem] rounded-full bg-primary/10"
                aria-hidden
              />
              <div className="relative z-10 flex flex-col items-start text-left">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-primary/10 ring-1 ring-primary/20">
                  <CheckCircle2
                    className="h-[22px] w-[22px] text-primary"
                    strokeWidth={1.75}
                  />
                </div>
                <p className="font-display mt-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  REALIZADOS
                </p>
                <p className="font-display mt-3 text-[30px] font-bold leading-none tracking-tight text-foreground sm:text-[34px]">
                  {realizados}
                </p>
                <p className="mt-2 max-w-[18rem] text-[11px] leading-snug text-muted-foreground">
                  Disparos concluídos
                </p>
              </div>
              <div className="relative z-10 mt-4 flex items-center gap-1 text-[11px] font-medium text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100">
                <span>Ver disparos</span>
                <ChevronRight className="h-3 w-3" />
              </div>
            </Link>
          </div>
        </section>

        <div className="min-w-0 overflow-hidden rounded-xl border border-[#E5E7EB] bg-white shadow-[0px_1px_3px_rgba(0,0,0,0.05)]">
          <div className="flex shrink-0 flex-col space-y-1 border-b border-[#F3F4F6] px-4 py-4 sm:px-5">
            <h3 className="font-display text-lg font-semibold leading-tight tracking-tight text-foreground">
              Consumo de créditos por empresa
            </h3>
            <p className="text-sm text-muted-foreground">
              Uso consolidado por filial quando não há empresa selecionada;
              filtrável acima
            </p>
          </div>
          <div className="px-4 py-5 sm:px-5">
            <div className="flex items-center justify-between border-b border-dashed border-[#F3F4F6] pb-2 text-sm last:border-0 last:pb-0">
              <span className="font-medium text-foreground">
                {companies[0]?.name ?? "—"}
              </span>
              <span className="tabular-nums text-muted-foreground">
                {formatNumber(credits.used)} créditos
              </span>
            </div>
          </div>
        </div>

        <div className="min-w-0 overflow-hidden rounded-lg border border-border bg-card shadow-micro">
          <div className="flex flex-col gap-2 border-b border-border px-4 py-4 sm:px-5">
            <div className="flex flex-row items-center gap-2">
              <ChartColumn className="h-4 w-4 shrink-0 text-muted-foreground" />
              <h3 className="font-display text-lg font-semibold leading-tight tracking-tight text-foreground">
                Relatório de disparos
              </h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Agregações do conjunto visível ao painel respeitando o filtro de
              empresa quando ativo.
            </p>
          </div>
          <div className="space-y-5 px-4 py-5 sm:px-5">
            <div className="max-w-md space-y-1.5">
              <label
                htmlFor="relatorio-disparo"
                className="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
              >
                Disparo específico
              </label>
              <select
                id="relatorio-disparo"
                aria-label="Disparo específico"
                value={disparoId}
                onChange={(e) => setDisparoId(e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="">Todos os disparos</option>
                {disparos.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.date.split(",")[0]} · {d.name}
                  </option>
                ))}
              </select>
              <p className="text-xs text-muted-foreground">
                Escolha &quot;Todos os disparos&quot; para métricas consolidadas.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-lg border border-border bg-muted/40 p-3 text-center shadow-micro">
                <div className="mb-1 flex justify-center">
                  <Send className="h-4 w-4 text-muted-foreground" />
                </div>
                <p className="font-display text-2xl font-bold tabular-nums text-foreground">
                  {disparos.length}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">Disparos</p>
              </div>
              <div className="rounded-lg border border-success/20 bg-success/10 p-3 text-center shadow-micro">
                <div className="mb-1 flex justify-center">
                  <CalendarDays className="h-4 w-4 text-success" />
                </div>
                <p className="font-display text-2xl font-bold tabular-nums text-success">
                  {realizados}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">Realizados</p>
              </div>
              <div className="rounded-lg border border-info/20 bg-info/10 p-3 text-center shadow-micro">
                <div className="mb-1 flex justify-center">
                  <CreditCard className="h-4 w-4 text-info" />
                </div>
                <p className="font-display text-2xl font-bold tabular-nums text-info">
                  {formatNumber(credits.used)}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Créditos usados
                </p>
              </div>
            </div>
          </div>
        </div>

        <div>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
              <h2 className="font-display text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Disparos recentes
              </h2>
              <span className="inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-primary/10 px-1.5 text-[11px] font-bold text-primary">
                {disparos.length}
              </span>
              <div
                role="toolbar"
                aria-label="Filtrar disparos recentes por período"
                className="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-lg border border-border bg-card p-3 shadow-micro"
              >
                <div className="flex flex-wrap items-center gap-2">
                  {periodFilters.map((f) => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => setPeriod(f)}
                      className={`inline-flex h-8 shrink-0 items-center rounded-full border px-3 text-xs font-medium transition-colors ${
                        period === f
                          ? "border-primary/40 bg-primary/10 text-primary shadow-sm"
                          : "border-border bg-card text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <Link
              href="/disparos"
              className="flex items-center gap-1 text-sm font-semibold text-primary transition-opacity hover:opacity-90"
            >
              Ver todos
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {disparos.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border bg-card px-4 py-10 text-center shadow-micro">
                <p className="text-sm text-muted-foreground">
                  Nenhum disparo ainda. Crie o primeiro para começar.
                </p>
                <Link
                  href="/disparos/novo"
                  className="mt-3 inline-flex text-sm font-semibold text-primary hover:opacity-90"
                >
                  + Novo disparo
                </Link>
              </div>
            ) : (
              disparos.map((d) => (
              <Link
                key={d.id}
                href={`/disparos/${d.id}`}
                className="block min-w-0 rounded-lg border border-border bg-card px-4 py-3 shadow-micro transition-colors hover:bg-muted/10"
              >
                <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-stretch">
                  <div className="min-w-0 flex-1 space-y-2 overflow-hidden">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                      <StatusBadge
                        status={d.status}
                        variant={
                          d.status === "Realizado" ? "success" : "muted"
                        }
                      />
                      <span className="inline-flex min-w-0 max-w-full items-center gap-1 text-xs text-muted-foreground sm:text-[13px]">
                        <CalendarDays className="h-3.5 w-3.5 shrink-0 opacity-90" />
                        <span className="min-w-0 truncate tabular-nums">
                          {d.date}
                        </span>
                      </span>
                    </div>
                    <p
                      title={d.name}
                      className="min-w-0 truncate font-display text-sm font-semibold leading-snug text-foreground sm:text-[15px]"
                    >
                      {d.name}
                    </p>
                    <p className="flex min-w-0 max-w-full items-center gap-1.5 text-xs text-muted-foreground">
                      <Building2 className="h-3.5 w-3.5 shrink-0 opacity-90" />
                      <span className="min-w-0 truncate">{d.company}</span>
                    </p>
                  </div>
                  <aside className="flex w-full shrink-0 flex-col sm:w-48">
                    <div className="mb-3 h-px w-full shrink-0 bg-border sm:hidden" />
                    <div className="flex flex-1 items-center justify-between gap-2 sm:min-h-10 sm:justify-end sm:border-l sm:border-border sm:pl-4">
                      <div className="min-w-0 flex-1 text-left sm:max-w-[7.75rem] sm:flex-initial sm:text-right">
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                          Métricas
                        </p>
                        <p className="mt-0.5 truncate text-xs font-semibold tabular-nums text-foreground sm:text-sm">
                          {d.metric}
                        </p>
                      </div>
                      <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                    </div>
                  </aside>
                </div>
              </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}

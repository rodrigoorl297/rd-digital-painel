"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Building2,
  CalendarDays,
  MessageSquareText,
  PauseCircle,
  PlayCircle,
  Trash2,
  Users,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { StatusBadge } from "@/components/ui";
import {
  deleteDisparo,
  getDisparo,
  subscribeDisparos,
  updateDisparoStatus,
  type DisparoRecord,
} from "@/lib/disparos-store";

function statusVariant(status: string) {
  if (status === "Realizado") return "success" as const;
  return "muted" as const;
}

export default function DisparoDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params.id;
  const [disparo, setDisparo] = useState<DisparoRecord | null | undefined>(
    undefined,
  );

  useEffect(() => {
    const refresh = () => setDisparo(getDisparo(id) ?? null);
    refresh();
    return subscribeDisparos(refresh);
  }, [id]);

  if (disparo === undefined) {
    return (
      <AppShell>
        <p className="text-sm text-muted-foreground">Carregando…</p>
      </AppShell>
    );
  }

  if (disparo === null) {
    return (
      <AppShell>
        <div className="space-y-4 py-10 text-center">
          <p className="text-sm text-muted-foreground">
            Disparo não encontrado.
          </p>
          <Link
            href="/disparos"
            className="inline-flex text-sm font-semibold text-primary"
          >
            Voltar para disparos
          </Link>
        </div>
      </AppShell>
    );
  }

  const progress =
    disparo.contactCount > 0
      ? Math.min(
          100,
          Math.round((disparo.sent / disparo.contactCount) * 100) ||
            disparo.progress,
        )
      : disparo.progress;

  function markRealizado() {
    if (!disparo) return;
    const sent = disparo.contactCount;
    const delivered = Math.round(sent * 0.82);
    const failed = sent - delivered;
    updateDisparoStatus(disparo.id, {
      status: "Realizado",
      draft: false,
      sent,
      delivered,
      failed,
      progress: 100,
      metric: `${((delivered / Math.max(sent, 1)) * 100).toFixed(1)}% Entregue`,
    });
  }

  function markDisparando() {
    if (!disparo) return;
    updateDisparoStatus(disparo.id, {
      status: "Disparando",
      draft: false,
      progress: Math.max(disparo.progress, 5),
      metric: `${Math.max(disparo.progress, 5)}% · ${disparo.contactCount.toLocaleString("pt-BR")} destinatários`,
    });
  }

  function markCancelado() {
    if (!disparo) return;
    updateDisparoStatus(disparo.id, {
      status: "Cancelado",
      draft: false,
      metric: "Cancelado",
    });
  }

  function handleDelete() {
    if (!disparo) return;
    if (!window.confirm("Excluir este disparo?")) return;
    deleteDisparo(disparo.id);
    router.push("/disparos");
  }

  return (
    <AppShell>
      <div className="space-y-6">
        <Link
          href="/disparos"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar para disparos
        </Link>

        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <StatusBadge
                status={disparo.status}
                variant={statusVariant(disparo.status)}
              />
              {disparo.draft ? (
                <span className="inline-flex items-center rounded-full bg-secondary px-2.5 py-0.5 text-[10px] font-semibold text-secondary-foreground">
                  Rascunho
                </span>
              ) : null}
            </div>
            <h1 className="font-display text-2xl font-bold tracking-tight">
              {disparo.name}
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays className="h-3.5 w-3.5" />
                {disparo.scheduledAt
                  ? `Agendado: ${disparo.scheduledAt}`
                  : disparo.date}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Building2 className="h-3.5 w-3.5" />
                {disparo.company}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {disparo.status !== "Realizado" &&
            disparo.status !== "Cancelado" ? (
              <>
                <button
                  type="button"
                  onClick={markDisparando}
                  className="inline-flex h-9 items-center gap-1.5 rounded-md border border-border bg-background px-3 text-sm font-medium hover:bg-secondary"
                >
                  <PlayCircle className="h-4 w-4" />
                  Simular envio
                </button>
                <button
                  type="button"
                  onClick={markRealizado}
                  className="inline-flex h-9 items-center gap-1.5 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground hover:opacity-90"
                >
                  Marcar realizado
                </button>
                <button
                  type="button"
                  onClick={markCancelado}
                  className="inline-flex h-9 items-center gap-1.5 rounded-md border border-border bg-background px-3 text-sm font-medium hover:bg-secondary"
                >
                  <PauseCircle className="h-4 w-4" />
                  Cancelar
                </button>
              </>
            ) : null}
            <button
              type="button"
              onClick={handleDelete}
              className="inline-flex h-9 items-center gap-1.5 rounded-md border border-destructive/30 px-3 text-sm font-medium text-destructive hover:bg-destructive/5"
            >
              <Trash2 className="h-4 w-4" />
              Excluir
            </button>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-4 shadow-micro">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="font-medium text-foreground">Progresso</span>
            <span className="tabular-nums text-muted-foreground">{progress}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="mt-3 grid grid-cols-3 gap-3 text-center text-sm">
            <div>
              <p className="text-xs text-muted-foreground">Enviados</p>
              <p className="font-semibold tabular-nums">{disparo.sent}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Entregues</p>
              <p className="font-semibold tabular-nums text-success">
                {disparo.delivered}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Falhas</p>
              <p className="font-semibold tabular-nums text-destructive">
                {disparo.failed}
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <InfoCard label="Perfil WhatsApp" value={disparo.profileName || "—"} />
          <InfoCard label="DDD" value={disparo.ddd || "—"} />
          <InfoCard label="Produto / perfil" value={disparo.product} />
          <InfoCard
            label="Contatos"
            value={`${disparo.contactCount.toLocaleString("pt-BR")} · ${disparo.contactSource}`}
            icon={<Users className="h-3.5 w-3.5" />}
          />
          <InfoCard
            label="Intervalo"
            value={`${disparo.intervalSeconds}s entre mensagens`}
          />
          <InfoCard
            label="Modo"
            value={
              disparo.scheduleMode === "agendar" ? "Agendado" : "Envio imediato"
            }
          />
        </div>

        <div className="rounded-lg border border-border bg-card p-4 shadow-micro">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
            <MessageSquareText className="h-4 w-4 text-primary" />
            Mensagem
          </h2>
          <div className="rounded-lg bg-[#e5ddd5] p-4">
            <div className="ml-auto max-w-[90%] rounded-lg rounded-tr-sm bg-[#dcf8c6] px-3 py-2 text-sm whitespace-pre-wrap shadow-sm">
              {disparo.message || "—"}
              {disparo.mediaName ? (
                <p className="mt-2 text-xs text-muted-foreground">
                  Anexo: {disparo.mediaName}
                </p>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function InfoCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-4 shadow-micro">
      <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        {icon}
        {label}
      </p>
      <p className="mt-2 font-medium break-words">{value}</p>
    </div>
  );
}

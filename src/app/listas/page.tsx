"use client";

import { useMemo, useState } from "react";
import { Database, Download, Plus, Trash2 } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Card, PaginationFooter } from "@/components/ui";
import { listas } from "@/lib/data";

export default function ListasPage() {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    return listas.filter(
      (l) =>
        !search || l.name.toLowerCase().includes(search.toLowerCase()),
    );
  }, [search]);

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Listas de Leads</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Gerencie suas listas de contatos para reutilizar em disparos
            </p>
          </div>
          <button
            type="button"
            className="inline-flex h-10 items-center justify-center whitespace-nowrap rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-micro transition-all duration-150 hover:bg-primary/90"
          >
            <Plus className="mr-2 h-4 w-4" />
            Nova Lista
          </button>
        </div>

        <Card className="overflow-hidden">
          <div className="flex flex-col space-y-3 p-5 pb-2">
            <h3 className="font-display flex items-center gap-2 text-sm font-semibold tracking-tight text-foreground">
              <Database className="h-4 w-4" />
              Suas listas salvas
            </h3>
            <input
              type="search"
              placeholder="Filtrar por nome da lista…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex h-10 w-full max-w-sm rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20"
            />
          </div>

          <div className="p-5 pt-0">
            <div className="divide-y">
              {filtered.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  Nenhuma lista salva ainda.
                </p>
              ) : (
                filtered.map((lista) => (
                <div
                  key={lista.id}
                  className="flex items-center justify-between py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{lista.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {lista.rows ? `${lista.rows} · ` : null}
                      {lista.date}
                    </p>
                  </div>
                  <div className="ml-4 flex shrink-0 items-center gap-2">
                    <button
                      type="button"
                      aria-label="Baixar lista"
                      className="inline-flex h-9 items-center justify-center rounded-md px-3 text-xs transition-all hover:bg-muted hover:text-foreground"
                    >
                      <Download className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      aria-label="Excluir lista"
                      className="inline-flex h-9 items-center justify-center rounded-md px-3 text-xs text-destructive transition-all hover:bg-muted hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                ))
              )}
            </div>
            <PaginationFooter totalRecords={filtered.length} />
          </div>
        </Card>
      </div>
    </AppShell>
  );
}

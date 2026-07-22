"use client";

import { FormEvent, useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Card, PageHeader } from "@/components/ui";
import {
  addEmpresa,
  deleteEmpresa,
  listEmpresas,
  subscribeEmpresas,
  updateEmpresa,
  type Empresa,
} from "@/lib/empresas-store";

export default function EmpresasPage() {
  const [name, setName] = useState("");
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  useEffect(() => {
    const refresh = () => setEmpresas(listEmpresas());
    refresh();
    return subscribeEmpresas(refresh);
  }, []);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const created = addEmpresa(name);
    if (!created) return;
    setName("");
    setEmpresas(listEmpresas());
  }

  function startEdit(empresa: Empresa) {
    setEditingId(empresa.id);
    setEditName(empresa.name);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditName("");
  }

  function saveEdit(id: string) {
    const updated = updateEmpresa(id, editName);
    if (!updated) return;
    setEditingId(null);
    setEditName("");
    setEmpresas(listEmpresas());
  }

  function handleDelete(empresa: Empresa) {
    const ok = window.confirm(
      `Apagar a empresa "${empresa.name}"? Esta ação não pode ser desfeita.`,
    );
    if (!ok) return;
    deleteEmpresa(empresa.id);
    if (editingId === empresa.id) cancelEdit();
    setEmpresas(listEmpresas());
  }

  return (
    <AppShell>
      <PageHeader
        title="Minhas empresas"
        subtitle="Toda operação e consumo de créditos serão vinculados à empresa selecionada no disparo."
      />

      <div className="space-y-6">
        <Card className="p-5">
          <h2 className="mb-4 font-display text-base font-semibold text-foreground">
            Nova empresa
          </h2>
          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-3 sm:flex-row sm:items-end"
          >
            <div className="min-w-0 flex-1 space-y-1.5">
              <label
                htmlFor="empresa-nome"
                className="text-sm font-medium text-foreground"
              >
                Nome
              </label>
              <input
                id="empresa-nome"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Razão social ou marca"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none ring-ring placeholder:text-muted-foreground focus:ring-2"
              />
            </div>
            <button
              type="submit"
              disabled={!name.trim()}
              className="inline-flex h-10 shrink-0 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow-micro transition-opacity hover:opacity-90 disabled:pointer-events-none disabled:opacity-50"
            >
              Adicionar
            </button>
          </form>
        </Card>

        <Card className="p-5">
          <h2 className="mb-4 font-display text-base font-semibold text-foreground">
            Cadastradas
          </h2>
          {empresas.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nenhuma empresa cadastrada ainda.
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {empresas.map((c) => (
                <li
                  key={c.id}
                  className="flex flex-col gap-3 py-3 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
                >
                  {editingId === c.id ? (
                    <>
                      <input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            saveEdit(c.id);
                          }
                          if (e.key === "Escape") cancelEdit();
                        }}
                        autoFocus
                        aria-label="Novo nome da empresa"
                        className="flex h-9 min-w-0 flex-1 rounded-md border border-input bg-background px-3 text-sm outline-none ring-ring focus:ring-2"
                      />
                      <div className="flex shrink-0 items-center gap-2">
                        <button
                          type="button"
                          onClick={() => saveEdit(c.id)}
                          disabled={!editName.trim()}
                          className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:pointer-events-none disabled:opacity-50"
                        >
                          Salvar
                        </button>
                        <button
                          type="button"
                          onClick={cancelEdit}
                          className="rounded-md border border-border bg-background px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
                        >
                          Cancelar
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <span className="min-w-0 truncate font-medium text-foreground">
                        {c.name}
                      </span>
                      <div className="flex shrink-0 items-center gap-2">
                        <button
                          type="button"
                          onClick={() => startEdit(c)}
                          className="rounded-md border border-border bg-background px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(c)}
                          className="rounded-md border border-border bg-background px-3 py-1.5 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
                        >
                          Apagar
                        </button>
                      </div>
                    </>
                  )}
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </AppShell>
  );
}

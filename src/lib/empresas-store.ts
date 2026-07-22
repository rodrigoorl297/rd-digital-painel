"use client";

import { companies as seedCompanies } from "@/lib/data";

export type Empresa = {
  id: string;
  name: string;
};

const STORAGE_KEY = "rd-digital-empresas";
const CHANGE_EVENT = "rd-empresas-changed";

function seed(): Empresa[] {
  return seedCompanies.map((c) => ({ id: c.id, name: c.name }));
}

function readRaw(): Empresa[] {
  if (typeof window === "undefined") return seed();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const initial = seed();
      writeRaw(initial);
      return initial;
    }
    const parsed = JSON.parse(raw) as Empresa[];
    if (!Array.isArray(parsed)) return seed();
    return parsed
      .filter(
        (c) =>
          c &&
          typeof c.id === "string" &&
          typeof c.name === "string" &&
          c.name.trim().length > 0,
      )
      .map((c) => ({ id: c.id, name: c.name.trim() }));
  } catch {
    return seed();
  }
}

function writeRaw(items: Empresa[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function listEmpresas(): Empresa[] {
  return readRaw();
}

export function getEmpresa(id: string): Empresa | undefined {
  return readRaw().find((c) => c.id === id);
}

export function resolveEmpresaName(companyId: string): string {
  return getEmpresa(companyId)?.name ?? "RD Digital";
}

export function addEmpresa(name: string): Empresa | null {
  const trimmed = name.trim();
  if (!trimmed) return null;
  const item: Empresa = {
    id: `empresa-${Date.now()}`,
    name: trimmed,
  };
  writeRaw([...readRaw(), item]);
  return item;
}

export function updateEmpresa(id: string, name: string): Empresa | undefined {
  const trimmed = name.trim();
  if (!trimmed) return undefined;
  const items = readRaw();
  const idx = items.findIndex((c) => c.id === id);
  if (idx < 0) return undefined;
  items[idx] = { ...items[idx], name: trimmed };
  writeRaw(items);
  return items[idx];
}

export function deleteEmpresa(id: string): boolean {
  const items = readRaw();
  const next = items.filter((c) => c.id !== id);
  if (next.length === items.length) return false;
  writeRaw(next);
  return true;
}

export function subscribeEmpresas(cb: () => void) {
  const handler = () => cb();
  window.addEventListener("storage", handler);
  window.addEventListener(CHANGE_EVENT, handler);
  return () => {
    window.removeEventListener("storage", handler);
    window.removeEventListener(CHANGE_EVENT, handler);
  };
}

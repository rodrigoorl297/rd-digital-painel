"use client";

import { resolveEmpresaName } from "@/lib/empresas-store";

export type DisparoStatus =
  | "Recebido"
  | "Configurando"
  | "Disparando"
  | "Realizado"
  | "Cancelado";

export type DisparoScheduleMode = "agora" | "agendar";

export type DisparoMediaItem = {
  name: string;
  kind: "image" | "video" | "other";
};

export type DisparoDraft = {
  name: string;
  companyId: string;
  companyName: string;
  profilePhotoName: string;
  profilePhotoPreview: string;
  profileName: string;
  ddd: string;
  message: string;
  mediaName: string;
  mediaFiles: DisparoMediaItem[];
  redirectLinks: string[];
  testNumbers: string[];
  observacoes: string;
  contactSource: "lista" | "arquivo";
  listId: string;
  listName: string;
  fileName: string;
  contactCount: number;
  scheduleMode: DisparoScheduleMode;
  scheduleDate: string;
  scheduleTime: string;
  intervalSeconds: number;
};

export type DisparoRecord = {
  id: string;
  name: string;
  status: DisparoStatus;
  draft: boolean;
  date: string;
  company: string;
  product: string;
  metric: string;
  profileName: string;
  ddd: string;
  message: string;
  mediaName: string;
  mediaFiles: DisparoMediaItem[];
  redirectLinks: string[];
  testNumbers: string[];
  observacoes: string;
  contactCount: number;
  contactSource: string;
  listId: string;
  listName: string;
  fileName: string;
  scheduleMode: DisparoScheduleMode;
  scheduledAt: string | null;
  intervalSeconds: number;
  sent: number;
  delivered: number;
  failed: number;
  progress: number;
  createdAt: string;
};

const STORAGE_KEY = "rd-digital-disparos";

export const WIZARD_STEPS = [
  { id: 1, label: "Perfil de Envio" },
  { id: 2, label: "Mensagem" },
  { id: 3, label: "Contatos" },
  { id: 4, label: "Agendamento" },
] as const;

export const MESSAGE_MAX_LENGTH = 4096;
export const MEDIA_MAX_COUNT = 10;
export const TEST_NUMBERS_MAX = 30;

export function emptyDraft(): DisparoDraft {
  return {
    name: "",
    companyId: "",
    companyName: "",
    profilePhotoName: "",
    profilePhotoPreview: "",
    profileName: "",
    ddd: "11",
    message: "",
    mediaName: "",
    mediaFiles: [],
    redirectLinks: [],
    testNumbers: [],
    observacoes: "",
    contactSource: "lista",
    listId: "",
    listName: "",
    fileName: "",
    contactCount: 0,
    scheduleMode: "agora",
    scheduleDate: "",
    scheduleTime: "",
    intervalSeconds: 8,
  };
}

function formatNow() {
  return new Date().toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function readRaw(): DisparoRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as DisparoRecord[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeRaw(items: DisparoRecord[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event("rd-disparos-changed"));
}

export function listDisparos(): DisparoRecord[] {
  return readRaw().sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function getDisparo(id: string): DisparoRecord | undefined {
  return readRaw().find((d) => d.id === id);
}

export function normalizePhoneDigits(value: string): string {
  return value.replace(/\D/g, "");
}

export function isValidTestNumber(value: string): boolean {
  const digits = normalizePhoneDigits(value);
  return digits.length >= 10 && digits.length <= 13;
}

export function mediaKindFromFile(file: File): DisparoMediaItem["kind"] {
  if (file.type.startsWith("image/")) return "image";
  if (file.type.startsWith("video/")) return "video";
  const lower = file.name.toLowerCase();
  if (/\.(jpe?g|png|gif|webp|bmp)$/i.test(lower)) return "image";
  if (/\.(mp4|mov|webm|avi|mkv)$/i.test(lower)) return "video";
  return "other";
}

export function resolveCompanyName(companyId: string) {
  return resolveEmpresaName(companyId);
}

export function saveDisparoFromDraft(
  draft: DisparoDraft,
  options?: { asDraft?: boolean },
): DisparoRecord {
  const asDraft = options?.asDraft ?? false;
  const now = new Date();
  const scheduledAt =
    draft.scheduleMode === "agendar" && draft.scheduleDate && draft.scheduleTime
      ? `${draft.scheduleDate.split("-").reverse().join("/")}, ${draft.scheduleTime}`
      : null;

  const status: DisparoStatus = asDraft
    ? "Configurando"
    : draft.scheduleMode === "agendar"
      ? "Recebido"
      : "Disparando";

  const contactLabel =
    draft.contactCount > 0
      ? `${draft.contactCount.toLocaleString("pt-BR")} destinatários`
      : "0 destinatários";

  const mediaFiles = draft.mediaFiles.slice(0, MEDIA_MAX_COUNT);
  const mediaName =
    draft.mediaName ||
    (mediaFiles.length === 1
      ? mediaFiles[0].name
      : mediaFiles.length > 1
        ? `${mediaFiles.length} arquivos`
        : "");

  const record: DisparoRecord = {
    id: crypto.randomUUID(),
    name: draft.name.trim() || "Disparo sem nome",
    status,
    draft: asDraft,
    date: formatNow(),
    company: draft.companyName || resolveCompanyName(draft.companyId),
    product: draft.profileName.trim() || "WhatsApp",
    metric: asDraft
      ? contactLabel
      : status === "Disparando"
        ? `0% · ${contactLabel}`
        : contactLabel,
    profileName: draft.profileName.trim(),
    ddd: draft.ddd.trim() || "11",
    message: draft.message.trim(),
    mediaName,
    mediaFiles,
    redirectLinks: draft.redirectLinks,
    testNumbers: draft.testNumbers,
    observacoes: draft.observacoes.trim(),
    contactCount: draft.contactCount,
    contactSource:
      draft.contactSource === "lista"
        ? draft.listName || "Lista salva"
        : draft.fileName || "Arquivo",
    listId: draft.listId,
    listName: draft.listName,
    fileName: draft.fileName,
    scheduleMode: draft.scheduleMode,
    scheduledAt,
    intervalSeconds: draft.intervalSeconds,
    sent: 0,
    delivered: 0,
    failed: 0,
    progress: 0,
    createdAt: now.toISOString(),
  };

  const items = readRaw();
  items.unshift(record);
  writeRaw(items);
  return record;
}

export function updateDisparoStatus(
  id: string,
  patch: Partial<DisparoRecord>,
): DisparoRecord | undefined {
  const items = readRaw();
  const idx = items.findIndex((d) => d.id === id);
  if (idx < 0) return undefined;
  items[idx] = { ...items[idx], ...patch };
  writeRaw(items);
  return items[idx];
}

export function deleteDisparo(id: string) {
  writeRaw(readRaw().filter((d) => d.id !== id));
}

export function subscribeDisparos(cb: () => void) {
  const handler = () => cb();
  window.addEventListener("storage", handler);
  window.addEventListener("rd-disparos-changed", handler);
  return () => {
    window.removeEventListener("storage", handler);
    window.removeEventListener("rd-disparos-changed", handler);
  };
}

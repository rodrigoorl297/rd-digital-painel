"use client";

import {
  ChangeEvent,
  FormEvent,
  KeyboardEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CalendarClock,
  Check,
  Database,
  FileText,
  ImageIcon,
  Upload,
  Video,
  X,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Card } from "@/components/ui";
import { listas } from "@/lib/data";
import {
  listEmpresas,
  subscribeEmpresas,
  type Empresa,
} from "@/lib/empresas-store";
import {
  MEDIA_MAX_COUNT,
  MESSAGE_MAX_LENGTH,
  TEST_NUMBERS_MAX,
  WIZARD_STEPS,
  emptyDraft,
  isValidTestNumber,
  mediaKindFromFile,
  resolveCompanyName,
  saveDisparoFromDraft,
  type DisparoDraft,
  type DisparoMediaItem,
} from "@/lib/disparos-store";

const inputClass =
  "flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none ring-ring placeholder:text-muted-foreground focus:ring-2";

const labelClass = "text-sm font-medium text-foreground";

const addBtnClass =
  "inline-flex h-10 shrink-0 items-center justify-center whitespace-nowrap rounded-md border border-border bg-background px-3 text-sm font-medium text-foreground transition-colors hover:bg-secondary";

function Stepper({ step }: { step: number }) {
  return (
    <ol className="mb-8 flex flex-wrap items-center gap-y-3">
      {WIZARD_STEPS.map((s, idx) => {
        const active = step === s.id;
        const done = step > s.id;
        return (
          <li key={s.id} className="flex items-center">
            <div className="flex items-center gap-2.5">
              <span
                className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${
                  done
                    ? "bg-primary text-primary-foreground"
                    : active
                      ? "bg-primary text-primary-foreground"
                      : "border border-border bg-background text-muted-foreground"
                }`}
              >
                {done ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : s.id}
              </span>
              <span
                className={`text-sm font-medium ${
                  active || done
                    ? "text-primary"
                    : "text-muted-foreground"
                }`}
              >
                {s.label}
              </span>
            </div>
            {idx < WIZARD_STEPS.length - 1 ? (
              <span
                className={`mx-3 hidden h-0.5 w-10 sm:block ${
                  done ? "bg-primary" : "bg-border"
                }`}
              />
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1 text-xs text-destructive">{message}</p>;
}

function ChipList({
  items,
  onRemove,
}: {
  items: string[];
  onRemove: (index: number) => void;
}) {
  if (items.length === 0) return null;
  return (
    <ul className="mt-2 flex flex-wrap gap-2">
      {items.map((item, index) => (
        <li
          key={`${item}-${index}`}
          className="inline-flex max-w-full items-center gap-1.5 rounded-md border border-border bg-secondary/50 px-2.5 py-1 text-xs text-foreground"
        >
          <span className="truncate">{item}</span>
          <button
            type="button"
            aria-label="Remover"
            onClick={() => onRemove(index)}
            className="rounded p-0.5 text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
          >
            <X className="h-3 w-3" />
          </button>
        </li>
      ))}
    </ul>
  );
}

export default function NovoDisparoPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [draft, setDraft] = useState<DisparoDraft>(emptyDraft);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [linkInput, setLinkInput] = useState("");
  const [testNumberInput, setTestNumberInput] = useState("");
  const [listaSearch, setListaSearch] = useState("");
  const [listaDateFilter, setListaDateFilter] = useState("todas");
  const photoInputRef = useRef<HTMLInputElement>(null);
  const mediaInputRef = useRef<HTMLInputElement>(null);
  const contactsInputRef = useRef<HTMLInputElement>(null);
  const [companyOptions, setCompanyOptions] = useState<Empresa[]>([]);

  useEffect(() => {
    const refresh = () => setCompanyOptions(listEmpresas());
    refresh();
    return subscribeEmpresas(refresh);
  }, []);

  const filteredListas = useMemo(() => {
    return listas.filter((l) => {
      const matchesSearch =
        !listaSearch ||
        l.name.toLowerCase().includes(listaSearch.toLowerCase());
      return matchesSearch;
    });
  }, [listaSearch]);

  const estimatedDurationMin = useMemo(() => {
    if (!draft.contactCount || !draft.intervalSeconds) return 0;
    return Math.ceil((draft.contactCount * draft.intervalSeconds) / 60);
  }, [draft.contactCount, draft.intervalSeconds]);

  function patch(partial: Partial<DisparoDraft>) {
    setDraft((prev) => ({ ...prev, ...partial }));
  }

  function validateStep(current: number): boolean {
    const nextErrors: Record<string, string> = {};

    if (!draft.name.trim()) nextErrors.name = "Informe o nome do disparo.";

    if (current === 1) {
      if (!draft.companyId) nextErrors.companyId = "Selecione a empresa.";
      if (!draft.profileName.trim())
        nextErrors.profileName = "Informe o nome de perfil.";
      if (!draft.ddd.trim() || !/^\d{2}$/.test(draft.ddd.trim()))
        nextErrors.ddd = "Informe um DDD válido (2 dígitos).";
    }

    if (current === 2) {
      if (!draft.message.trim())
        nextErrors.message = "Escreva a mensagem do disparo.";
      else if (draft.message.trim().length < 5)
        nextErrors.message = "A mensagem precisa ter pelo menos 5 caracteres.";
      else if (draft.message.length > MESSAGE_MAX_LENGTH)
        nextErrors.message = `A mensagem pode ter no máximo ${MESSAGE_MAX_LENGTH} caracteres.`;
    }

    if (current === 3) {
      if (draft.contactCount <= 0)
        nextErrors.contacts =
          "Selecione uma lista ou envie um arquivo com contatos.";
      if (draft.contactSource === "lista" && !draft.listId)
        nextErrors.contacts = "Selecione uma lista salva ou faça upload.";
      if (draft.contactSource === "arquivo" && !draft.fileName)
        nextErrors.contacts = "Envie um arquivo CSV, XLS ou XLSX.";
    }

    if (current === 4) {
      if (draft.scheduleMode === "agendar") {
        if (!draft.scheduleDate)
          nextErrors.scheduleDate = "Escolha a data do agendamento.";
        if (!draft.scheduleTime)
          nextErrors.scheduleTime = "Escolha o horário do agendamento.";
      }
      if (draft.intervalSeconds < 3 || draft.intervalSeconds > 120)
        nextErrors.intervalSeconds = "Intervalo entre 3 e 120 segundos.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function goNext() {
    if (!validateStep(step)) return;
    setStep((s) => Math.min(4, s + 1));
  }

  function goBack() {
    setErrors({});
    if (step === 1) {
      router.push("/disparos");
      return;
    }
    setStep((s) => Math.max(1, s - 1));
  }

  function handlePhoto(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    patch({ profilePhotoName: file.name, profilePhotoPreview: url });
  }

  function handleMedia(e: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;

    const accepted: DisparoMediaItem[] = [];
    for (const file of files) {
      const kind = mediaKindFromFile(file);
      if (kind === "other") continue;
      accepted.push({ name: file.name, kind });
    }

    const next = [...draft.mediaFiles, ...accepted].slice(0, MEDIA_MAX_COUNT);
    patch({
      mediaFiles: next,
      mediaName:
        next.length === 1
          ? next[0].name
          : next.length > 1
            ? `${next.length} arquivos`
            : "",
    });
    e.target.value = "";
  }

  function removeMedia(index: number) {
    const next = draft.mediaFiles.filter((_, i) => i !== index);
    patch({
      mediaFiles: next,
      mediaName:
        next.length === 1
          ? next[0].name
          : next.length > 1
            ? `${next.length} arquivos`
            : "",
    });
  }

  function addRedirectLink() {
    const value = linkInput.trim();
    if (!value) return;
    if (draft.redirectLinks.includes(value)) {
      setLinkInput("");
      return;
    }
    patch({ redirectLinks: [...draft.redirectLinks, value] });
    setLinkInput("");
  }

  function addTestNumber() {
    const value = testNumberInput.trim();
    if (!value) return;
    if (!isValidTestNumber(value)) {
      setErrors((prev) => ({
        ...prev,
        testNumbers: "Informe um número válido com DDD.",
      }));
      return;
    }
    if (draft.testNumbers.length >= TEST_NUMBERS_MAX) {
      setErrors((prev) => ({
        ...prev,
        testNumbers: `Máximo de ${TEST_NUMBERS_MAX} números de teste.`,
      }));
      return;
    }
    if (draft.testNumbers.includes(value)) {
      setTestNumberInput("");
      return;
    }
    patch({ testNumbers: [...draft.testNumbers, value] });
    setTestNumberInput("");
    setErrors((prev) => {
      const next = { ...prev };
      delete next.testNumbers;
      return next;
    });
  }

  function onLinkKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      addRedirectLink();
    }
  }

  function onTestNumberKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      addTestNumber();
    }
  }

  function handleContactsFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 50 * 1024 * 1024) {
      setErrors((prev) => ({
        ...prev,
        contacts: "O arquivo deve ter no máximo 50MB.",
      }));
      return;
    }
    const estimated = Math.max(
      1,
      Math.min(5000, Math.round(file.size / 18) || 100),
    );
    patch({
      contactSource: "arquivo",
      fileName: file.name,
      listId: "",
      listName: "",
      contactCount: estimated,
    });
    setErrors((prev) => {
      const next = { ...prev };
      delete next.contacts;
      return next;
    });
    e.target.value = "";
  }

  function setContactsTab(tab: "lista" | "arquivo") {
    if (tab === draft.contactSource) return;
    patch({
      contactSource: tab,
      listId: "",
      listName: "",
      fileName: "",
      contactCount: 0,
    });
    setErrors((prev) => {
      const next = { ...prev };
      delete next.contacts;
      return next;
    });
  }

  function handleSelectList(listId: string) {
    const list = listas.find((l) => l.id === listId);
    const rows = list?.rows
      ? Number(String(list.rows).replace(/\D/g, "")) || 0
      : 0;
    patch({
      contactSource: "lista",
      listId,
      listName: list?.name ?? "",
      fileName: "",
      contactCount: rows > 0 ? rows : list ? 50 : 0,
    });
    setErrors((prev) => {
      const next = { ...prev };
      delete next.contacts;
      return next;
    });
  }

  function handleSubmit(e: FormEvent, asDraft = false) {
    e.preventDefault();
    if (!asDraft && !validateStep(4)) return;
    if (asDraft && !draft.name.trim()) {
      setErrors({ name: "Informe ao menos o nome para salvar o rascunho." });
      setStep(1);
      return;
    }

    setSubmitting(true);
    const companyName = resolveCompanyName(draft.companyId);
    const record = saveDisparoFromDraft(
      { ...draft, companyName },
      { asDraft },
    );
    router.push(`/disparos/${record.id}`);
  }

  const mediaCount = draft.mediaFiles.length;

  return (
    <AppShell>
      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">
            Novo Disparo
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Preencha os dados abaixo para agendar um disparo em massa
          </p>
        </div>

        <Card className="p-5 sm:p-6">
          <div className="mb-6 space-y-1.5">
            <label htmlFor="nome-disparo" className={labelClass}>
              Nome do disparo
            </label>
            <input
              id="nome-disparo"
              value={draft.name}
              onChange={(e) => patch({ name: e.target.value })}
              placeholder="Ex: Promoção Junho • 25/06 • 10h • 500 contatos"
              className={inputClass}
            />
            <p className="text-xs text-muted-foreground">
              Use um nome que identifique este disparo — empresa, data e horário
              são um bom começo.
            </p>
            <FieldError message={errors.name} />
          </div>

          <Stepper step={step} />

          <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-6">
            {step === 1 ? (
              <section className="space-y-5">
                <div>
                  <h2 className="font-display text-base font-semibold text-foreground">
                    Perfil de Envio
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Configure os dados de identidade do sender do disparo.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="empresa" className={labelClass}>
                    Empresa{" "}
                    <span className="text-muted-foreground">(obrigatório)</span>
                  </label>
                  <select
                    id="empresa"
                    value={draft.companyId}
                    onChange={(e) =>
                      patch({
                        companyId: e.target.value,
                        companyName: resolveCompanyName(e.target.value),
                      })
                    }
                    className={inputClass}
                  >
                    <option value="">Selecione...</option>
                    {companyOptions.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  <FieldError message={errors.companyId} />
                </div>

                <div className="space-y-2">
                  <p className={labelClass}>Foto de perfil do WhatsApp</p>
                  <div className="flex items-center gap-4">
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-secondary">
                      {draft.profilePhotoPreview ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={draft.profilePhotoPreview}
                          alt="Prévia da foto de perfil"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <ImageIcon className="h-6 w-6 text-muted-foreground" />
                      )}
                    </div>
                    <div>
                      <input
                        ref={photoInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="hidden"
                        onChange={handlePhoto}
                      />
                      <button
                        type="button"
                        onClick={() => photoInputRef.current?.click()}
                        className="inline-flex h-9 items-center gap-2 rounded-md border border-border bg-background px-3 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
                      >
                        <Upload className="h-3.5 w-3.5" />
                        Selecionar foto
                      </button>
                      <p className="mt-1.5 text-xs text-muted-foreground">
                        JPG, PNG ou WebP. Esta será a foto exibida no WhatsApp.
                      </p>
                      {draft.profilePhotoName ? (
                        <p className="mt-1 text-xs text-primary">
                          {draft.profilePhotoName}
                        </p>
                      ) : null}
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-[1fr_100px]">
                  <div className="space-y-1.5">
                    <label htmlFor="perfil-nome" className={labelClass}>
                      Nome de perfil
                    </label>
                    <input
                      id="perfil-nome"
                      value={draft.profileName}
                      onChange={(e) => patch({ profileName: e.target.value })}
                      placeholder="Ex: Loja Central"
                      className={inputClass}
                    />
                    <FieldError message={errors.profileName} />
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="ddd" className={labelClass}>
                      DDD
                    </label>
                    <input
                      id="ddd"
                      value={draft.ddd}
                      onChange={(e) =>
                        patch({
                          ddd: e.target.value.replace(/\D/g, "").slice(0, 2),
                        })
                      }
                      inputMode="numeric"
                      maxLength={2}
                      className={inputClass}
                    />
                    <FieldError message={errors.ddd} />
                  </div>
                </div>
              </section>
            ) : null}

            {step === 2 ? (
              <section className="space-y-5">
                <div>
                  <h2 className="font-display text-base font-semibold text-foreground">
                    Mensagem
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Escreva o conteúdo que será enviado aos seus contatos
                  </p>
                </div>

                <div className="space-y-2">
                  <p className={labelClass}>
                    Mídias do disparo (opcional · até {MEDIA_MAX_COUNT} imagens
                    ou vídeos · {mediaCount}/{MEDIA_MAX_COUNT} enviados)
                  </p>
                  <input
                    ref={mediaInputRef}
                    type="file"
                    accept="image/*,video/*"
                    multiple
                    className="hidden"
                    onChange={handleMedia}
                  />
                  <button
                    type="button"
                    onClick={() => mediaInputRef.current?.click()}
                    className="flex w-full flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed border-border bg-secondary/30 px-4 py-10 text-center transition-colors hover:border-primary/40 hover:bg-secondary/50"
                  >
                    <span className="flex items-center gap-3 text-muted-foreground">
                      <ImageIcon className="h-8 w-8" strokeWidth={1.5} />
                      <Video className="h-8 w-8" strokeWidth={1.5} />
                    </span>
                    <span className="text-sm text-muted-foreground">
                      Clique para selecionar imagens ou vídeos (vários arquivos
                      permitidos)
                    </span>
                  </button>
                  {draft.mediaFiles.length > 0 ? (
                    <ul className="space-y-1.5">
                      {draft.mediaFiles.map((file, index) => (
                        <li
                          key={`${file.name}-${index}`}
                          className="flex items-center justify-between gap-3 rounded-md border border-border bg-background px-3 py-2 text-sm"
                        >
                          <span className="flex min-w-0 items-center gap-2">
                            {file.kind === "video" ? (
                              <Video className="h-4 w-4 shrink-0 text-primary" />
                            ) : (
                              <ImageIcon className="h-4 w-4 shrink-0 text-primary" />
                            )}
                            <span className="truncate">{file.name}</span>
                          </span>
                          <button
                            type="button"
                            aria-label={`Remover ${file.name}`}
                            onClick={() => removeMedia(index)}
                            className="rounded p-1 text-muted-foreground hover:bg-secondary hover:text-foreground"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-3">
                    <label htmlFor="mensagem" className={labelClass}>
                      Texto da mensagem
                    </label>
                    <span className="text-xs tabular-nums text-muted-foreground">
                      {draft.message.length}/{MESSAGE_MAX_LENGTH}
                    </span>
                  </div>
                  <textarea
                    id="mensagem"
                    rows={6}
                    maxLength={MESSAGE_MAX_LENGTH}
                    value={draft.message}
                    onChange={(e) => patch({ message: e.target.value })}
                    placeholder="Olá! Temos uma novidade especial para você..."
                    className="flex min-h-[140px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none ring-ring placeholder:text-muted-foreground focus:ring-2"
                  />
                  <FieldError message={errors.message} />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="link-redirect" className={labelClass}>
                    Links de redirecionamento (opcional)
                  </label>
                  <div className="flex gap-2">
                    <input
                      id="link-redirect"
                      value={linkInput}
                      onChange={(e) => setLinkInput(e.target.value)}
                      onKeyDown={onLinkKeyDown}
                      placeholder="https://seusite.com.br/oferta"
                      className={inputClass}
                    />
                    <button
                      type="button"
                      onClick={addRedirectLink}
                      className={addBtnClass}
                    >
                      + Adicionar
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Cole o link e clique em Adicionar ou pressione Enter.
                  </p>
                  <ChipList
                    items={draft.redirectLinks}
                    onRemove={(index) =>
                      patch({
                        redirectLinks: draft.redirectLinks.filter(
                          (_, i) => i !== index,
                        ),
                      })
                    }
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="numeros-teste" className={labelClass}>
                    Números de teste (opcional · {draft.testNumbers.length}/
                    {TEST_NUMBERS_MAX})
                  </label>
                  <div className="flex gap-2">
                    <input
                      id="numeros-teste"
                      value={testNumberInput}
                      onChange={(e) => setTestNumberInput(e.target.value)}
                      onKeyDown={onTestNumberKeyDown}
                      placeholder="5547999989031"
                      className={inputClass}
                    />
                    <button
                      type="button"
                      onClick={addTestNumber}
                      className={addBtnClass}
                    >
                      + Adicionar
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Cole o celular com DDD e clique em Adicionar ou pressione
                    Enter. Vale 5547999989031, 47999989031 ou (47) 99998-9031 —
                    o formato não importa. A equipe usa estes números no disparo
                    de teste, antes do envio real.
                  </p>
                  <ChipList
                    items={draft.testNumbers}
                    onRemove={(index) =>
                      patch({
                        testNumbers: draft.testNumbers.filter(
                          (_, i) => i !== index,
                        ),
                      })
                    }
                  />
                  <FieldError message={errors.testNumbers} />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="observacoes" className={labelClass}>
                    Observações (opcional)
                  </label>
                  <textarea
                    id="observacoes"
                    rows={3}
                    value={draft.observacoes}
                    onChange={(e) => patch({ observacoes: e.target.value })}
                    placeholder="Informações adicionais para a equipe de envio..."
                    className="flex min-h-[88px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none ring-ring placeholder:text-muted-foreground focus:ring-2"
                  />
                </div>
              </section>
            ) : null}

            {step === 3 ? (
              <section className="space-y-5">
                <div>
                  <h2 className="font-display text-base font-semibold text-foreground">
                    Lista de Contatos
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Selecione uma lista salva ou envie um novo arquivo
                  </p>
                </div>

                <div className="border-b border-border">
                  <div className="flex gap-6">
                    <button
                      type="button"
                      onClick={() => setContactsTab("lista")}
                      className={`inline-flex items-center gap-2 border-b-2 pb-2.5 text-sm font-medium transition-colors ${
                        draft.contactSource === "lista"
                          ? "border-primary text-primary"
                          : "border-transparent text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <Database className="h-4 w-4" />
                      Minhas Listas
                      <span
                        className={`rounded-full px-1.5 py-0.5 text-[11px] font-semibold tabular-nums ${
                          draft.contactSource === "lista"
                            ? "bg-primary/15 text-primary"
                            : "bg-secondary text-muted-foreground"
                        }`}
                      >
                        {listas.length}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setContactsTab("arquivo")}
                      className={`inline-flex items-center gap-2 border-b-2 pb-2.5 text-sm font-medium transition-colors ${
                        draft.contactSource === "arquivo"
                          ? "border-primary text-primary"
                          : "border-transparent text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <Upload className="h-4 w-4" />
                      Upload Novo
                    </button>
                  </div>
                </div>

                {draft.contactSource === "lista" ? (
                  <div className="space-y-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                      <input
                        type="search"
                        value={listaSearch}
                        onChange={(e) => setListaSearch(e.target.value)}
                        placeholder="Buscar lista por nome..."
                        className={`${inputClass} sm:flex-1`}
                      />
                      <select
                        value={listaDateFilter}
                        onChange={(e) => setListaDateFilter(e.target.value)}
                        className={`${inputClass} sm:w-44`}
                        aria-label="Filtrar por data"
                      >
                        <option value="todas">Todas as datas</option>
                      </select>
                      <Link
                        href="/listas"
                        className="shrink-0 text-sm font-medium text-primary hover:underline"
                      >
                        Nova lista / biblioteca
                      </Link>
                    </div>

                    {filteredListas.length === 0 ? (
                      <div className="rounded-lg border border-dashed border-border px-4 py-10 text-center">
                        <Database className="mx-auto h-8 w-8 text-muted-foreground" />
                        <p className="mt-3 text-sm text-muted-foreground">
                          Nenhuma lista salva ainda.
                        </p>
                        <Link
                          href="/listas"
                          className="mt-2 inline-block text-sm font-semibold text-primary hover:underline"
                        >
                          Ir para Listas de Leads
                        </Link>
                      </div>
                    ) : (
                      <ul className="overflow-hidden rounded-lg border border-border">
                        {filteredListas.map((lista) => {
                          const selected = draft.listId === lista.id;
                          return (
                            <li key={lista.id} className="border-b border-border last:border-b-0">
                              <button
                                type="button"
                                onClick={() => handleSelectList(lista.id)}
                                className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-colors ${
                                  selected
                                    ? "bg-primary/5"
                                    : "hover:bg-secondary/60"
                                }`}
                              >
                                <FileText
                                  className={`h-4 w-4 shrink-0 ${
                                    selected
                                      ? "text-primary"
                                      : "text-muted-foreground"
                                  }`}
                                />
                                <span className="min-w-0 flex-1">
                                  <span className="block truncate text-sm font-medium text-foreground">
                                    {lista.name}
                                  </span>
                                  <span className="block text-xs text-muted-foreground">
                                    {lista.rows
                                      ? `${lista.rows} linhas · `
                                      : null}
                                    {lista.date}
                                  </span>
                                </span>
                                {selected ? (
                                  <Check className="h-4 w-4 shrink-0 text-primary" />
                                ) : null}
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <input
                      ref={contactsInputRef}
                      type="file"
                      accept=".csv,.xls,.xlsx,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv"
                      className="hidden"
                      onChange={handleContactsFile}
                    />
                    <button
                      type="button"
                      onClick={() => contactsInputRef.current?.click()}
                      onDragOver={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        const file = e.dataTransfer.files?.[0];
                        if (!file || !contactsInputRef.current) return;
                        const dt = new DataTransfer();
                        dt.items.add(file);
                        contactsInputRef.current.files = dt.files;
                        handleContactsFile({
                          target: contactsInputRef.current,
                        } as ChangeEvent<HTMLInputElement>);
                      }}
                      className="flex w-full flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed border-border bg-secondary/20 px-4 py-16 text-center transition-colors hover:border-primary/40 hover:bg-secondary/40"
                    >
                      <Upload
                        className="h-10 w-10 text-muted-foreground"
                        strokeWidth={1.5}
                      />
                      <span className="text-sm font-medium text-foreground">
                        Arraste ou clique para selecionar
                      </span>
                      <span className="text-xs text-muted-foreground">
                        CSV, XLS ou XLSX · máximo 50MB
                      </span>
                    </button>
                    {draft.fileName ? (
                      <p className="text-sm text-primary">
                        {draft.fileName} ·{" "}
                        {draft.contactCount.toLocaleString("pt-BR")} contatos
                        detectados
                      </p>
                    ) : null}
                  </div>
                )}

                <FieldError message={errors.contacts} />
              </section>
            ) : null}

            {step === 4 ? (
              <section className="space-y-5">
                <div>
                  <h2 className="font-display flex items-center gap-2 text-base font-semibold text-foreground">
                    <CalendarClock className="h-4 w-4 text-primary" />
                    Agendamento
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Defina quando o disparo começa e o intervalo entre mensagens.
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  {(
                    [
                      ["agora", "Enviar agora", "Inicia assim que confirmar"],
                      [
                        "agendar",
                        "Agendar",
                        "Escolha data e horário de início",
                      ],
                    ] as const
                  ).map(([key, title, hint]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => patch({ scheduleMode: key })}
                      className={`rounded-lg border px-4 py-3 text-left transition-colors ${
                        draft.scheduleMode === key
                          ? "border-primary bg-primary/5"
                          : "border-border hover:bg-secondary"
                      }`}
                    >
                      <p className="text-sm font-semibold text-foreground">
                        {title}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {hint}
                      </p>
                    </button>
                  ))}
                </div>

                {draft.scheduleMode === "agendar" ? (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <label htmlFor="data" className={labelClass}>
                        Data
                      </label>
                      <input
                        id="data"
                        type="date"
                        value={draft.scheduleDate}
                        onChange={(e) =>
                          patch({ scheduleDate: e.target.value })
                        }
                        className={inputClass}
                      />
                      <FieldError message={errors.scheduleDate} />
                    </div>
                    <div className="space-y-1.5">
                      <label htmlFor="hora" className={labelClass}>
                        Horário
                      </label>
                      <input
                        id="hora"
                        type="time"
                        value={draft.scheduleTime}
                        onChange={(e) =>
                          patch({ scheduleTime: e.target.value })
                        }
                        className={inputClass}
                      />
                      <FieldError message={errors.scheduleTime} />
                    </div>
                  </div>
                ) : null}

                <div className="space-y-1.5">
                  <label htmlFor="intervalo" className={labelClass}>
                    Intervalo entre mensagens (segundos)
                  </label>
                  <input
                    id="intervalo"
                    type="number"
                    min={3}
                    max={120}
                    value={draft.intervalSeconds}
                    onChange={(e) =>
                      patch({
                        intervalSeconds: Number(e.target.value) || 0,
                      })
                    }
                    className={`${inputClass} max-w-[160px]`}
                  />
                  <p className="text-xs text-muted-foreground">
                    Recomendado: 5–15s. Intervalos maiores reduzem risco de
                    bloqueio.
                  </p>
                  <FieldError message={errors.intervalSeconds} />
                </div>

                <div className="rounded-lg border border-border bg-secondary/40 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Resumo
                  </p>
                  <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
                    <div>
                      <dt className="text-muted-foreground">Nome</dt>
                      <dd className="font-medium">{draft.name || "—"}</dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Empresa</dt>
                      <dd className="font-medium">
                        {draft.companyName ||
                          resolveCompanyName(draft.companyId) ||
                          "—"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Perfil</dt>
                      <dd className="font-medium">
                        {draft.profileName || "—"} · DDD {draft.ddd || "—"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Contatos</dt>
                      <dd className="font-medium tabular-nums">
                        {draft.contactCount.toLocaleString("pt-BR")}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Mídias</dt>
                      <dd className="font-medium">
                        {draft.mediaFiles.length > 0
                          ? `${draft.mediaFiles.length} arquivo(s)`
                          : "—"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Números de teste</dt>
                      <dd className="font-medium tabular-nums">
                        {draft.testNumbers.length || "—"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Início</dt>
                      <dd className="font-medium">
                        {draft.scheduleMode === "agora"
                          ? "Imediatamente"
                          : draft.scheduleDate && draft.scheduleTime
                            ? `${draft.scheduleDate.split("-").reverse().join("/")} às ${draft.scheduleTime}`
                            : "—"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Duração estimada</dt>
                      <dd className="font-medium">
                        ~{estimatedDurationMin.toLocaleString("pt-BR")} min
                      </dd>
                    </div>
                  </dl>
                </div>
              </section>
            ) : null}

            <div className="flex flex-wrap items-center gap-3 border-t border-border pt-5">
              <button
                type="button"
                onClick={goBack}
                className="inline-flex h-10 items-center justify-center rounded-md border border-border bg-background px-4 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
              >
                Voltar
              </button>

              {step < 4 ? (
                <button
                  type="button"
                  onClick={goNext}
                  className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground shadow-micro transition-opacity hover:opacity-90"
                >
                  Continuar
                </button>
              ) : (
                <>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground shadow-micro transition-opacity hover:opacity-90 disabled:opacity-60"
                  >
                    {draft.scheduleMode === "agendar"
                      ? "Agendar disparo"
                      : "Iniciar disparo"}
                  </button>
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={(e) => handleSubmit(e, true)}
                    className="inline-flex h-10 items-center justify-center rounded-md border border-border bg-background px-4 text-sm font-medium text-foreground transition-colors hover:bg-secondary disabled:opacity-60"
                  >
                    Salvar rascunho
                  </button>
                </>
              )}
            </div>
          </form>
        </Card>
      </div>
    </AppShell>
  );
}

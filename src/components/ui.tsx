import Link from "next/link";

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-[1.75rem]">
          {title}
        </h1>
        {subtitle ? (
          <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
        ) : null}
      </div>
      {action}
    </div>
  );
}

export function PrimaryButtonLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground shadow-micro transition-opacity hover:opacity-90"
    >
      {children}
    </Link>
  );
}

export function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-lg border border-border bg-card text-card-foreground shadow-micro ${className}`}
    >
      {children}
    </div>
  );
}

export function StatusBadge({
  status,
  variant = "default",
}: {
  status: string;
  variant?: "default" | "success" | "muted";
}) {
  const styles =
    variant === "success"
      ? "bg-success/10 text-success ring-success/20"
      : variant === "muted"
        ? "bg-muted text-muted-foreground ring-muted/30"
        : "bg-secondary text-secondary-foreground ring-border";

  return (
    <span
      className={`inline-flex max-w-full shrink-0 items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold tracking-wide ring-1 ring-inset ${styles}`}
    >
      {status}
    </span>
  );
}

export function PaginationFooter({
  page = 1,
  totalPages = 1,
  totalRecords,
}: {
  page?: number;
  totalPages?: number;
  totalRecords: number;
}) {
  return (
    <div className="flex flex-col gap-2 border-t px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-xs text-muted-foreground">
        Página {page} de {totalPages} · {totalRecords} registos
      </p>
      <div className="flex gap-2">
        <button
          type="button"
          disabled
          className="inline-flex h-8 items-center justify-center whitespace-nowrap rounded-md border border-input bg-background px-3 text-xs font-medium text-foreground opacity-50"
        >
          Anterior
        </button>
        <button
          type="button"
          disabled
          className="inline-flex h-8 items-center justify-center whitespace-nowrap rounded-md border border-input bg-background px-3 text-xs font-medium text-foreground opacity-50"
        >
          Seguinte
        </button>
      </div>
    </div>
  );
}

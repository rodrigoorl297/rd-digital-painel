import { Suspense } from "react";
import DisparosPage from "./page-client";

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center text-sm text-muted-foreground">
          Carregando…
        </div>
      }
    >
      <DisparosPage />
    </Suspense>
  );
}

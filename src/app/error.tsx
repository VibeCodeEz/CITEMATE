"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";

import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
    Sentry.captureException(error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[linear-gradient(180deg,#fcfaf3_0%,#f3efe4_100%)] px-4">
      <div className="max-w-xl space-y-4 rounded-[2rem] border border-border bg-background p-8 text-center shadow-lg">
        <h1 className="font-serif text-4xl tracking-tight">Something went wrong</h1>
        <p className="text-sm leading-6 text-muted-foreground">
          CiteMate hit an unexpected error. Try reloading the page after
          checking your Supabase environment variables and database setup.
        </p>
        <Button onClick={reset}>Try again</Button>
      </div>
    </div>
  );
}

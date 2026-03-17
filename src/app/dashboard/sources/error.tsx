"use client";

import { useEffect } from "react";

import { Button } from "@/components/ui/button";

export default function SourcesError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="rounded-[2rem] border border-destructive/20 bg-background/90 p-8 shadow-sm">
      <div className="space-y-3">
        <h2 className="font-serif text-3xl tracking-tight">Sources failed to load</h2>
        <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
          CiteMate could not load the source library right now. Try again, and
          if the problem continues, confirm that the Supabase schema includes
          the latest source fields.
        </p>
      </div>
      <Button className="mt-5" onClick={reset}>
        Try again
      </Button>
    </div>
  );
}

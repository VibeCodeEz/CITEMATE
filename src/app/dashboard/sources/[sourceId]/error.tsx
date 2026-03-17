"use client";

import { useEffect } from "react";
import Link from "next/link";

import { EmptyState } from "@/components/app/empty-state";
import { Button } from "@/components/ui/button";

type SourceDetailsErrorProps = {
  error: Error;
  reset: () => void;
};

export default function SourceDetailsError({
  error,
  reset,
}: SourceDetailsErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <EmptyState
      title="Source details are unavailable"
      description="We couldn't load this source right now. Try again, or head back to the library and reopen it."
      action={
        <div className="flex flex-wrap gap-3">
          <Button type="button" onClick={reset}>
            Try again
          </Button>
          <Button variant="outline" asChild>
            <Link href="/dashboard/sources">Back to sources</Link>
          </Button>
        </div>
      }
    />
  );
}

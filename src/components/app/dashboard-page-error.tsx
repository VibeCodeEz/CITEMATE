"use client";

import { useEffect } from "react";

import { EmptyState } from "@/components/app/empty-state";
import { Button } from "@/components/ui/button";

type DashboardPageErrorProps = {
  error: Error;
  reset: () => void;
  title: string;
  description: string;
};

export function DashboardPageError({
  error,
  reset,
  title,
  description,
}: DashboardPageErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <EmptyState
      title={title}
      description={description}
      action={
        <Button type="button" onClick={reset}>
          Try again
        </Button>
      }
    />
  );
}

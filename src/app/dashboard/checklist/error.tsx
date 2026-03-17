"use client";

import { DashboardPageError } from "@/components/app/dashboard-page-error";

type ChecklistErrorProps = {
  error: Error;
  reset: () => void;
};

export default function ChecklistError({
  error,
  reset,
}: ChecklistErrorProps) {
  return (
    <DashboardPageError
      error={error}
      reset={reset}
      title="Checklist unavailable"
      description="We couldn't load your writing review checklist right now. Try again in a moment."
    />
  );
}

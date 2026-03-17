"use client";

import { DashboardPageError } from "@/components/app/dashboard-page-error";

type NotesErrorProps = {
  error: Error;
  reset: () => void;
};

export default function NotesError({ error, reset }: NotesErrorProps) {
  return (
    <DashboardPageError
      error={error}
      reset={reset}
      title="Notes unavailable"
      description="We couldn't load your saved notes right now. Try again in a moment."
    />
  );
}

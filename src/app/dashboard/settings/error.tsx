"use client";

import { DashboardPageError } from "@/components/app/dashboard-page-error";

export default function SettingsError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <DashboardPageError
      error={error}
      reset={reset}
      title="We could not load account settings"
      description={error.message}
    />
  );
}

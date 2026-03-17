"use client";

import { DashboardPageError } from "@/components/app/dashboard-page-error";

type SubjectsErrorProps = {
  error: Error;
  reset: () => void;
};

export default function SubjectsError({
  error,
  reset,
}: SubjectsErrorProps) {
  return (
    <DashboardPageError
      error={error}
      reset={reset}
      title="Subjects unavailable"
      description="We couldn't load your subjects right now. Try again in a moment."
    />
  );
}

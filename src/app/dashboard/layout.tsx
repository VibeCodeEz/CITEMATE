import type { ReactNode } from "react";

import { DashboardShell } from "@/components/app/dashboard-shell";
import { getDashboardShellData } from "@/lib/data/citemate";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const shellData = await getDashboardShellData();

  return (
    <DashboardShell fullName={shellData.fullName} email={shellData.email}>
      {children}
    </DashboardShell>
  );
}

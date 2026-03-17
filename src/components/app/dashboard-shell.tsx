import type { ReactNode } from "react";

import { AppFooter } from "@/components/app/app-footer";
import { AppNavbar } from "@/components/app/app-navbar";
import { AppSidebar } from "@/components/app/app-sidebar";

type DashboardShellProps = {
  children: ReactNode;
  fullName: string;
  email: string;
};

export function DashboardShell({
  children,
  fullName,
  email,
}: DashboardShellProps) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(15,118,110,0.16),_transparent_40%),linear-gradient(180deg,#fcfaf3_0%,#f7f3ea_100%)]">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-3 py-3 sm:px-6 sm:py-4 lg:px-8">
        <AppNavbar fullName={fullName} email={email} />
        <div className="flex flex-1 flex-col gap-6 py-6 lg:grid lg:grid-cols-[260px_minmax(0,1fr)]">
          <AppSidebar />
          <main className="min-w-0">{children}</main>
        </div>
        <AppFooter />
      </div>
    </div>
  );
}

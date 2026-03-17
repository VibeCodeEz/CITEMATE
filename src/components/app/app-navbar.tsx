import Link from "next/link";

import { AppLogo } from "@/components/app/app-logo";
import { SignOutButton } from "@/components/app/sign-out-button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

type AppNavbarProps = {
  fullName: string;
  email: string;
};

export function AppNavbar({ fullName, email }: AppNavbarProps) {
  const initials = fullName
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <header className="rounded-[2rem] border border-border/70 bg-background/90 p-5 shadow-lg shadow-teal-950/5 backdrop-blur">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <AppLogo href="/dashboard" />
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/dashboard/sources"
            className="rounded-full border border-border px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            Quick add source
          </Link>
          <div className="flex items-center gap-3 rounded-full border border-border/80 bg-secondary/50 px-3 py-2">
            <Avatar className="size-10 border border-border bg-background">
              <AvatarFallback>{initials || "CM"}</AvatarFallback>
            </Avatar>
            <div className="hidden min-w-0 sm:block">
              <p className="truncate text-sm font-semibold">{fullName}</p>
              <p className="truncate text-xs text-muted-foreground">{email}</p>
            </div>
          </div>
          <SignOutButton />
        </div>
      </div>
    </header>
  );
}

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
    <header className="rounded-[2rem] border border-border/70 bg-background/90 p-4 shadow-lg shadow-teal-950/5 backdrop-blur sm:p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <AppLogo href="/dashboard" />
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
          <Link
            href="/dashboard/sources"
            className="inline-flex items-center justify-center rounded-full border border-border px-4 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            Quick add source
          </Link>
          <div className="flex min-w-0 items-center gap-3 rounded-full border border-border/80 bg-secondary/50 px-3 py-2">
            <Avatar className="size-10 border border-border bg-background">
              <AvatarFallback>{initials || "CM"}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{fullName}</p>
              <p className="truncate text-xs text-muted-foreground sm:max-w-[14rem]">
                {email}
              </p>
            </div>
          </div>
          <SignOutButton />
        </div>
      </div>
    </header>
  );
}

import Link from "next/link";

import { cn } from "@/lib/utils";

type AppLogoProps = {
  href?: string;
  className?: string;
};

export function AppLogo({ href = "/", className }: AppLogoProps) {
  return (
    <Link
      href={href}
      className={cn("inline-flex items-center gap-3 text-left", className)}
    >
      <span className="flex size-11 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,var(--color-accent-signal),var(--color-primary))] text-sm font-semibold text-white shadow-lg shadow-teal-900/20">
        CM
      </span>
      <span>
        <span className="block font-serif text-2xl leading-none tracking-tight">
          CiteMate
        </span>
        <span className="block text-xs uppercase tracking-[0.24em] text-muted-foreground">
          Research, cited clearly
        </span>
      </span>
    </Link>
  );
}

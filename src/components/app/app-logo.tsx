import Image from "next/image";
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
      <span className="relative size-11 shrink-0 overflow-hidden rounded-2xl border border-border/70 bg-background shadow-lg shadow-teal-900/10">
        <Image
          src="/img/Tab Logo - CiteMate.png"
          alt="CiteMate logo"
          fill
          sizes="44px"
          className="object-cover"
          priority
        />
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

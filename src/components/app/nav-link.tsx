"use client";

import Link, { type LinkProps } from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type NavLinkProps = LinkProps & {
  children: ReactNode;
  className?: string;
  exact?: boolean;
};

export function NavLink({
  children,
  className,
  exact = false,
  href,
  ...props
}: NavLinkProps) {
  const pathname = usePathname();
  const target = typeof href === "string" ? href : href.pathname ?? "/";
  const active = exact ? pathname === target : pathname.startsWith(target);

  return (
    <Link
      href={href}
      className={cn(
        "inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium transition-colors",
        active
          ? "bg-primary text-primary-foreground shadow-sm"
          : "text-muted-foreground hover:bg-secondary hover:text-foreground",
        className,
      )}
      {...props}
    >
      {children}
    </Link>
  );
}

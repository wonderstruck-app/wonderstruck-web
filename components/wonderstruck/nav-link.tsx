"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { primaryNav, secondaryNav } from "./nav-items";

const allNav = [...primaryNav, ...secondaryNav];
const findItem = (href: string) => allNav.find((n) => n.href === href)!;

export function SidebarNavLink({
  href,
  badge,
}: {
  href: string;
  badge?: string;
}) {
  const item = findItem(href);
  const pathname = usePathname();
  const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "squircle-sm group flex h-12 items-center gap-3 px-3.5 text-[0.9375rem] font-medium text-muted-foreground transition-colors outline-none hover:bg-white/5 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring",
        active &&
          "bg-sidebar-accent font-semibold text-sidebar-accent-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
      )}
    >
      <Icon
        aria-hidden
        className={cn("size-5 stroke-[1.85]", active && "text-primary")}
      />
      <span className="flex-1">{item.label}</span>
      {badge && (
        <span className="inline-grid h-6 min-w-6 place-items-center rounded-full bg-tint-honey/20 px-1.5 text-xs leading-none font-bold text-tint-honey tabular-nums ring-1 ring-tint-honey/25">
          {badge}
        </span>
      )}
    </Link>
  );
}

export function BottomNavLink({ href }: { href: string }) {
  const item = findItem(href);
  const pathname = usePathname();
  const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "squircle-sm flex min-h-14 flex-1 flex-col items-center justify-center gap-1 text-[0.6875rem] font-medium text-muted-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring",
        active && "text-primary",
      )}
    >
      <Icon
        aria-hidden
        className={cn("size-5 stroke-[1.85]", active && "text-primary")}
      />
      {item.label}
    </Link>
  );
}

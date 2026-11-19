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
        item.accent,
        "squircle-sm group flex h-12 items-center gap-3 px-3.5 text-[0.9375rem] font-medium text-muted-foreground transition-colors outline-none hover:bg-ink/5 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring",
        active &&
          "bg-primary/12 font-medium text-primary-ink hover:bg-primary/12 hover:text-primary-ink",
      )}
    >
      <Icon
        aria-hidden
        className="size-5 stroke-[1.85]"
      />
      <span className="flex-1">{item.label}</span>
      {badge && (
        <span className="inline-grid h-6 min-w-6 place-items-center rounded-full bg-tint-violet/20 px-1.5 text-xs leading-none font-semibold text-tint-violet tabular-nums ring-1 ring-tint-violet/25">
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
        item.accent,
        "squircle-sm flex min-h-14 flex-1 flex-col items-center justify-center gap-1 text-[0.6875rem] font-medium text-muted-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring",
        active && "text-primary-ink",
      )}
    >
      <Icon
        aria-hidden
        className="size-5 stroke-[1.85]"
      />
      {item.label}
    </Link>
  );
}

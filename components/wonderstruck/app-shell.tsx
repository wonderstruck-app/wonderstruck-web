import Link from "next/link";
import { Suspense, type ReactNode } from "react";
import { Settings } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Learner } from "@/lib/data";
import { BrandMark } from "./brand";
import { ThemeToggle } from "./theme-toggle";
import { primaryNav, secondaryNav } from "./nav-items";
import { BottomNavLink, SidebarNavLink } from "./nav-link";

function SidebarNav({ recallDue }: { recallDue: number }) {
  return (
    <>
      <ul className="flex flex-col gap-1">
        {primaryNav.map((item) => (
          <li key={item.href}>
            <SidebarNavLink
              href={item.href}
              badge={
                item.href === "/remember" && recallDue > 0
                  ? String(recallDue)
                  : undefined
              }
            />
          </li>
        ))}
      </ul>
      <div className="my-4 h-px bg-ink/8" />
      <ul className="flex flex-col gap-1">
        {secondaryNav.map((item) => (
          <li key={item.href}>
            <SidebarNavLink href={item.href} />
          </li>
        ))}
      </ul>
    </>
  );
}

export type ShellData = {
  learner: Learner;
  recallDue: number;
};

export function AppShell({
  children,
  data: { learner, recallDue },
}: {
  children: ReactNode;
  data: ShellData;
}) {
  return (
    <div className="relative isolate mx-auto flex min-h-dvh w-full max-w-[96rem]">
      <aside className="sticky top-0 hidden h-dvh w-[17.5rem] shrink-0 py-6 pl-4 lg:block">
        <div className="glass glass-panel squircle-lg flex h-full flex-col px-4 pt-4 pb-6">
          <Link
            href="/dashboard"
            className="squircle-sm mb-4 flex items-center self-start px-2 py-2 outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <BrandMark />
          </Link>

          <nav aria-label="Primary">
            <Suspense>
              <SidebarNav recallDue={recallDue} />
            </Suspense>
          </nav>

          <div className="mt-auto border-t border-ink/8 pt-4">
            <div className="flex items-center gap-2.5 pl-2">
              <Avatar className="size-9">
                <AvatarFallback className="bg-primary/15 text-xs font-semibold text-primary-ink">
                  {learner.initials}
                </AvatarFallback>
              </Avatar>
              <p className="min-w-0 flex-1 truncate text-[0.9375rem] font-medium">
                {learner.name}
              </p>
              <ThemeToggle className="size-8 shrink-0" />
              <Button variant="ghost" size="icon" className="size-8 shrink-0" asChild>
                <Link href="/settings" aria-label="Settings">
                  <Settings aria-hidden className="size-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-border bg-white/85 px-4 backdrop-blur-sm lg:hidden dark:border-white/8 dark:bg-[oklch(0.115_0.006_265/0.62)] dark:backdrop-blur-2xl dark:backdrop-saturate-150">
          <Link
            href="/dashboard"
            className="squircle-sm flex items-center outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <BrandMark />
          </Link>
          <div className="flex items-center gap-1">
          <ThemeToggle className="size-11" />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="size-11 p-0"
                aria-label="Account and more"
              >
                <Avatar className="size-8">
                  <AvatarFallback className="bg-primary/15 text-xs font-semibold text-primary-ink">
                    {learner.initials}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              sideOffset={10}
              className="squircle-md w-64 border border-border bg-popover p-2 shadow-2xl ring-ink/10"
            >
              <DropdownMenuLabel className="flex items-center gap-3 px-2.5 py-2.5">
                <Avatar className="size-10">
                  <AvatarFallback className="bg-primary/15 text-sm font-semibold text-primary-ink">
                    {learner.initials}
                  </AvatarFallback>
                </Avatar>
                <span className="min-w-0 truncate text-[0.9375rem] font-medium text-foreground">
                  {learner.name}
                </span>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="mx-1 my-2 bg-ink/8" />
              {[
                ...secondaryNav,
                { href: "/settings", label: "Settings", icon: Settings },
              ].map((item) => (
                <DropdownMenuItem
                  key={item.href}
                  asChild
                  className="gap-3 rounded-xl px-2.5 py-2 text-[0.9375rem] font-medium focus:bg-ink/[0.07]"
                >
                  <Link href={item.href}>
                    <span className="squircle-sm grid size-8 place-items-center border border-ink/8 bg-ink/[0.05]">
                      <item.icon aria-hidden className="size-4" />
                    </span>
                    {item.label}
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          </div>
        </header>

        <main className="flex-1 pb-28 lg:pb-0">{children}</main>

        <nav
          aria-label="Primary"
          className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-white/85 px-2 pt-1 pb-[max(0.25rem,env(safe-area-inset-bottom))] backdrop-blur-sm lg:hidden dark:border-white/8 dark:bg-[oklch(0.115_0.006_265/0.62)] dark:backdrop-blur-2xl dark:backdrop-saturate-150"
        >
          <Suspense>
            <ul className="flex">
              {primaryNav.map((item) => (
                <li key={item.href} className="flex flex-1">
                  <BottomNavLink href={item.href} />
                </li>
              ))}
            </ul>
          </Suspense>
        </nav>
      </div>
    </div>
  );
}

"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** Flips light and dark. Icons swap with CSS so server and client markup match. */
export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      aria-label="Switch light or dark theme"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      className={cn(className)}
    >
      <Sun aria-hidden className="hidden size-5 dark:block" />
      <Moon aria-hidden className="size-5 dark:hidden" />
    </Button>
  );
}

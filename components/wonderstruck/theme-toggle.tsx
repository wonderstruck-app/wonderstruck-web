"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const themes = [
  { value: "light", label: "Light", Icon: Sun },
  { value: "dark", label: "Dark", Icon: Moon },
  { value: "system", label: "System", Icon: Monitor },
] as const;

const hideCheck = "[&>[data-slot=dropdown-menu-radio-item-indicator]]:hidden";

/** Opens Light, Dark and System. The trigger icon swaps with CSS so server and client markup match. */
export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button type="button" variant="ghost" size="icon" aria-label="Theme" className={cn(className)}>
          <Moon aria-hidden className="hidden size-5 dark:block" />
          <Sun aria-hidden className="size-5 dark:hidden" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="squircle-md min-w-40 border border-border bg-popover p-1.5 shadow-2xl ring-ink/10"
      >
        <DropdownMenuRadioGroup value={theme} onValueChange={setTheme}>
          {themes.map(({ value, label, Icon }) => (
            <DropdownMenuRadioItem
              key={value}
              value={value}
              className="gap-3 rounded-xl py-2 pl-2.5 text-[0.9375rem] font-medium focus:bg-ink/[0.07]"
            >
              <Icon aria-hidden className="size-4 text-muted-foreground" />
              {label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/** Account-menu row: a label with an inline Light / Dark / System segmented control. */
export function ThemeMenuItem({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  return (
    <div className={cn("flex items-center justify-between", className, "focus:bg-transparent")}>
      <span className="flex items-center gap-3">
        <span className="squircle-sm grid size-8 place-items-center border border-ink/8 bg-ink/[0.05]">
          <Sun aria-hidden className="size-4 dark:hidden" />
          <Moon aria-hidden className="hidden size-4 dark:block" />
        </span>
        Theme
      </span>
      <DropdownMenuRadioGroup
        value={theme}
        onValueChange={setTheme}
        aria-label="Theme"
        className="squircle-sm flex shrink-0 gap-0.5 border border-ink/8 bg-ink/[0.04] p-0.5"
      >
        {themes.map(({ value, label, Icon }) => (
          <DropdownMenuRadioItem
            key={value}
            value={value}
            aria-label={label}
            title={label}
            onSelect={(event) => event.preventDefault()}
            className={cn(
              "squircle-sm grid size-7 place-items-center p-0 text-muted-foreground focus:bg-ink/[0.08] focus:text-foreground data-[state=checked]:bg-background data-[state=checked]:text-foreground data-[state=checked]:shadow-sm data-[state=checked]:ring-1 data-[state=checked]:ring-ink/12 dark:data-[state=checked]:bg-ink/[0.14]",
              hideCheck,
            )}
          >
            <Icon aria-hidden className="size-3.5" />
          </DropdownMenuRadioItem>
        ))}
      </DropdownMenuRadioGroup>
    </div>
  );
}

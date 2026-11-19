import {
  Bookmark,
  BookOpenText,
  Compass,
  House,
  RotateCcw,
  Waypoints,
  type LucideIcon,
} from "lucide-react";

/** `accent` scopes the section colour (see the accent-* classes); Today keeps Mira cream. */
export type NavItem = { href: string; label: string; icon: LucideIcon; accent?: string };

export const primaryNav: NavItem[] = [
  { href: "/dashboard", label: "Today", icon: House },
  { href: "/discover", label: "Discover", icon: Compass, accent: "accent-blue" },
  { href: "/sessions", label: "Sessions", icon: BookOpenText, accent: "accent-green" },
  { href: "/remember", label: "Recall", icon: RotateCcw, accent: "accent-violet" },
  { href: "/graph", label: "Graph", icon: Waypoints, accent: "accent-teal" },
];

export const secondaryNav: NavItem[] = [
  { href: "/saved", label: "Saved", icon: Bookmark, accent: "accent-rose" },
];

import {
  Bookmark,
  BookOpenText,
  Compass,
  House,
  RotateCcw,
  Waypoints,
  type LucideIcon,
} from "lucide-react";

export type NavItem = { href: string; label: string; icon: LucideIcon };

export const primaryNav: NavItem[] = [
  { href: "/dashboard", label: "Today", icon: House },
  { href: "/discover", label: "Discover", icon: Compass },
  { href: "/sessions", label: "Sessions", icon: BookOpenText },
  { href: "/remember", label: "Recall", icon: RotateCcw },
  { href: "/graph", label: "Graph", icon: Waypoints },
];

export const secondaryNav: NavItem[] = [
  { href: "/saved", label: "Saved", icon: Bookmark },
];

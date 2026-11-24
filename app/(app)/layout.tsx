import { AppShell } from "@/components/wonderstruck/app-shell";
import { RecallBadge } from "@/components/wonderstruck/nav-link";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <AppShell recallBadge={<RecallBadge />}>{children}</AppShell>;
}

import { AppShell } from "@/components/wonderstruck/app-shell";
import { getLearner, getRecallQueue } from "@/lib/data";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [learner, recall] = await Promise.all([getLearner(), getRecallQueue()]);

  return (
    <AppShell
      data={{
        learner,
        recallDue: recall.length,
      }}
    >
      {children}
    </AppShell>
  );
}

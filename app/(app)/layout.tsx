import { AppShell } from "@/components/wonderstruck/app-shell";
import {
  getGraph,
  getLearner,
  getRecallQueue,
  getWeeklyRecap,
} from "@/lib/data";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [learner, recall, graph, weeklyRecap] = await Promise.all([
    getLearner(),
    getRecallQueue(),
    getGraph(),
    getWeeklyRecap(),
  ]);

  return (
    <AppShell
      data={{
        learner,
        recallDue: recall.length,
        conceptCount: graph.concepts.length,
        weeklyRecap,
      }}
    >
      {children}
    </AppShell>
  );
}

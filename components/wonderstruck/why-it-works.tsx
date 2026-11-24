import { Lightbulb, Timer, Waypoints } from "lucide-react";
import { IconKey } from "./icon-key";
import { Tinted } from "./tinted";

const reasons = [
  { icon: <Timer />, tone: "honey", title: "Spaced out", text: "Each idea returns just before you'd forget it." },
  { icon: <Lightbulb />, tone: "violet", title: "Effort helps", text: "A hard-won answer sticks better than an easy reread." },
  { icon: <Waypoints />, tone: "teal", title: "Feeds your graph", text: "Recalled ideas move from discussed toward demonstrated." },
] as const;

/** Static explainer under the recall session. */
export function WhyItWorks() {
  return (
    <section aria-labelledby="how-title" className="mt-10">
      <h2 id="how-title" className="text-[1.1875rem] font-semibold">
        Why it works
      </h2>
      <div className="mt-3.5 grid gap-3 sm:grid-cols-3">
        {reasons.map((t) => (
          <Tinted key={t.title} tone={t.tone} className="squircle-lg flex gap-3.5 p-4 sm:flex-col sm:gap-4 sm:p-5">
            <IconKey tone={t.tone}>{t.icon}</IconKey>
            <div>
              <p className="font-semibold">{t.title}</p>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{t.text}</p>
            </div>
          </Tinted>
        ))}
      </div>
    </section>
  );
}

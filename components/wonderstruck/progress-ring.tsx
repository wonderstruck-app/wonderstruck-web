export function ProgressRing({
  done,
  total,
  className = "size-16",
}: {
  done: number;
  total: number;
  className?: string;
}) {
  const r = 24;
  const c = 2 * Math.PI * r;
  return (
    <div className={`relative grid shrink-0 place-items-center ${className}`}>
      <svg viewBox="0 0 60 60" className="absolute inset-0 -rotate-90" aria-hidden>
        <circle cx="30" cy="30" r={r} fill="none" strokeWidth="6" className="stroke-secondary" />
        <circle
          cx="30"
          cy="30"
          r={r}
          fill="none"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - (total ? done / total : 0))}
          className="stroke-tint-violet transition-[stroke-dashoffset] duration-700 ease-out motion-reduce:transition-none"
        />
      </svg>
      <span className="text-sm font-bold tabular-nums">
        {done}/{total}
      </span>
    </div>
  );
}

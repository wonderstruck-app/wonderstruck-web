// Human labels for API timestamps ("Yesterday", "In 3 days"). Computed per request, in the
// server's time zone.

const DAY = 24 * 60 * 60 * 1000;

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();

/** Whole calendar days from `now` to `date`; negative is the past. */
const dayOffset = (date: Date, now: Date) => Math.round((startOfDay(date) - startOfDay(now)) / DAY);

const weekday = new Intl.DateTimeFormat("en-GB", { weekday: "long" });
const dayMonth = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short" });

/** "Today", "Yesterday", a weekday within the last week, otherwise "8 Nov". */
export function dayLabel(iso: string, now: Date): string {
  const date = new Date(iso);
  const offset = dayOffset(date, now);
  if (offset === 0) return "Today";
  if (offset === -1) return "Yesterday";
  if (offset > -7 && offset < 0) return weekday.format(date);
  return dayMonth.format(date);
}

/** "just now", "5 minutes ago", "2 hours ago", then falls back to the day. */
export function agoLabel(iso: string, now: Date): string {
  const minutes = Math.floor((now.getTime() - new Date(iso).getTime()) / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} ${minutes === 1 ? "minute" : "minutes"} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 12) return `${hours} ${hours === 1 ? "hour" : "hours"} ago`;
  return inline(dayLabel(iso, now));
}

/** When a review is next due: "Now", "Later today", "Tomorrow", "In 6 days". */
export function dueLabel(iso: string, now: Date): string {
  const date = new Date(iso);
  if (date.getTime() <= now.getTime()) return "Now";
  const offset = dayOffset(date, now);
  if (offset === 0) return "Later today";
  if (offset === 1) return "Tomorrow";
  return `In ${offset} days`;
}

/** Labels that read mid-sentence keep proper nouns ("Saved Thursday", "Saved today"). */
export const inline = (label: string) =>
  label === "Today" || label === "Yesterday" ? label.toLowerCase() : label;

export const isThisWeek = (iso: string, now: Date) => dayOffset(new Date(iso), now) > -7;

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getLearner } from "@/lib/data";
import { cn } from "@/lib/utils";
import { SignOutButton } from "./sign-out";

export { AvatarPlaceholder, NamePlaceholder, ProfilePlaceholder } from "./skeleton";

/**
 * Session-backed identity bits for the app chrome. Each reads the session itself (deduplicated
 * per request), so render them inside <Suspense> and the shell around them stays static.
 */
export async function LearnerAvatar({
  className,
  fallbackClassName,
}: {
  className?: string;
  fallbackClassName?: string;
}) {
  const learner = await getLearner();
  return (
    <Avatar className={className}>
      {learner.image && (
        <AvatarImage src={learner.image} alt="" referrerPolicy="no-referrer" />
      )}
      <AvatarFallback
        className={cn("bg-primary/15 font-semibold text-primary-ink", fallbackClassName)}
      >
        {learner.initials}
      </AvatarFallback>
    </Avatar>
  );
}

export async function LearnerName() {
  return (await getLearner()).name;
}

export async function LearnerFirstName() {
  return (await getLearner()).firstName;
}

/** Settings profile row: photo, name, email and sign out. */
export async function LearnerProfile() {
  const learner = await getLearner();
  return (
    <div className="flex flex-wrap items-center gap-4">
      <LearnerAvatar className="size-14" fallbackClassName="text-lg" />
      <div className="min-w-0 flex-1">
        <p className="font-semibold">{learner.name}</p>
        <p className="truncate text-sm text-muted-foreground">{learner.email}</p>
      </div>
      <SignOutButton />
    </div>
  );
}


"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { authClient } from "@/lib/auth-client";

function useSignOut() {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function signOut() {
    setPending(true);
    const { error } = await authClient.signOut();
    if (error) {
      setPending(false);
      return;
    }
    router.replace("/login");
    router.refresh();
  }

  return { pending, signOut };
}

export function SignOutButton() {
  const { pending, signOut } = useSignOut();
  return (
    <Button
      type="button"
      variant="secondary"
      className="gap-2"
      disabled={pending}
      aria-busy={pending}
      onClick={signOut}
    >
      {pending ? (
        <LoaderCircle aria-hidden className="size-4 animate-spin" />
      ) : (
        <LogOut aria-hidden className="size-4" />
      )}
      Sign out
    </Button>
  );
}

export function SignOutMenuItem({ className }: { className?: string }) {
  const { pending, signOut } = useSignOut();
  return (
    <DropdownMenuItem
      className={className}
      disabled={pending}
      onSelect={(event) => {
        event.preventDefault();
        void signOut();
      }}
    >
      <span className="squircle-sm grid size-8 place-items-center border border-ink/8 bg-ink/[0.05]">
        {pending ? (
          <LoaderCircle aria-hidden className="size-4 animate-spin" />
        ) : (
          <LogOut aria-hidden className="size-4" />
        )}
      </span>
      Sign out
    </DropdownMenuItem>
  );
}

"use client";

import { Show, SignInButton, UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

export function AuthChrome() {
  if (
    !process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_CHAR_DEV_BYPASS === "1"
  ) {
    return (
      <span className="text-[11px] uppercase tracking-wider text-white/30">
        dev bypass
      </span>
    );
  }

  return (
    <>
      <Show when="signed-in">
        <UserButton />
      </Show>
      <Show when="signed-out">
        <SignInButton mode="modal">
          <Button variant="ghost" className="text-white/60">
            Sign in
          </Button>
        </SignInButton>
      </Show>
    </>
  );
}

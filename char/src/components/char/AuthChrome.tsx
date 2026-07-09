"use client";

import { Show, SignInButton, UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

export function AuthChrome() {
  const bypass =
    process.env.NEXT_PUBLIC_CHAR_DEV_BYPASS === "1" ||
    !process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  if (bypass) {
    return (
      <span className="text-[11px] uppercase tracking-wider text-white/30">
        {process.env.NEXT_PUBLIC_CHAR_DEV_BYPASS === "1"
          ? "dev bypass"
          : "no clerk env"}
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

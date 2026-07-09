"use client";

import { ClerkProvider } from "@clerk/nextjs";

export function Providers({ children }: { children: React.ReactNode }) {
  // Without Clerk keys, skip provider so mock/dev bypass still works
  if (
    !process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_CHAR_DEV_BYPASS === "1"
  ) {
    return <>{children}</>;
  }
  return <ClerkProvider>{children}</ClerkProvider>;
}

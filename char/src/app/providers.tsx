"use client";

import { ClerkProvider } from "@clerk/nextjs";

export function Providers({ children }: { children: React.ReactNode }) {
  const bypass =
    process.env.NEXT_PUBLIC_CHAR_DEV_BYPASS === "1" ||
    !process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  if (bypass) {
    return <>{children}</>;
  }
  return <ClerkProvider>{children}</ClerkProvider>;
}

"use client";

import { ClerkProvider } from "@clerk/nextjs";

export function Providers({ children }: { children: React.ReactNode }) {
  if (process.env.NEXT_PUBLIC_CHAR_DEV_BYPASS === "1") {
    return <>{children}</>;
  }
  return <ClerkProvider>{children}</ClerkProvider>;
}

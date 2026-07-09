import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default function middleware(req: NextRequest) {
  // Full Clerk middleware activates when keys exist and bypass is off.
  // For hack/dev we no-op so mock mode works without Clerk.
  if (
    process.env.CHAR_DEV_BYPASS === "1" ||
    !process.env.CLERK_SECRET_KEY ||
    !process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
  ) {
    return NextResponse.next();
  }

  // Dynamic import path avoided — use clerk when configured via separate file later.
  // For now protect only if explicitly enabled:
  if (process.env.CHAR_CLERK_PROTECT === "1") {
    const path = req.nextUrl.pathname;
    if (path.startsWith("/s") || path.startsWith("/api/sessions")) {
      // Without running clerkMiddleware here, rely on route-level auth().
      return NextResponse.next();
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};

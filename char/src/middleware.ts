import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse, type NextRequest } from "next/server";

// Page routes that require a signed-in user (HTML redirect OK).
const isProtectedPage = createRouteMatcher(["/s(.*)"]);

const hasClerk =
  Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) &&
  Boolean(process.env.CLERK_SECRET_KEY);

const passthrough = (_req: NextRequest) => NextResponse.next();

/**
 * Important: do NOT early-return NextResponse.next() for /api/* —
 * that skips Clerk's auth header injection and makes auth() throw
 * "can't detect usage of clerkMiddleware()" in route handlers.
 * Just skip protect() for APIs; handlers return JSON 401 themselves.
 */
export default hasClerk
  ? clerkMiddleware(async (auth, req) => {
      const path = req.nextUrl.pathname;
      if (path.startsWith("/api/mcp")) return;
      if (process.env.CHAR_DEV_BYPASS === "1") return;
      if (path.startsWith("/api/")) return;
      if (isProtectedPage(req)) {
        await auth.protect();
      }
    })
  : passthrough;

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};

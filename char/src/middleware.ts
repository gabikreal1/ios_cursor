import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse, type NextRequest } from "next/server";

// Protect session UI; APIs return JSON 401 themselves via requireUserId.
const isProtectedPage = createRouteMatcher(["/s(.*)"]);

const hasClerk =
  Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) &&
  Boolean(process.env.CLERK_SECRET_KEY);

const passthrough = (_req: NextRequest) => NextResponse.next();

// Without Clerk keys, clerkMiddleware throws MIDDLEWARE_INVOCATION_FAILED on Vercel.
export default hasClerk
  ? clerkMiddleware(async (auth, req) => {
      if (req.nextUrl.pathname.startsWith("/api/mcp")) {
        return NextResponse.next();
      }
      if (process.env.CHAR_DEV_BYPASS === "1") {
        return NextResponse.next();
      }
      // Never redirect API routes — let handlers return JSON.
      if (req.nextUrl.pathname.startsWith("/api/")) {
        return NextResponse.next();
      }
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

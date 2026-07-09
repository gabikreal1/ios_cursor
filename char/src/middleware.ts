import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isProtected = createRouteMatcher([
  "/s(.*)",
  "/api/sessions(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  // MCP endpoint is called by Cursor cloud with shared secret, not Clerk
  if (req.nextUrl.pathname.startsWith("/api/mcp")) {
    return NextResponse.next();
  }
  if (process.env.CHAR_DEV_BYPASS === "1") {
    return NextResponse.next();
  }
  if (isProtected(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};

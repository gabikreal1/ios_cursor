import { auth } from "@clerk/nextjs/server";

/** Hack helper: allow local mock without Clerk when CHAR_DEV_BYPASS=1 */
export async function requireUserId(): Promise<string | null> {
  if (
    process.env.CHAR_DEV_BYPASS === "1" ||
    !process.env.CLERK_SECRET_KEY ||
    !process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
  ) {
    return "dev-user";
  }
  const { userId } = await auth();
  return userId;
}

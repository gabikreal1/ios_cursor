import { auth } from "@clerk/nextjs/server";

/** Hack helper: allow local mock without Clerk when CHAR_DEV_BYPASS=1 */
export async function requireUserId(): Promise<string | null> {
  if (process.env.CHAR_DEV_BYPASS === "1") {
    return "dev-user";
  }
  const { userId } = await auth();
  return userId;
}

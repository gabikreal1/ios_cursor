/** Hackathon mode: no auth gate. Restore Clerk before multi-user use. */
export async function requireUserId(): Promise<string | null> {
  return "hack-user";
}

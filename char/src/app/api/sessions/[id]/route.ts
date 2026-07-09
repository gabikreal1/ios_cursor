import { NextResponse } from "next/server";
import { getSession } from "@/lib/session-store";
import { requireUserId } from "@/lib/auth";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const userId = await requireUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await ctx.params;
  const session = getSession(id);
  if (!session) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const sharedOwners = new Set([
    userId,
    "hack-user",
    "dev-user",
    "cloud-agent",
    process.env.CHAR_MCP_USER_ID || "hack-user",
  ]);
  if (!sharedOwners.has(session.userId)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ session });
}

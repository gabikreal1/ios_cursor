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
  if (!session || session.userId !== userId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ session });
}

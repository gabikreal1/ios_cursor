import { NextResponse } from "next/server";
import {
  currentCard,
  decide,
  forceStop,
  getSession,
} from "@/lib/session-store";
import { startCloudResearch } from "@/lib/cursor-agents";
import { isApplyReady } from "@/lib/types";
import { requireUserId } from "@/lib/auth";

export async function POST(
  req: Request,
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

  const body = (await req.json()) as {
    action: "keep" | "kill" | "research" | "enough";
    cardId?: string;
    query?: string;
  };

  if (body.action === "enough") {
    const s = forceStop(id);
    return NextResponse.json({ session: s, applyReady: isApplyReady(s) });
  }

  const cardId = body.cardId || currentCard(session)?.id;
  if (!cardId) {
    return NextResponse.json({ error: "No card" }, { status: 400 });
  }

  if (body.action === "research") {
    if (!body.query?.trim()) {
      return NextResponse.json({ error: "query required" }, { status: 400 });
    }
    const research = await startCloudResearch({
      sessionId: id,
      cardId,
      query: body.query.trim(),
    });
    return NextResponse.json({
      session: getSession(id),
      research,
    });
  }

  const s = decide(id, cardId, body.action);
  return NextResponse.json({
    session: s,
    applyReady: isApplyReady(s),
    current: currentCard(s),
  });
}

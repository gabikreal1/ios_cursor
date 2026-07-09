import { NextResponse } from "next/server";
import { getSession, saveSession } from "@/lib/session-store";
import { startCloudApply } from "@/lib/cursor-agents";
import { isApplyReady, type CharSession } from "@/lib/types";
import { buildApplyArtifacts } from "@/lib/apply-artifacts";
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
  const body = (await req.json().catch(() => ({}))) as {
    session?: CharSession;
  };
  if (body.session?.id === id) {
    body.session.userId = userId;
    saveSession(body.session);
  }
  const session = getSession(id);
  if (!session || session.userId !== userId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (!session.repoUrl) {
    return NextResponse.json(
      { error: "Connect a repo URL to Apply" },
      { status: 400 },
    );
  }
  if (!isApplyReady(session) && session.status !== "ready_to_apply") {
    return NextResponse.json(
      { error: "Queue not empty — swipe remaining or tap That’s enough" },
      { status: 400 },
    );
  }

  const preview = buildApplyArtifacts(session);
  const result = await startCloudApply(id);
  return NextResponse.json({
    session: getSession(id),
    preview,
    result,
  });
}

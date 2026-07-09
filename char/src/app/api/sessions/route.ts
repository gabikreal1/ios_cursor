import { NextResponse } from "next/server";
import { createSession, getSession } from "@/lib/session-store";
import { startCloudGrill } from "@/lib/cursor-agents";
import { requireUserId } from "@/lib/auth";

export async function POST(req: Request) {
  const userId = await requireUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json()) as { pitch?: string; repoUrl?: string };
  if (!body.pitch?.trim()) {
    return NextResponse.json({ error: "pitch required" }, { status: 400 });
  }

  const session = createSession({
    userId,
    pitch: body.pitch.trim(),
    repoUrl: body.repoUrl?.trim() || undefined,
  });

  const grill = await startCloudGrill(session.id);
  return NextResponse.json({ session: getSession(session.id), grill });
}

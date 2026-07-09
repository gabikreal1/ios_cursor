import { NextResponse } from "next/server";
import { createSession, getSession } from "@/lib/session-store";
import { startCloudGrill } from "@/lib/cursor-agents";
import { requireUserId } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const userId = await requireUserId();
    if (!userId) {
      return NextResponse.json(
        { error: "Sign in to heat it" },
        { status: 401 },
      );
    }

    const body = (await req.json()) as { pitch?: string; repoUrl?: string };
    if (!body.pitch?.trim() || body.pitch.trim().length < 8) {
      return NextResponse.json(
        { error: "Pitch needs a bit more meat (8+ chars)" },
        { status: 400 },
      );
    }

    const session = createSession({
      userId,
      pitch: body.pitch.trim(),
      repoUrl: body.repoUrl?.trim() || undefined,
    });

    // Kick grill without blocking the response on Agent.create provisioning.
    const grill = await startCloudGrill(session.id);
    return NextResponse.json({ session: getSession(session.id), grill });
  } catch (err) {
    console.error("[POST /api/sessions]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to start grill" },
      { status: 500 },
    );
  }
}

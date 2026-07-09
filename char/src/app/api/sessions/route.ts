import { NextResponse } from "next/server";
import { createSession, getSession } from "@/lib/session-store";
import { mockEmitCards } from "@/lib/cursor-agents";
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

    // Vercel functions do not share the in-memory session map. Forge the
    // five-card hackathon deck synchronously so the browser can persist it.
    mockEmitCards(session);
    return NextResponse.json({
      session: getSession(session.id),
      grill: { mock: true, cardCount: 5 },
    });
  } catch (err) {
    console.error("[POST /api/sessions]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to start grill" },
      { status: 500 },
    );
  }
}

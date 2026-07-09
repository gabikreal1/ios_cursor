import { NextResponse } from "next/server";
import { createSession, getSession } from "@/lib/session-store";
import { generateAICards, mockEmitCards } from "@/lib/cursor-agents";
import { requireUserId } from "@/lib/auth";

export const maxDuration = 300;

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

    // Generate on this request path, then return all five cards for the
    // browser to persist. Vercel functions do not share in-memory sessions.
    let grill: {
      ai: boolean;
      agentId?: string;
      cardCount: number;
      fallbackReason?: string;
    };
    try {
      const result = await generateAICards(session.id);
      grill = {
        ai: true,
        agentId: result.agentId,
        cardCount: result.cards.length,
      };
    } catch (err) {
      console.error("[generateAICards] falling back", err);
      mockEmitCards(session);
      grill = {
        ai: false,
        cardCount: 5,
        fallbackReason: "AI generation failed; served the five-card fallback",
      };
    }
    return NextResponse.json({
      session: getSession(session.id),
      grill,
    });
  } catch (err) {
    console.error("[POST /api/sessions]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to start grill" },
      { status: 500 },
    );
  }
}

import { NextResponse } from "next/server";
import { EmitCardsSchema, EmitResearchSchema } from "@/lib/types";
import { appendCards, createSession, getSession, requeueFront, decide } from "@/lib/session-store";

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

function checkAuth(req: Request) {
  const secret = process.env.CHAR_MCP_SECRET || "dev-secret";
  const header = req.headers.get("authorization") || "";
  const token = header.replace(/^Bearer\s+/i, "");
  return token === secret;
}

/**
 * Minimal HTTP MCP-ish endpoint for Cursor cloud agents.
 * Tools: emit_cards, emit_research
 * (Simplified JSON-RPC-ish surface for hackathon — not full MCP streamable HTTP.)
 */
export async function POST(req: Request) {
  if (!checkAuth(req)) return unauthorized();

  const body = await req.json();
  const method = body.method || body.tool || body.name;

  // MCP initialize / tools/list compatibility stubs
  if (method === "initialize") {
    return NextResponse.json({
      jsonrpc: "2.0",
      id: body.id,
      result: {
        protocolVersion: "2024-11-05",
        capabilities: { tools: {} },
        serverInfo: { name: "char", version: "0.1.0" },
      },
    });
  }

  if (method === "tools/list") {
    return NextResponse.json({
      jsonrpc: "2.0",
      id: body.id,
      result: {
        tools: [
          {
            name: "emit_cards",
            description:
              "Emit 1–3 structured assumption cards for the CHAR swipe UI. Call as soon as you have cards.",
            inputSchema: {
              type: "object",
              properties: {
                sessionId: { type: "string" },
                cards: { type: "array" },
                done: { type: "boolean" },
              },
              required: ["sessionId", "cards"],
            },
          },
          {
            name: "emit_research",
            description:
              "Emit a research brief card and optionally requeue affected decisions.",
            inputSchema: {
              type: "object",
              properties: {
                sessionId: { type: "string" },
                brief: { type: "object" },
                requeueCardIds: { type: "array", items: { type: "string" } },
              },
              required: ["sessionId", "brief"],
            },
          },
        ],
      },
    });
  }

  if (method === "tools/call") {
    const name = body.params?.name;
    const args = body.params?.arguments || {};
    try {
      if (name === "emit_cards") {
        const parsed = EmitCardsSchema.parse(args);
        if (!getSession(parsed.sessionId)) {
          createSession({
            id: parsed.sessionId,
            userId: "cloud-agent",
            pitch: req.headers.get("x-char-pitch") || "pitch-only grill",
          });
        }
        const session = appendCards(parsed.sessionId, parsed.cards, parsed.done);
        return NextResponse.json({
          jsonrpc: "2.0",
          id: body.id,
          result: {
            content: [
              {
                type: "text",
                text: `Accepted ${parsed.cards.length} cards. queue=${session.queue.length} done=${session.grillDone}`,
              },
            ],
          },
        });
      }
      if (name === "emit_research") {
        const parsed = EmitResearchSchema.parse(args);
        if (!getSession(parsed.sessionId)) throw new Error("Unknown session");
        appendCards(parsed.sessionId, [parsed.brief], false);
        if (parsed.requeueCardIds.length) {
          requeueFront(parsed.sessionId, parsed.requeueCardIds);
        }
        const session = getSession(parsed.sessionId)!;
        return NextResponse.json({
          jsonrpc: "2.0",
          id: body.id,
          result: {
            content: [
              {
                type: "text",
                text: `Research brief accepted. requeued=${parsed.requeueCardIds.length} queue=${session.queue.length}`,
              },
            ],
          },
        });
      }
      throw new Error(`Unknown tool ${name}`);
    } catch (err) {
      return NextResponse.json({
        jsonrpc: "2.0",
        id: body.id,
        error: { code: -32000, message: String(err) },
      });
    }
  }

  // Direct REST fallbacks (easier to test)
  if (body.tool === "emit_cards" || body.name === "emit_cards") {
    const parsed = EmitCardsSchema.parse(body.arguments || body);
    if (!getSession(parsed.sessionId)) {
      createSession({
        id: parsed.sessionId,
        userId: "cloud-agent",
        pitch: req.headers.get("x-char-pitch") || "pitch-only grill",
      });
    }
    const session = appendCards(parsed.sessionId, parsed.cards, parsed.done);
    return NextResponse.json({ ok: true, session });
  }
  if (body.tool === "emit_research" || body.name === "emit_research") {
    const parsed = EmitResearchSchema.parse(body.arguments || body);
    appendCards(parsed.sessionId, [parsed.brief], false);
    // mark originating research decision if present
    const origin = parsed.brief.affectsCardIds?.[0];
    if (origin) decide(parsed.sessionId, origin, "research");
    if (parsed.requeueCardIds.length) {
      requeueFront(parsed.sessionId, parsed.requeueCardIds);
    }
    return NextResponse.json({ ok: true, session: getSession(parsed.sessionId) });
  }

  return NextResponse.json({ error: "Unknown method", body }, { status: 400 });
}

export async function GET() {
  return NextResponse.json({
    name: "char-mcp",
    tools: ["emit_cards", "emit_research"],
  });
}

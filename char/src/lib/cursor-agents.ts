import { Agent } from "@cursor/sdk";
import {
  buildApplyPrompt,
  buildGrillPrompt,
  buildResearchPrompt,
} from "./prompts";
import { appendCards, getSession, saveSession } from "./session-store";
import type { AssumptionCard, CharSession } from "./types";
import { buildApplyArtifacts } from "./apply-artifacts";
import { randomUUID } from "crypto";

function apiKey() {
  const key = process.env.CURSOR_API_KEY;
  if (!key) throw new Error("CURSOR_API_KEY is not set");
  return key;
}

function mcpBaseUrl() {
  // Public URL Cursor cloud can reach (ngrok / vercel). Falls back to localhost for docs only.
  return (
    process.env.CHAR_PUBLIC_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    "http://localhost:3000"
  );
}

function mcpServers(sessionId: string) {
  const url = `${mcpBaseUrl()}/api/mcp`;
  return {
    char: {
      type: "http" as const,
      url,
      headers: {
        Authorization: `Bearer ${process.env.CHAR_MCP_SECRET || "dev-secret"}`,
        "X-Char-Session": sessionId,
      },
    },
  };
}

/** Demo cards when CURSOR_API_KEY missing or CHAR_MOCK=1 */
export function mockEmitCards(session: CharSession) {
  const grounded = session.repoUrl ? "repo-grounded" : "pitch-only";
  const idea = session.pitch.length > 90
    ? `${session.pitch.slice(0, 87)}…`
    : session.pitch;
  const cards: AssumptionCard[] = [
    {
      id: randomUUID(),
      category: "Customer",
      assumption:
        `A specific group of people feels the pain behind “${idea}” often enough to seek a new solution.`,
      recommendedStance: "keep",
      rationale: "No sharp customer and urgent pain means there is no wedge.",
      kind: "assumption",
      grounded,
      researchSuggestions: [
        "Interview five target users",
        "Find existing workarounds",
        "Measure how often the pain occurs",
      ],
    },
    {
      id: randomUUID(),
      category: "Behavior",
      assumption:
        "Users will change their current behavior instead of tolerating the problem or using their existing workaround.",
      recommendedStance: "keep",
      rationale: "A better product still loses when switching cost beats pain.",
      kind: "assumption",
      grounded,
      researchSuggestions: [
        "Map the current workflow",
        "Estimate switching cost",
        "Test a manual concierge version",
      ],
    },
    {
      id: randomUUID(),
      category: "Promise",
      assumption:
        "The product can deliver its core promise quickly enough that a first-time user feels the win in one session.",
      recommendedStance: "keep",
      rationale: "If value arrives late, activation dies before the idea gets a chance.",
      kind: "assumption",
      grounded,
      researchSuggestions: [
        "Define the first five-minute win",
        "Prototype the happy path",
        "Remove setup steps",
      ],
    },
    {
      id: randomUUID(),
      category: "Distribution",
      assumption:
        "There is one repeatable channel where target users already gather and can be reached without paid scale.",
      recommendedStance: "research",
      rationale: "A product without an acquisition path is a private demo.",
      kind: "assumption",
      grounded,
      researchSuggestions: [
        "Name the first 20 users",
        "Audit niche communities",
        "Test one founder-led channel",
      ],
    },
    {
      id: randomUUID(),
      category: "Money",
      assumption:
        "The value is painful or valuable enough that someone will pay before the product becomes feature-complete.",
      recommendedStance: "research",
      rationale: "Usage without willingness to pay can hide a hobby, not a business.",
      kind: "fork",
      grounded,
      researchSuggestions: [
        "Ask for a paid pilot",
        "Test three price points",
        "Compare the cost of the current workaround",
      ],
    },
  ];
  appendCards(session.id, cards, true);
}

export async function startCloudGrill(sessionId: string) {
  const session = getSession(sessionId);
  if (!session) throw new Error("Session not found");

  if (process.env.CHAR_MOCK === "1" || !process.env.CURSOR_API_KEY) {
    session.heatMessages = [
      "Mock heat (no CURSOR_API_KEY)…",
      "Forging assumption cards…",
    ];
    saveSession(session);
    setTimeout(() => mockEmitCards(session), 800);
    return { mock: true as const };
  }

  session.heatMessages = [
    "Cloud agent provisioning…",
    session.repoUrl ? "Cloning your repo…" : "Pitch-only heat…",
    "Finding soft spots…",
  ];
  saveSession(session);

  // Don't await Agent.create on the request path — provisioning can take
  // long enough that mobile Safari looks like the button "does nothing".
  void (async () => {
    try {
      const agent = await Agent.create({
        apiKey: apiKey(),
        model: { id: process.env.CURSOR_MODEL || "composer-2.5" },
        cloud: session.repoUrl
          ? {
              repos: [{ url: session.repoUrl, startingRef: "main" }],
              autoCreatePR: false,
            }
          : {
              repos: [
                {
                  url:
                    process.env.CHAR_FALLBACK_REPO ||
                    "https://github.com/gabikreal1/ios_cursor",
                  startingRef: "main",
                },
              ],
              autoCreatePR: false,
            },
        mcpServers: mcpServers(sessionId),
      });

      const s0 = getSession(sessionId);
      if (s0) {
        s0.agentId = agent.agentId;
        s0.heatMessages = [
          "Agent online…",
          "Grilling assumptions…",
          "Waiting for cards…",
        ];
        saveSession(s0);
      }

      const prompt = buildGrillPrompt({
        sessionId,
        pitch: session.pitch,
        repoUrl: session.repoUrl,
        mcpNote: `Call the char MCP tool emit_cards. Do not print JSON in chat as the primary output.`,
      });

      const run = await agent.send(prompt);
      await run.wait();
      const s = getSession(sessionId);
      if (s && !s.grillDone && s.cards.length > 0) {
        s.grillDone = true;
        saveSession(s);
      } else if (s && s.cards.length === 0) {
        s.heatMessages = [
          "Agent finished without cards — forging fallback…",
        ];
        saveSession(s);
        mockEmitCards(s);
      }
    } catch (err) {
      const s = getSession(sessionId);
      if (s) {
        s.heatMessages = [
          `Grill failed: ${String(err)}`,
          "Falling back to mock cards…",
        ];
        saveSession(s);
        mockEmitCards(s);
      }
    }
  })();

  return { mock: false as const, pending: true as const };
}

export async function startCloudResearch(input: {
  sessionId: string;
  cardId: string;
  query: string;
}) {
  const session = getSession(input.sessionId);
  if (!session) throw new Error("Session not found");
  const card = session.cards.find((c) => c.id === input.cardId);
  if (!card) throw new Error("Card not found");

  session.status = "researching";
  saveSession(session);

  if (process.env.CHAR_MOCK === "1" || !process.env.CURSOR_API_KEY) {
    const brief: AssumptionCard = {
      id: randomUUID(),
      category: "Research",
      assumption: `Research: ${input.query}`,
      recommendedStance: "research",
      rationale: "Mock research brief",
      kind: "research_brief",
      grounded: session.repoUrl ? "repo-grounded" : "pitch-only",
      color: "research",
      findings: `Mock findings for “${input.query}”. Live web research runs when CURSOR_API_KEY is set.`,
      sources: ["https://reactbits.dev/", "https://cursor.com/docs/sdk/typescript"],
      affectsCardIds: [input.cardId],
    };
    appendCards(session.id, [brief], false);
    const { requeueFront, decide } = await import("./session-store");
    decide(session.id, input.cardId, "research");
    requeueFront(session.id, [input.cardId]);
    return { mock: true as const };
  }

  const prior = Object.entries(session.decisions).map(([id, decision]) => {
    const c = session.cards.find((x) => x.id === id)!;
    return { id, assumption: c?.assumption || id, decision };
  });

  const agent = await Agent.create({
    apiKey: apiKey(),
    model: { id: process.env.CURSOR_MODEL || "composer-2.5" },
    cloud: {
      repos: [
        {
          url:
            session.repoUrl ||
            process.env.CHAR_FALLBACK_REPO ||
            "https://github.com/gabikreal1/ios_cursor",
          startingRef: "main",
        },
      ],
      autoCreatePR: false,
    },
    mcpServers: mcpServers(session.id),
  });

  const prompt = buildResearchPrompt({
    sessionId: session.id,
    pitch: session.pitch,
    cardAssumption: card.assumption,
    query: input.query,
    suggestions: card.researchSuggestions || [],
    priorDecisions: prior,
  });

  void agent.send(prompt).then((run) => run.wait());
  return { agentId: agent.agentId, mock: false as const };
}

export async function startCloudApply(sessionId: string) {
  const session = getSession(sessionId);
  if (!session) throw new Error("Session not found");
  if (!session.repoUrl) throw new Error("repoUrl required to Apply");

  const artifacts = buildApplyArtifacts(session);
  session.status = "applying";
  session.applyError = undefined;
  saveSession(session);

  if (process.env.CHAR_MOCK === "1" || !process.env.CURSOR_API_KEY) {
    session.prUrl = `https://github.com/mock/char/pull/1?session=${sessionId}`;
    session.status = "done";
    saveSession(session);
    return { mock: true as const, prUrl: session.prUrl, artifacts };
  }

  const agent = await Agent.create({
    apiKey: apiKey(),
    model: { id: process.env.CURSOR_MODEL || "composer-2.5" },
    cloud: {
      repos: [{ url: session.repoUrl, startingRef: "main" }],
      autoCreatePR: true,
    },
  });

  session.applyAgentId = agent.agentId;
  saveSession(session);

  const prompt = buildApplyPrompt({
    sessionId,
    charMd: artifacts.charMd,
    agentsMd: artifacts.agentsMd,
    adrs: artifacts.adrs,
  });

  const run = await agent.send(prompt);
  const result = await run.wait();
  const prUrl =
    result.git?.branches?.[0]?.prUrl ||
    (result as { git?: { prUrl?: string } }).git?.prUrl;

  session.prUrl = prUrl || undefined;
  session.status = "done";
  if (!prUrl) session.applyError = "Apply finished but no prUrl — check Cursor Agents.";
  saveSession(session);
  return { mock: false as const, prUrl, agentId: agent.agentId, result: result.result };
}

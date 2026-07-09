#!/usr/bin/env node
const BASE = process.env.CHAR_MCP_URL || "http://localhost:3000/api/mcp";
const SECRET = process.env.CHAR_MCP_SECRET || "dev-secret";
const SESSION = "d03ee97a-decf-4947-ae57-c96a7c8a31cb";
const PITCH =
  "I want to add online mode with your coworkers where you match together, maybe like kahoot";

const batches = [
  [
    {
      id: "a1-existing-product",
      category: "Product",
      assumption:
        "You already have a solo product people use, and online coworker mode is an additive feature — not a pivot into a new multiplayer app.",
      recommendedStance: "research",
      rationale:
        "You said add online mode like it is a settings toggle. Multiplayer is a different product: rooms, sync, latency, moderation. If the solo core is not sticky, you are building Kahoot from scratch with extra steps.",
      kind: "assumption",
      grounded: "pitch-only",
      researchSuggestions: [
        "What is the current product and who uses it solo today?",
        "What job does solo mode solve that multiplayer must not break?",
        "Did users ask for coworker matching or are you assuming they want it?",
      ],
    },
  ],
  [
    {
      id: "a2-coworker-demand",
      parentId: "a1-existing-product",
      category: "Customer",
      assumption:
        "Coworkers actually want to use this together in real time — not just you wanting a cooler demo.",
      recommendedStance: "research",
      rationale:
        "Maybe like Kahoot is doing a lot of work. Kahoot wins on meeting energy and a host with a captive audience. Your coworkers are not trapped in your all-hands. Prove the pull before you ship sockets.",
      kind: "assumption",
      grounded: "pitch-only",
      researchSuggestions: [
        "Talk to 5 users: would they invite coworkers unprompted?",
        "When do teams choose Kahoot vs async tools?",
        "What multiplayer social apps survived outside games?",
      ],
    },
    {
      id: "a3-workplace-icp",
      parentId: "a2-coworker-demand",
      category: "ICP",
      assumption:
        "The primary multiplayer customer is coworkers at the same company — not friends, couples, or random internet strangers.",
      recommendedStance: "keep",
      rationale:
        "You said coworkers, not friends. That implies org identity, IT suspicion, and Slack distribution. Stranger-match is a different company with different moderation nightmares.",
      kind: "assumption",
      grounded: "pitch-only",
    },
  ],
  [
    {
      id: "a4-kahoot-model",
      parentId: "a2-coworker-demand",
      category: "UX",
      assumption:
        "A Kahoot-style synchronized session (one host, everyone on the same beat) is the right interaction model for your product.",
      recommendedStance: "research",
      rationale:
        "Kahoot is quiz theater: big screen, loud host, 4-option taps. If your core value is not competitive simultaneity, you are cargo-culting the lobby music without the game show.",
      kind: "fork",
      grounded: "pitch-only",
      researchSuggestions: [
        "What is the core loop without Kahoot cosplay?",
        "Compare Gartic Phone vs Kahoot retention mechanics",
        "Does your content need sync or just shared context?",
      ],
    },
    {
      id: "a5-sync-not-async",
      parentId: "a4-kahoot-model",
      category: "UX",
      assumption:
        "Match together means live synchronous play in the same room code — not async pairing, turn-based matching, or we'll hop on later.",
      recommendedStance: "keep",
      rationale:
        "Maybe like Kahoot is not maybe like Wordle-by-email. Realtime is the expensive assumption. If async works, you can ship next week instead of next quarter.",
      kind: "assumption",
      grounded: "pitch-only",
    },
  ],
  [
    {
      id: "a6-room-discovery",
      parentId: "a3-workplace-icp",
      category: "Distribution",
      assumption:
        "You can get a full coworker group into the same session without enterprise SSO, IT tickets, or a sales call.",
      recommendedStance: "kill",
      rationale:
        "Workplace multiplayer dies in the invite step. Six people, three calendars, one person who cannot find the link. If discovery is hard, your Kahoot clone becomes a solo founder playing against bots.",
      kind: "assumption",
      grounded: "pitch-only",
      researchSuggestions: [
        "How do Slack-embedded apps cut invite friction?",
        "Room-code join rates in Jackbox / Among Us",
        "Minimum viable org auth for same-company rooms",
      ],
    },
    {
      id: "a7-repeat-usage",
      parentId: "a2-coworker-demand",
      category: "Retention",
      assumption:
        "Teams will run coworker sessions repeatedly — not once as an onboarding gimmick or offsite icebreaker.",
      recommendedStance: "research",
      rationale:
        "One-off wow is easy; habit is hard. Kahoot is recurring because teachers have a curriculum slot. What is your weekly slot at work that is not cringe?",
      kind: "assumption",
      grounded: "pitch-only",
      researchSuggestions: [
        "What recurring team rituals exist besides standup?",
        "Icebreaker app graveyard: what died after week 2?",
        "B2B engagement benchmarks for team games",
      ],
    },
  ],
  [
    {
      id: "a8-tech-feasibility",
      parentId: "a1-existing-product",
      category: "Technical",
      assumption:
        "You can bolt realtime multiplayer onto the existing architecture without rewriting the solo core or hiring a netcode goblin.",
      recommendedStance: "research",
      rationale:
        "Online mode is never just add WebSockets. State sync, reconnects, host migration, cheating, mobile backgrounding — your solo app never had to care. Budget the rewrite honestly.",
      kind: "assumption",
      grounded: "pitch-only",
      researchSuggestions: [
        "Audit current state model for sync-friendly design",
        "Liveblocks/PartyKit vs roll-your-own for hackathon scope",
        "What breaks on mobile Safari with sockets?",
      ],
    },
    {
      id: "a9-roadmap-priority",
      parentId: "a1-existing-product",
      category: "Strategy",
      assumption:
        "Online coworker mode is the highest-leverage bet right now — more than fixing solo retention, pricing, or distribution.",
      recommendedStance: "kill",
      rationale:
        "Feature tourism: multiplayer sounds sexy because it is legible in a pitch. If solo retention is leaky, you are building a louder funnel to nowhere.",
      kind: "assumption",
      grounded: "pitch-only",
    },
  ],
  [
    {
      id: "a10-team-identity",
      parentId: "a3-workplace-icp",
      category: "Product",
      assumption:
        "You need persistent team/workspace identity (who is in my org) — a share link alone is not enough.",
      recommendedStance: "fork",
      recommendedStance: "research",
      rationale:
        "Fork: link-only rooms are fast to ship but anonymous chaos. Org workspaces are stickier but Clerk/SSO-shaped. Pick one; half-building both is how solo founders drown.",
      kind: "fork",
      grounded: "pitch-only",
      researchSuggestions: [
        "When do room codes suffice vs org directories?",
        "Clerk orgs vs magic-link rooms for hackathon scope",
        "How Kahoot handles class rosters vs ad-hoc join",
      ],
    },
    {
      id: "a11-solo-founder-ops",
      parentId: "a8-tech-feasibility",
      category: "Ops",
      assumption:
        "A solo founder can ship and operate realtime infra (uptime, abuse, reconnect bugs) without it becoming the whole company.",
      recommendedStance: "kill",
      rationale:
        "Realtime is a second product: on-call for socket ghosts, rage-quit bugs at 11pm, and the first viral TikTok that melts your Redis. You wanted a feature; you bought a pager.",
      kind: "assumption",
      grounded: "pitch-only",
    },
    {
      id: "a12-content-moderation",
      parentId: "a3-workplace-icp",
      category: "Risk",
      assumption:
        "Workplace sessions stay tame enough that you do not need heavy UGC moderation, reporting, or HR-shaped incident flows on day one.",
      recommendedStance: "research",
      rationale:
        "Coworkers are still humans with HR departments. User-generated names, chat, and custom prompts can end careers. Kahoot has teachers; you have Slack screenshots.",
      kind: "assumption",
      grounded: "pitch-only",
      researchSuggestions: [
        "UGC moderation minimum for workplace tools",
        "Kahoot abuse/reporting feature set",
        "Liability patterns for team icebreaker apps",
      ],
    },
  ],
];

async function emit(cards, done = false) {
  const res = await fetch(BASE, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${SECRET}`,
      "Content-Type": "application/json",
      "X-Char-Pitch": PITCH,
    },
    body: JSON.stringify({
      method: "tools/call",
      id: Date.now(),
      params: {
        name: "emit_cards",
        arguments: { sessionId: SESSION, cards, done },
      },
    }),
  });
  const json = await res.json();
  console.log(JSON.stringify(json, null, 2));
  if (json.error) throw new Error(json.error.message);
}

async function main() {
  for (let i = 0; i < batches.length; i++) {
    const done = i === batches.length - 1;
    await emit(batches[i], done);
    if (!done) await new Promise((r) => setTimeout(r, 300));
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

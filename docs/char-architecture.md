# CHAR — Technical Architecture

**CHAR** is a mobile-first web app that turns a founder pitch into a swipeable assumption deck: keep / kill / research. The grilling brain is Matt Pocock’s `/grill-me` → `/grilling` skill, executed via `@cursor/sdk`. Explicit **Apply** writes `CHAR.md`, ADRs, and `AGENTS.md` constraints into a GitHub repo and kicks a cloud agent with `autoCreatePR`.

This doc is the concrete build plan. APIs below match researched `@cursor/sdk` behavior — no invented SDK fields.

---

## A. System components

```
┌─────────────────────────────────────────────────────────────────┐
│  Browser (mobile-first PWA)                                     │
│  Pitch → Swipe stack → Research sheet → Match Sheet → Apply     │
└────────────────────────────┬────────────────────────────────────┘
                             │ HTTPS (SSE / fetch)
┌────────────────────────────▼────────────────────────────────────┐
│  Next.js App Router                                             │
│  ┌──────────────┐  ┌────────────────┐  ┌─────────────────────┐  │
│  │ UI routes    │  │ API routes     │  │ Auth (NextAuth)     │  │
│  │ /            │  │ /api/sessions  │  │ GitHub OAuth        │  │
│  │ /s/[id]      │  │ /api/swipe     │  │ Cursor key vault    │  │
│  │ /apply       │  │ /api/research  │  │                     │  │
│  │              │  │ /api/apply     │  │                     │  │
│  │              │  │ /api/stream/*  │  │                     │  │
│  └──────────────┘  └───────┬────────┘  └─────────────────────┘  │
└────────────────────────────┼────────────────────────────────────┘
                             │
         ┌───────────────────┼───────────────────┐
         ▼                   ▼                   ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────────┐
│ Session store   │ │ Local SDK       │ │ Cloud SDK           │
│ Redis / Postgres│ │ worker pool     │ │ Agent.create cloud  │
│ sessions, cards │ │ Agent.create    │ │ repos + autoCreatePR│
│ queue, decisions│ │ local + tools   │ │ research + apply    │
│ research jobs   │ │ emit_cards      │ │ bc- IDs, prUrl      │
└─────────────────┘ └─────────────────┘ └─────────────────────┘
```

### Responsibilities

| Component | Role |
|-----------|------|
| **Next.js web** | Mobile swipe UI, pitch capture, Match Sheet, Apply wizard |
| **API routes** | Session CRUD, swipe mutations, research enqueue, apply kickoff, SSE for card/research events |
| **Session store** | Durable session state: pitch, card queue, decisions, research jobs, invalidations, apply status |
| **Local SDK workers** | Low-latency grilling + card emission via `Agent.create({ local })` + `customTools` |
| **Cloud SDK jobs** | Research briefs and Apply-to-repo (clone, write files, PR) via `Agent.create({ cloud })` |
| **Skill pack** | Vendored `.agents/skills/{grill-me,grilling,research,...}` copied into agent workspaces |

### Session store shape (logical)

```ts
type CharSession = {
  id: string;
  userId: string;
  pitch: string;
  status: "extracting" | "swiping" | "researching" | "ready_to_apply" | "applying" | "done";
  cards: AssumptionCard[];          // all cards ever emitted
  queue: string[];                  // card ids awaiting swipe (FIFO)
  decisions: Record<string, Decision>; // cardId → keep|kill|research
  researchJobs: ResearchJob[];
  invalidations: Invalidation[];    // research overturned prior decisions
  apply?: ApplyJob;
  agentRunIds: { local?: string; cloud?: string[] };
  createdAt: string;
  updatedAt: string;
};
```

Hackathon: Redis JSON or Postgres `jsonb`. Production: Postgres + Redis queue.

---

## B. Two-runtime strategy

**Hard SDK constraint:** `customTools` work **only** on local agents. Cloud throws `ConfigurationError` if you pass them. Cloud agents get a VM that clones `repos[]` and can open a PR when `autoCreatePR: true`. Result text is always a **string** on `result.result` — no native structured-output field.

| Job | Runtime | Why |
|-----|---------|-----|
| **Assumption extraction + card generation** | **Local** | Need `customTools.emit_cards` for reliable structured cards; latency budget ≤5s first card; no repo required |
| **Interactive re-grill / next-batch cards** | **Local** | Same tool-calling contract; keep conversation via `run.conversation()` on the local worker |
| **Research (swipe-up)** | **Cloud** (preferred) or local+HTTP MCP | Needs web/docs egress; research skill expects background agent; cloud shows in Agents Window (`bc-` id). No `customTools` — parse JSON from text or call network-reachable MCP |
| **Apply (CHAR.md + ADRs + AGENTS.md + PR)** | **Cloud only** | Must clone GitHub repo, write files, `autoCreatePR: true`, return `result.git.prUrl` |

### Pseudo-code: local card worker

```ts
import { Agent } from "@cursor/sdk";
import { z } from "zod";

const emitCardsSchema = {
  type: "object",
  properties: {
    cards: {
      type: "array",
      items: {
        type: "object",
        properties: {
          id: { type: "string" },
          assumption: { type: "string" },
          whyItMatters: { type: "string" },
          recommended: { enum: ["keep", "kill", "research"] },
          recommendedRationale: { type: "string" },
          branchId: { type: "string" },
          dependsOn: { type: "array", items: { type: "string" } },
          heat: { type: "number", minimum: 1, maximum: 5 },
          kind: { enum: ["assumption", "fork"] },
        },
        required: [
          "id", "assumption", "whyItMatters",
          "recommended", "recommendedRationale", "heat", "kind",
        ],
      },
    },
    done: { type: "boolean" },
  },
  required: ["cards"],
} as const;

async function startGrillWorker(session: CharSession, apiKey: string) {
  const agent = await Agent.create({
    apiKey,
    model: "composer-2", // or whatever the account exposes; pin in env
    local: {
      cwd: `/var/char/workspaces/${session.id}`, // pre-seeded skill pack
      settingSources: ["project"],               // pick up .agents/skills
      customTools: [
        {
          name: "emit_cards",
          description:
            "Emit 1–3 structured assumption cards for the swipe UI. Call this instead of writing freeform JSON.",
          inputSchema: emitCardsSchema,
          execute: async (args) => {
            const parsed = EmitCardsZod.parse(args);
            await sessionStore.appendCards(session.id, parsed.cards);
            await sessionStore.enqueue(session.id, parsed.cards.map((c) => c.id));
            // Return ack the model can see; structuredContent optional for our side
            return {
              content: `Accepted ${parsed.cards.length} cards`,
              structuredContent: parsed,
            };
          },
        },
      ],
    },
  });

  const run = await agent.send(
    [
      "Run /grill-me on this founder pitch.",
      "Do NOT ask the user questions in chat.",
      "Translate each grilling question into an assumption card and call emit_cards.",
      "Emit the FIRST card as soon as you have one — do not batch the whole tree first.",
      "Then emit more cards in small batches (1–3) as you walk the design tree.",
      "",
      `PITCH:\n${session.pitch}`,
    ].join("\n"),
  );

  // Stream for UI theater + progress; cards arrive via tool side-effects
  for await (const event of run.stream()) {
    await sessionStore.appendStreamEvent(session.id, event);
  }

  const result = await run.wait(); // result.result is string — ignore for cards
  return result;
}
```

### Pseudo-code: cloud research job

```ts
async function startResearchJob(job: ResearchJob, apiKey: string) {
  // Seed a tiny ephemeral repo OR reuse user's target repo + a research branch.
  // Skills load when the VM clones the repo that contains .agents/skills.
  const agent = await Agent.create({
    apiKey,
    model: "composer-2",
    cloud: {
      repos: [
        {
          url: job.skillsRepoUrl, // CHAR skill-pack repo or user repo with skills vendored
          startingRef: "main",
        },
      ],
      autoCreatePR: false, // research writes a brief artifact; PR optional
    },
    // NO customTools here — ConfigurationError on cloud
  });

  const run = await agent.send(
    [
      "Use the /research skill.",
      "Investigate this assumption against primary sources.",
      "Return a single JSON object (and nothing else) matching ResearchBriefSchema.",
      "",
      `ASSUMPTION: ${job.assumption}`,
      `USER_HINTS: ${job.suggestions.join(" | ")}`,
      `FREE_TEXT: ${job.freeText ?? "(none)"}`,
      `SESSION_CONTEXT: ${job.pitchSummary}`,
    ].join("\n"),
  );

  for await (const event of run.stream()) {
    await sessionStore.patchResearchJob(job.id, { streamCursor: event });
  }

  const result = await run.wait();
  const brief = parseResearchBrief(result.result); // Zod on string
  await applyResearchBrief(job.sessionId, job.cardId, brief, result.id /* bc-… */);
}
```

### Pseudo-code: cloud apply

```ts
async function startApply(session: CharSession, target: GithubTarget, apiKey: string) {
  const agent = await Agent.create({
    apiKey,
    model: "composer-2",
    cloud: {
      repos: [
        {
          url: target.cloneUrl, // https://github.com/org/repo
          startingRef: target.baseRef ?? "main",
        },
      ],
      autoCreatePR: true,
    },
  });

  const matchSheet = renderMatchSheet(session);
  const adrs = renderAdrs(session);
  const agentsConstraints = renderAgentsConstraints(session);

  const run = await agent.send(
    [
      "You are applying a CHAR session to this repository.",
      "Write these files exactly (create dirs as needed):",
      "- CHAR.md (Match Sheet + kept/killed/research summary)",
      "- docs/adr/NNNN-*.md for each hard-to-reverse kept decision (Matt Pocock ADR format)",
      "- Append or create AGENTS.md section ## CHAR constraints",
      "Vendor .agents/skills/grill-me and grilling if missing.",
      "Do not refactor application code.",
      "Open a PR summarizing the decisions.",
      "",
      "--- CHAR.md ---",
      matchSheet,
      "--- ADRs ---",
      adrs,
      "--- AGENTS.md fragment ---",
      agentsConstraints,
    ].join("\n"),
  );

  const result = await run.wait();
  const prUrl = result.git?.prUrl; // cloud result.git
  await sessionStore.setApply(session.id, {
    status: "pr_open",
    agentId: result.id, // bc-…
    prUrl,
  });
}
```

---

## C. Structured card schema & forcing structured output

### TypeScript types

```ts
export type SwipeAction = "keep" | "kill" | "research";
export type CardKind = "assumption" | "fork" | "research_brief";
export type CardOrigin = "grill" | "research" | "requeue";

export type AssumptionCard = {
  id: string;                    // ulid
  sessionId: string;
  kind: CardKind;
  origin: CardOrigin;
  assumption: string;            // the claim under judgment
  whyItMatters: string;          // one short sentence
  recommended: SwipeAction;      // AI stance (long-press reveals)
  recommendedRationale: string;
  heat: 1 | 2 | 3 | 4 | 5;
  branchId?: string;             // design-tree branch
  dependsOn?: string[];          // prior card ids
  forkOptions?: [string, string]; // kind === "fork"
  // research-colored cards:
  tint?: "default" | "research" | "invalidation";
  researchJobId?: string;
  invalidatesDecisionIds?: string[];
  createdAt: string;
};

export type Decision = {
  cardId: string;
  action: SwipeAction;
  at: string;
  supersededBy?: string;         // research invalidation id
  status: "active" | "invalidated" | "requeued";
};

export type ResearchBriefCard = AssumptionCard & {
  kind: "research_brief";
  tint: "research" | "invalidation";
  findings: string;
  sources: { title: string; url: string }[];
  verdict: "supports_keep" | "supports_kill" | "inconclusive" | "overturns";
  overturns?: { cardId: string; previousAction: SwipeAction; reason: string }[];
};
```

### How to FORCE structure (SDK only returns `result.result: string`)

| Pattern | Works on | Reliability | Verdict |
|---------|----------|-------------|---------|
| **A. `customTools.emit_cards`** | Local only | Highest — schema-validated at tool boundary; side-effect writes store | **Recommended for card generation** |
| **B. JSON-in-prompt + Zod parse of `result.result`** | Local + cloud | Medium — models drift; needs repair loop | Use for **cloud research/apply summaries** |
| **C. Network MCP tool** | Cloud (if MCP reachable) + local | High if MCP hosted | Production upgrade for cloud research; overkill for hackathon |

**Recommendation:** hybrid.

1. **Card generation (local):** Pattern A — `emit_cards` customTool. Cards hit the session store during the run; UI never waits on parsing `result.result`.
2. **Research (cloud):** Pattern B with a strict “JSON only” prompt + Zod + one repair `run.conversation()` turn if parse fails. Optional later: Pattern C MCP `submit_research_brief` on a public HTTPS endpoint.
3. **Do not** rely on a fictional `structuredOutput` / `response_format` field on `RunResult` — it does not exist.

### Zod + repair loop (cloud)

```ts
function parseResearchBrief(text: string): ResearchBrief {
  const json = extractFirstJsonObject(text);
  const once = ResearchBriefZod.safeParse(json);
  if (once.success) return once.data;
  throw new ParseError(once.error);
}

async function researchWithRepair(run: Run, raw: string) {
  try {
    return parseResearchBrief(raw);
  } catch {
    const repair = await run.conversation().send(
      "Your previous message was not valid JSON. Reply with ONLY the JSON object.",
    );
    return parseResearchBrief(repair.result);
  }
}
```

---

## D. Grill-me skill integration

### Skill chain (as shipped in this repo)

- `/grill-me` → “Run a `/grilling` session.” (`disable-model-invocation: true` — user/agent must invoke explicitly)
- `/grilling` → one question at a time, recommended answer, walk the design tree, don’t enact until shared understanding

CHAR **productizes** grilling: each “question” becomes a swipe card; the human answers with gestures instead of chat.

### Shipping skills into the agent workspace

SDK picks up reusable skills from the **project directory**. Cloud loads project files when the repo is cloned.

**Local workers**

1. Maintain a **skill pack** directory in the CHAR service repo, e.g. `agent-pack/`:
   ```
   agent-pack/
     .agents/skills/grill-me/SKILL.md
     .agents/skills/grilling/SKILL.md
     .agents/skills/research/SKILL.md
     .agents/skills/domain-modeling/ADR-FORMAT.md
     AGENTS.md          # tells agent: prefer emit_cards; CHAR session rules
   ```
2. On session start, copy `agent-pack/` → `/var/char/workspaces/{sessionId}/` (or bind-mount a read-only pack + writable overlay).
3. `Agent.create({ local: { cwd: thatPath, settingSources: ["project"] } })`.
4. Prompt must **explicitly** say `Run /grill-me` so the disabled-model-invocation skill still runs.

**Cloud workers**

1. Either clone a dedicated `char-agent-pack` GitHub repo as `cloud.repos[0]`, or
2. On Apply, vendor the same pack into the user’s repo so subsequent cloud runs see skills.
3. Research/Apply prompts invoke `/research` or file-write instructions after clone.

**CHAR-specific `AGENTS.md` overlay** (in the pack):

```md
## CHAR runtime
- When invoked for card generation: translate /grilling questions into emit_cards tool calls.
- Never wait for chat answers; the human swipes in a separate UI.
- Emit one card immediately, then continue the tree.
- Recommended stance on each card = your recommended answer from /grilling.
```

---

## E. Research job flow

```
Swipe ↑ on card C
    → UI sheet: 3 suggestion chips + free text
    → POST /api/research { sessionId, cardId, suggestions[], freeText }
    → Decision(C) = research (status: active)
    → Enqueue ResearchJob (async)
    → Cloud agent (bc-…) starts; UI shows “Intern is out”
    → On complete: parse ResearchBrief
         ├─ insert ResearchBriefCard (tint: research) at front of queue
         └─ if verdict === overturns:
                for each overturned decision D:
                  mark D.status = invalidated
                  push requeue card (tint: invalidation, origin: requeue)
                  record Invalidation { fromJob, cardId, previousAction }
    → User swipes research / invalidation cards (keep/kill/research again)
```

### API sketch

```ts
// POST /api/research
{
  sessionId, cardId,
  suggestions: string[], // exactly 3 UI-provided starters; user may edit
  freeText?: string
}

// ResearchJob
{
  id, sessionId, cardId,
  status: "queued" | "running" | "done" | "failed",
  agentId?: string,      // bc-…
  suggestions, freeText,
  brief?: ResearchBrief,
  error?: string
}
```

### ADR impact

- Research that **confirms** a keep → candidate ADR on Apply (if hard-to-reverse).
- Research that **overturns** → prior keep/kill is invalidated; if an ADR was drafted in-session draft state, mark `superseded`; on Apply only emit ADRs for **active** keeps that still qualify (hard to reverse + surprising + real trade-off — per ADR-FORMAT).
- Match Sheet lists `Invalidated:` separately so the residue tells the truth.

### Async delivery

- Worker updates Redis/Postgres; Next.js pushes via SSE `GET /api/stream/{sessionId}` events: `research.started | research.done | cards.appended | decisions.invalidated`.
- Client inserts tinted cards without blocking the main swipe stack (user can keep swiping other cards).

---

## F. Apply flow

**Trigger:** user taps Apply (explicit — never auto).

1. OAuth-gated GitHub repo picker (`owner/name`, base branch).
2. Server renders artifacts from session state:
   - `CHAR.md` — Match Sheet (kept / killed / research / forks / invalidations)
   - `docs/adr/NNNN-slug.md` — one per qualifying active keep
   - `AGENTS.md` — `## CHAR constraints` bullet list of killed assumptions (“do not build X”) + kept invariants
3. `Agent.create({ cloud: { repos: [{ url, startingRef }], autoCreatePR: true } })`
4. Prompt instructs exact file writes; agent commits on a branch and opens PR.
5. Persist `result.id` (`bc-…`), `result.git.prUrl`; UI deep-links PR + Cursor Agents Window.

### Files written

| File | Content |
|------|---------|
| `CHAR.md` | Pitch, Match Sheet tables, session id, timestamp |
| `docs/adr/*` | Pocock short ADRs for kept, hard-to-reverse decisions |
| `AGENTS.md` | Constraints from kills + invariants from keeps |
| `.agents/skills/…` (optional) | Vendor grill-me/grilling so the repo stays grillable |

---

## G. Auth

| Concern | Approach |
|---------|----------|
| **User login** | GitHub OAuth (NextAuth/Auth.js) — needed for Apply repo access |
| **GitHub API** | OAuth token with `repo` (or fine-grained) to list repos + let cloud agent authenticate via user’s linked Cursor/GitHub — cloud agent uses Cursor’s GitHub connection on the Cursor account that owns `CURSOR_API_KEY` |
| **Cursor API** | `CURSOR_API_KEY` — user-provided or platform service account |
| **Key storage** | Encrypt at rest (KMS / libsodium secretbox); never send key to browser; server-side workers only |
| **Hackathon** | Single demo service account key in env; GitHub OAuth still for Apply target |
| **Production** | Per-user Cursor keys (BYOK) or billed service account with quotas; rotate; audit `bc-` runs per user |

```ts
// env
CURSOR_API_KEY=...          // default service account
ENCRYPTION_KEY=...          // for per-user keys
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...
```

Cloud agents appear under the Cursor account of the API key — document that BYOK means runs show in *that* user’s Agents Window.

---

## H. Latency plan for ≤5s first card

Goal: first swipeable card on screen within **5 seconds** of “Heat it.”

| Tactic | Detail |
|--------|--------|
| **Local runtime** | Skip cloud VM cold start for extraction |
| **Warm workers** | Keep 1–N `Agent` processes / warm `cwd` skill packs pre-copied |
| **Emit-early prompt** | “Call emit_cards with the single hottest assumption first” |
| **SSE on tool execute** | UI listens; card appears when tool runs, not when run completes |
| **Small first model turn** | Don’t ask for 12–20 cards in one shot; stream batches |
| **Optimistic theater** | Match-strike animation covers 0–1.5s; card must land before animation ends |
| **Pitch trim** | Cap pitch tokens; summarize if >N chars before send |
| **Fail-soft** | If no card by 5s, show skeleton + “still striking…”; never block on full tree |

```ts
// Time budget
t0  pitch submit
t0  copy skill pack (cached) + Agent.create local   // target <800ms warm
t1  agent.send(grill prompt)
t1–t5  first emit_cards → SSE → render card         // HARD SLA
t5+    continue batches while user swipes
```

---

## I. Hackathon MVP cut vs production

### Hackathon MVP (~3h demo)

| Ship | Fake / skip |
|------|-------------|
| Pitch → local agent → `emit_cards` → swipe keep/kill/research | Real multi-tenant auth |
| Recommended stance on long-press | Per-user Cursor keys |
| Match Sheet share image | Full ADR quality bar |
| Research = one cloud (or even local) call that returns a tinted card | Primary-source rigor; repair loops |
| Apply = cloud `autoCreatePR` to a pre-chosen demo repo | Repo picker polish |
| In-memory/Redis session | Postgres, billing, PWA offline |

### Production

- Durable session store + job queue (BullMQ/Temporal)
- BYOK Cursor keys + quotas
- Network MCP for cloud structured research briefs
- Invalidation graph + ADR supersession
- Warm local worker pool / autoscaling
- Eval harness: card quality, time-to-first-card, parse failure rate
- Rate limits, abuse controls, content safety on pitches

---

## J. Top technical risks

1. **`customTools` local-only** — Easy to accidentally design cloud card generation; fails with `ConfigurationError`. Mitigation: two-runtime matrix above; CI assert no `customTools` in cloud paths.
2. **No native structured output** — Cloud research/apply JSON parse failures. Mitigation: Zod + repair turn; prefer tools/MCP when possible.
3. **Skill discovery** — `/grill-me` has `disable-model-invocation: true`; agent won’t auto-pick it. Mitigation: prompt must say `Run /grill-me`; pack must be in `cwd` / cloned repo; `settingSources: ["project"]`.
4. **Time-to-first-card** — Cold `Agent.create` + long first thought exceeds 5s. Mitigation: warm pool, emit-early prompt, SSE on tool.
5. **Grilling ≠ swipe semantics** — Classic `/grilling` waits for chat answers one-by-one; CHAR must reframe to fire-and-forget cards. Mitigation: CHAR `AGENTS.md` overlay + emit_cards contract.
6. **Research invalidation UX races** — User already swiped past related cards when brief returns. Mitigation: tinted re-queue at front; never silently rewrite history without a card.
7. **Apply auth / GitHub linking** — Cloud agent’s GitHub identity is the Cursor account on the API key, not necessarily the OAuth user. Mitigation: document BYOK; or only Apply to repos the Cursor-linked GitHub can write; verify with a dry-run.
8. **Cost & runaway agents** — Long grill trees + parallel research jobs. Mitigation: max cards/session, max concurrent research, cancel on session end.
9. **Prompt injection via pitch** — Founder text could instruct the agent to skip tools. Mitigation: tool-required loop (“you must call emit_cards”); ignore `result.result` for cards.
10. **Hackathon infra** — Local SDK workers need a machine that can run Cursor agent locally (not just serverless glue). Mitigation: long-lived Node worker VM beside Next.js; cloud-only fallback accepts higher latency for demo if local unavailable.

---

## Appendix: End-to-end sequence

```
User pitches
  → POST /api/sessions { pitch }
  → Local worker: Agent.create({ local, customTools: [emit_cards] })
  → send("Run /grill-me … emit first card immediately")
  → emit_cards → SSE → Card #1 (<5s)
  → User swipes → / → keep, ← kill, ↑ research sheet
  → Research → Cloud Agent.create({ cloud, repos, autoCreatePR: false })
  → Brief card (+ optional invalidations) re-queued
  → Apply → Cloud Agent.create({ cloud, repos, autoCreatePR: true })
  → CHAR.md + docs/adr/* + AGENTS.md → result.git.prUrl
```

## Appendix: Package / auth facts (do not invent beyond these)

- Package: `@cursor/sdk` — `Agent.create({ apiKey, model, local | cloud })`
- Cloud: `cloud: { repos: [{ url, startingRef }], autoCreatePR: true }` → VM clones repo, can open PR; `result.git.prUrl`
- Local: `local: { cwd, customTools?, settingSources? }` — `customTools` **only** on local
- `customTools`: JSON Schema `inputSchema`; `execute` returns `string | JSON | { content, structuredContent }`
- Skills: loaded from project directory; cloud loads on clone
- `result.result` is **string** only — parse or use tools
- Stream: `run.stream()`; continue: `run.conversation()`
- Auth: `CURSOR_API_KEY` (user or service account)
- Cloud agents: `bc-` ids; visible in Cursor Agents Window
- MCP: inline possible; cloud needs network-reachable MCP (not in-process `customTools`)

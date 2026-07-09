# CHAR

### Tinder for the lies your product tells itself.

**Live → [char-xi.vercel.app](https://char-xi.vercel.app)**

You don’t fail because you can’t code.  
You fail because you shipped a cathedral on a soft assumption and called it a roadmap.

CHAR puts that assumption on a card. You swipe. The soft spots get charred. What survives gets written into the repo — as rails agents actually obey.

---

## The problem

Founders don’t lack ideas. They lack **forced honesty**.

The usual loop:

1. Half-baked pitch lands in a notes app  
2. ChatGPT writes a polite PRD that agrees with you  
3. You vibe-code for a weekend  
4. Reality arrives as a user who doesn’t care  

The lies are quiet:

- “People will pay for this”  
- “We’ll add auth later”  
- “The repo is the product”  
- “Research can wait until after the demo”  

Chat interfaces make it worse. A blank prompt is a blank conscience. You type until the model flatters you. Nothing gets killed. Nothing gets kept with blood on it. Nothing lands in git.

**Judgment needs a muscle, not a paragraph.**

---

## The move

CHAR is **grill-me wearing a leather jacket**.

Matt Pocock’s `/grill-me` skill walks a decision tree one question at a time. CHAR turns that tree into a **swipe deck of assumptions** — not features, not tickets, not “nice-to-haves.”

| Gesture | Meaning |
|---------|---------|
| **→ Keep** | Load-bearing. You’ll build as if this is true. |
| **← Kill** | Soft / false / ego. Dead on arrival. |
| **↑ Research** | Don’t guess. Dispatch a cloud agent. Brief comes back as a distinct card that can overturn what you already kept. |

When you’re done (or tap **That’s enough**), you **Apply**:

- `CHAR.md` — the Match Sheet (kept / killed / researched / skipped)  
- `docs/adr/*` — only for keeps that are hard to reverse, surprising, and a real trade-off  
- `AGENTS.md` — constraints so the next agent builds **only what survived**  
- A cloud Cursor agent opens a **PR** on your GitHub repo  

The residue isn’t a shareable roast meme. It’s **rails in the repo**.

---

## Why this wins a hackathon

| What judges feel | What CHAR does |
|------------------|----------------|
| “Another AI chatbot” | No chat. Thumb decides. |
| “Demo dies in a transcript” | Demo ends in a **PR**. |
| “Skills are vibes” | Skills become **cards + ADRs**. |
| “Cursor is just an IDE” | Cursor is the **runtime** — grill, research, apply. |
| “Mobile?” | Built for the phone in your hand at the venue. |

**One-liner for the room:**  
*Throw your idea on the grill. Swipe until it stops lying. Apply the scars.*

---

## How it works (technical)

```
  ┌─────────────┐     heat      ┌──────────────────┐
  │  Phone UI   │──────────────▶│  Next.js (CHAR)  │
  │  swipe deck │◀──── cards ───│  session + MCP   │
  └─────────────┘               └────────┬─────────┘
                                         │
                    cloud Agent.create   │  HTTP MCP
                    (grill / research /  │  emit_cards
                     apply + autoCreatePR)│  emit_research
                                         ▼
                                ┌─────────────────┐
                                │  Cursor Cloud   │
                                │  + your GitHub  │
                                └─────────────────┘
```

### Stack

- **Next.js 16** App Router, TypeScript, Tailwind — mobile-first dark UI  
- **Clerk** — sign-in for the solo founder  
- **`@cursor/sdk`** — cloud agents for grill, research, and Apply  
- **HTTP MCP** (`/api/mcp`) — structured `emit_cards` / `emit_research` (cloud can’t use `local.customTools`)  
- **Zod** — card / research schemas  
- **Motion + React Bits** — swipe physics, BlurText, FadeContent  

### The hard SDK truth we designed around

| Constraint | CHAR’s answer |
|------------|----------------|
| `customTools` only work on **local** agents | Opening grill runs **cloud** + calls our public MCP |
| Cloud needs a repo to clone | Pitch-only sessions use `CHAR_FALLBACK_REPO` |
| `result.result` is a **string** | Structure comes from MCP tool calls, not hope-parsing |
| Apply must touch git | Cloud agent with `autoCreatePR: true` → poll until `prUrl` |

### Session loop

1. **Heat** — pitch (+ optional repo URL) → cloud grill agent  
2. **Emit** — agent calls MCP `emit_cards` → queue fills  
3. **Swipe** — keep / kill / research; research can invalidate + re-queue  
4. **Apply** — preview Match Sheet → confirm → artifacts + PR  

Hackathon honesty: sessions are **in-memory** (fine for a 3-hour demo; not a multi-tenant SaaS).

---

## Try it

**Production:** [https://char-xi.vercel.app](https://char-xi.vercel.app)

Clerk: allow origin `https://char-xi.vercel.app`.

### Local (mock, no keys)

```bash
cd char
cp .env.example .env.local
# CHAR_MOCK=1 and CHAR_DEV_BYPASS=1 are fine for UI
npm install
npm run dev
```

### Real cloud grill

| Var | Purpose |
|-----|---------|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` / `CLERK_SECRET_KEY` | Auth |
| `CURSOR_API_KEY` | CHAR service key for Agent SDK |
| `CHAR_PUBLIC_URL` | Public base URL cloud agents hit for `/api/mcp` |
| `CHAR_MCP_SECRET` | Bearer for MCP |
| `CHAR_FALLBACK_REPO` | Clone target when there’s no user repo |
| `CHAR_MOCK=0` | Live agents |

---

## Repo map

```
char/
  src/app/           # UI + API routes
  src/app/api/mcp/   # HTTP MCP for cloud card/research emit
  src/components/char/  # SwipeCard, GrillSession
  src/lib/cursor-agents.ts
docs/
  char-decisions.md  # locked product calls
  char-architecture.md
  adr/               # how Apply writes ADRs
.agents/skills/      # grill-me, grilling, …
```

---

## What we deliberately didn’t build

Multi-tenancy. BYOK. Billing. Native App Store binary. A chatbot with a sparkle icon.

CHAR is one composition: **pitch → judgment → residue in git.**

---

## Credits

- Grilling brain: [Matt Pocock skills](https://skills.sh/mattpocock/skills) (`/grill-me`)  
- Runtime: [Cursor Agent SDK](https://cursor.com)  
- Built for the **London iOS Cursor Hackathon 2026** — from Cursor, for the phone in your pocket  

---

*Keep what can carry weight. Kill what can’t. Research what you’re afraid to know. Apply the rest.*

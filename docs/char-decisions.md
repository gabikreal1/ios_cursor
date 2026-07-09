# CHAR — Locked decisions (grill complete)

Shared understanding from `/grill-me` session. Build against this.

## Product

| # | Decision |
|---|----------|
| 1 | **ICP:** Solo founders |
| 2 | **Moment:** Post-idea / pre-build impulse |
| 3 | **Card unit:** Assumptions (not features) |
| 4 | **Residue:** Apply to repo via Cursor Agent SDK (not vanity share-first) |
| 5 | **Apply mode:** Write MD rails + kick scoped agent (`CHAR.md` + ADRs + `AGENTS.md`) |
| 6 | **UI surface:** Mobile-first web app |
| 7 | **Repo bind:** Explicit URL (optional) |
| 8 | **Gestures:** → keep · ← kill · ↑ research (3 suggestions + free-text) |
| 9 | **Research:** Distinct-colour card; can invalidate prior decisions; re-queue to front |
| 10 | **Apply gate:** Explicit preview → confirm; research never writes git mid-session |
| 11 | **First cards:** Hybrid stream as parents exist (heat theater while cloud provisions) |
| 12 | **Opening grill:** Cloud agent (pitch + optional repo) + **HTTP MCP `emit_cards`** |
| 13 | **Skills on open:** Inline grill-me instructions (don’t require skills in their repo) |
| 14 | **Repo optional:** Pitch-only vs repo-grounded cards |
| 15 | **Auth/cost:** Clerk login; **CHAR service `CURSOR_API_KEY`**; single-player (your GitHub) |
| 16 | **MVP:** Clerk → pitch/repo → cloud grill → swipe (+ real research re-queue) → Apply → PR |
| 17 | **Done rule:** Agent `done` + **empty queue including remakes**; **That’s enough** anytime |
| 18 | **End state:** Poll apply until `prUrl` ready |
| 19 | **UI:** React Bits TS-TW + iOS-feel minimal dark (`Stack`, `BlurText`, `GlassSurface`, `SpotlightCard`, `Dock`, `FadeContent`) |

## ADR rules on Apply (from Matt Pocock `ADR-FORMAT`)

Write to `docs/adr/NNNN-slug.md` only when **all three** are true for a **kept** assumption:

1. Hard to reverse  
2. Surprising without context  
3. Real trade-off  

Template (short):

```md
# {Short title}

{1-3 sentences: context, decision, why.}
```

Optional: `Status: accepted | superseded by ADR-NNNN`, Considered Options, Consequences.

**Mapping from swipes:**

| Swipe | Apply behavior |
|-------|----------------|
| **Keep** (qualifies) | New ADR `accepted` + listed in `CHAR.md` |
| **Keep** (trivial) | Listed in `CHAR.md` only — no ADR |
| **Kill** | Listed under Killed in `CHAR.md`; may appear as rejected option on a related ADR |
| **Research → remake** | If prior ADR existed, mark `superseded by ADR-NNNN` and write the new one |
| **That’s enough** (skipped) | Listed as unpaid/skipped in `CHAR.md`; no ADR |

Also write:

- `CHAR.md` — Match Sheet (kept / killed / research / skipped / forks)
- `AGENTS.md` — constraint bullets agents must respect (“build only what survived”)

## Runtime

| Job | Runtime |
|-----|---------|
| Opening grill + card emit | Cloud + HTTP MCP `emit_cards` |
| Research | Cloud follow-up / second run → MCP brief |
| Apply | Cloud `autoCreatePR: true` on your repo |

## Out of scope (hack)

Multi-tenancy, BYOK, Tarot/Heatcheck skins, native iOS app, App Store, rate limits, production billing.

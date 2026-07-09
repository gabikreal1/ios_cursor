# Ambient & Glanceable Surfaces for AI Apps (iOS 18+ / mid-2026)

**Verdict:** App Intents are the spine. Widgets, Controls, Live Activities, Shortcuts, Siri, Action Button, and Watch all consume the same intents.

| Need | Surface | Interrupt? |
|------|---------|------------|
| Ongoing job with start/end | **Live Activity** | Only on milestones |
| Persistent status / next action | **Widget** | Never |
| Instant verb | **Control** / Action Button | User-initiated |
| Voice / automation / Spotlight | **App Intent** | User-initiated |
| Wrist glance | **Watch** | Minimal |
| Must break through Focus | **Time Sensitive** (rare) | Yes — sparingly |

---

## WidgetKit

- Families: Home (`systemSmall/Medium/Large`), Lock Screen accessories (display-only), StandBy (`systemSmall` across-the-room)
- Interactive widgets: `Button(intent:)` / `Toggle` — inactive while locked
- Timeline budget: ~40–70 reloads/day; entries ≥ ~5 min; prefer long predicted timelines
- Smart Stack: `TimelineEntry.relevance` + `PredictableIntent` donations
- **AI patterns:** next-best-action small widget; configurable agent/project medium; StandBy coach pulse (large type, no chat)

## Live Activities / Dynamic Island

- Bounded events ≤ ~8 hours; ContentState ≤ ~4 KB
- Presentations: Compact / Minimal / Expanded / Lock Screen / StandBy — design each density
- Push: priority 5 for routine progress; 10 only for milestones; don’t also fire a normal push for the same update
- **AI patterns:** generation/agent run phases; live coaching session; “needs your choice” with Approve/Reject
- **Kill criteria:** ads, idle “AI is ready,” perpetual presence → HIG + Guideline 4.5.3

## Control Center Controls (iOS 18+)

- `ControlWidgetButton` / `ControlWidgetToggle`; also Lock Screen + Action Button (+ Watch Control Center on newer watchOS)
- Fast, idempotent, privacy-safe when locked
- **AI patterns:** start/stop listening; capture-for-AI; push-to-talk / start session

## App Intents / Shortcuts / Siri

- Define verbs (`AppIntent`) + nouns (`AppEntity`) once; reuse everywhere
- Ship 2–5 crisp App Shortcuts with `\(.applicationName)` in phrases
- Focus filters via `SetFocusFilterIntent`
- Adopt assistant schemas so Siri / Apple Intelligence can compose your actions
- **AI patterns:** Summarize/Rewrite/Extract; `StartSession(goal:)`; Entity queries for user-built Shortcuts

## Apple Watch

- Complications + Smart Stack Live Activities + Controls
- Double Tap / Action Button → same intents as phone
- Prefer haptics + phase over streaming transcripts to the wrist

## Notifications

- Passive for digests; Active for “draft ready”; Time Sensitive rare; Critical almost never for consumer AI
- Actionable categories: Open / Retry / Dismiss / short text steer
- Never: streak nags, engagement spam, model marketing

## Camera Control / Locked Capture

- `LockedCameraCapture`: no network until unlock; AppContext ≤ 4 KB
- Action Button → Control or App Shortcut for non-camera AI verbs

## Design principles

1. Glanceable in <1s; one job per surface  
2. Progressive disclosure: compact label → expanded steps → app for full detail  
3. Lock Screen is public — redact PII (`privacySensitive()`)  
4. Useful logged-out widget placeholder (empty “Sign in” is review risk)  
5. Prefer LA/widget updates over pushes for the same fact  

## Review landmines for AI apps

- 4.3(b) spam / low-effort AI wrappers  
- 4.5.3 Live Activities as spam channel  
- 2.5.16 irrelevant widgets/notifications  
- 5.1 privacy / undisclosed third-party model uploads  
- Fake Communication Notifications; Critical Alerts without entitlement  
- Health claims you can’t validate (1.4.1)  

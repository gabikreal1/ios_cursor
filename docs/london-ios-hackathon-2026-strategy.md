# London iOS Cursor Hackathon 2026 — Win Strategy Memo

**Event:** Evening hackathon · ~3.25h hacking (18:20–21:45) · Solo or ≤3 · **Build in Cursor on iPhone**  
**Demo:** Loom/YouTube ≤2 min showing **how you used iOS Cursor** · Top 5 do live 2-min demos  
**Tracks:** Open Track · Realize the future of remote control building  
**Prizes:** Ultra plan months + Supabase credits

**Verdict up front:** Enter the **remote-building track**. Ship a **phone-native control plane for agent work with structured human oversight** — not a polished sensor app. iOS Cursor must be the product surface in the demo, not just the IDE that wrote the code.

**Europe-now twist (Jul 2026):** Layer **EU AI Act Article 50 transparency** (enforcement **2 Aug**) and/or a **London heatwave / on-call** persona onto the same spine. See [europe-agenda-july-2026.md](./europe-agenda-july-2026.md).

---

## 1. Constraint analysis

### What is actually buildable in ~3.25h from Cursor iOS

| Feasible | Borderline | Trap |
|---|---|---|
| Cloud agent workflows: kickoff → PR → review → merge from phone | Thin Next.js / Supabase “ops console” that agents build *for* phone review | Native SwiftUI App Store app with sensors, widgets, Live Activities |
| Repo skills / AGENTS.md / slash-command playbooks that encode a Software Factory | Screenshot → annotated bug → agent fix loop (Cursor’s own blog use case) | Multi-agent orchestration platform with auth, billing, multi-tenant |
| Structured review UI: Approve / Request changes / Escalate / Kill | Voice-brief → tickets → parallel agents → one mergeable PR | Anything requiring Xcode on-device, TestFlight, entitlement approvals |
| Safety gates: risk labels, blast-radius, “human must merge”, allowlists | Phone context *as prompt input* (photo/voice/location note) bridged into agent brief | “Ambient always-on” that needs real background location / HealthKit polish |
| Demo that *is* the iOS Cursor session (Live Activities, notifications, diff review, merge) | Remote Control of a laptop agent (needs awake machine + setup risk at venue) | Competing on UI polish against teams who ignore the demo brief |

**Hard truth:** You are not shipping an App Store product tonight. You are shipping a **credible workflow + artifacts + a demo that makes judges feel the future of building away from a desk**.

What Cursor iOS actually gives you (use these as demo beats):

- Launch always-on **cloud agents** from phone (repo pick, model pick, voice, slash commands)
- **Live Activities** + push when agent finishes / needs input / ready for review
- Review **demos, screenshots, logs, diffs**; leave follow-ups; **merge PRs on the go**
- **Remote Control** of agents on a computer (optional; higher setup risk — treat as spice, not spine)
- Handoff local ↔ cloud; agents produce merge-oriented work asynchronously

### What most teams will do wrong

1. **Treat iOS Cursor as a weird keyboard for coding** — then demo a web app that could have been built on a laptop. Judges explicitly want *how you used iOS Cursor*.
2. **Open Track consumer app cosplay** — Pulseboard/Pinpoint-class ideas are great products, terrible 3h phone-only builds. No Xcode on phone; sensor entitlements and ambient UX eat the clock.
3. **Overbuild the factory, underbuild the oversight** — “agents do everything” without Approve / Deny / Escalate loses the Safety & oversight criterion that Cursor cares about.
4. **No pre-seeded repo** — starting from empty at 18:20 means half the night is plumbing. Winners arrive with a demo repo, sample PRs, and a scripted scenario.
5. **Demo is a feature tour** — 2 minutes is one story: *idea on the Tube → agent works → phone review with a hard gate → merge or kill*.
6. **Remote Control as the whole bet** — venue Wi‑Fi + laptop sleep + client version drama. Prefer cloud agents as the reliable path; Remote Control only if pre-tested.
7. **Ignore Supabase/Ultra prize signals** — a tiny real backend (jobs, review decisions, audit log) reads more “shipped” than pure markdown skills — but don’t let Supabase become the product.

### Buildability rule for tonight

> **One vertical loop, one persona, one irreversible action that requires a human.** Everything else is narration.

---

## 2. Scoring map

| Criterion | What judges want | How to show it in ≤2 min |
|---|---|---|
| **Technical execution** | Something that *runs*, not slides. Real agent run, real PR, real gate. | Screen-record: voice/text kickoff in iOS Cursor → Live Activity → finished agent with diff/demo artifact. |
| **Product thinking** | Clear user + moment (“founder on commute,” “on-call at dinner”). Sharp wedge, not “AI devops platform.” | Open on the *moment*: screenshot of a bug / voice note / pager text → “this is when you’d open Cursor on your phone.” |
| **Agent autonomy** | Agent does real work unsupervised for minutes; human isn’t pair-programming every line. | Cut away / time-lapse while agent works; return on notification. Show parallel agents if Software Factory. |
| **UX clarity** | Phone UX for *decisions*, not for editing 400-line diffs. Big verbs: Approve, Request changes, Merge, Kill. | Spend 40s on the review surface: risk badge, summary, one-tap actions — not scrolling code. |
| **Real-world applicability** | Someone would use this Monday. Map to Cursor’s own stories: incidents, customer bugs, screenshot feedback. | Use a realistic fixture (Sentry-like alert, Intercom-like complaint, ugly UI screenshot). |
| **Safety & oversight** | Autonomy *with brakes*. Blast radius, policy, audit, no silent prod merge. | Explicit gate: “Agent cannot merge. Human merges.” Show Reject with reason → agent revises. Log the decision. |

**Demo time budget (strict):**

| Seconds | Beat |
|---|---|
| 0–15 | Persona + pain (“I’m not at my desk”) |
| 15–35 | Kick off from **iOS Cursor** (voice or screenshot) — *hero shot* |
| 35–55 | Autonomy montage (Live Activity / notification / agent working) |
| 55–95 | Review + **oversight decision** (approve path *or* reject→fix) |
| 95–110 | Outcome (PR merged / ticket closed) + one-line “what’s next” |
| 110–120 | Title card: product name + track |

If iOS Cursor is only visible in beat 2 as “we typed here,” you lose. It must appear in kickoff **and** review/merge.

---

## 3. Eight hackathon-shaped ideas (ranked by win probability)

### #1 — **Gatekeeper** — Ambient PR review with structured oversight
**One-liner:** Phone-first review cockpit: agents propose; humans decide with risk-aware actions.  
**Track:** Remote control building (primary)  
**Why it scores:** Maxes Agent autonomy + Safety/oversight + UX clarity; demo *is* iOS Cursor review/merge. Matches Cursor’s launch narrative.  
**MVP (3h):** Pre-seeded repo + 2 fixture PRs (safe docs change vs risky auth change). Skill/agent that labels risk, summarizes blast radius, posts a `REVIEW.md`. Phone flow: open agent result → Approve / Request changes / Kill. Optional tiny Supabase `review_decisions` audit table.  
**iOS Cursor as hero:** Kickoff review agent from phone; Live Activity; inspect demo/diff; merge or follow-up — the product *is* this loop.  
**Safety:** Risk tiers; merge only by human; deny-by-default for `auth/`, migrations, secrets; audit log.  
**Coolness 8 / Feasibility 9** — **Primary recommendation.**

### #2 — **Commute Factory** — Idea → tickets → agents → PR from the phone
**One-liner:** Founder speaks a feature on the bus; factory decomposes, spawns agents, returns one reviewable PR.  
**Track:** Remote control building  
**Why it scores:** Product thinking + autonomy + applicability (B2B founder shipping). Spectacle of parallel work.  
**MVP:** Voice brief → agent writes 3 tickets (markdown/GitHub issues) → 2 worker agents on scoped tickets → integrator opens PR. Hard cap: one feature, one PR, no deploy.  
**iOS Cursor as hero:** Voice input kickoff; notifications as each stage completes; final review/merge on phone.  
**Safety:** Tickets require “plan approve” before workers spawn; workers can’t touch protected paths; human merges.  
**Coolness 9 / Feasibility 7** — Slightly more moving parts than Gatekeeper; win if the factory stages are crisp.

### #3 — **Shotfix** — Mobile visual QA / screenshot-to-PR
**One-liner:** Annotate a bad UI screenshot on your phone; agent reproduces, patches, returns before/after.  
**Track:** Remote control building (or Open if framed as mobile-first QA)  
**Why it scores:** Cursor blog literally describes this; visual demos are judge-candy; clear UX.  
**MVP:** Fixture web app with an obvious UI bug; phone screenshot + instructions → agent fix → agent-generated before/after screenshots in PR.  
**iOS Cursor as hero:** Screenshot as visual context into agent; review artifacts on phone; merge.  
**Safety:** Agent only edits `frontend/`; no dependency bumps; human approves visual diff.  
**Coolness 8 / Feasibility 8** — Excellent backup if Gatekeeper feels too “process-y.”

### #4 — **PagerPilot** — On-call incident → investigate → proposed fix
**One-liner:** Paste/forward an alert; agent investigates codebase + logs stub; opens fix PR before you’re back at a desk.  
**Track:** Remote control building  
**Why it scores:** Real-world applicability (Cursor’s own on-call story); autonomy under time pressure.  
**MVP:** Fake alert payload → agent reads runbook skill + repo → hypothesis + PR. Optional Supabase “incident” row with status.  
**iOS Cursor as hero:** Kickoff from notification-shaped moment; follow Live Activity during dinner; review PR on phone.  
**Safety:** “Propose only” mode; never auto-deploy; severity-based required reviewers; redact secrets in logs.  
**Coolness 8 / Feasibility 7** — Needs a convincing fixture; don’t fake Datadog for real.

### #5 — **Context Bridge** — Phone sensors/context as *input* to cloud agents
**One-liner:** Capture place/voice/photo on phone → structured brief → cloud agent ships work grounded in *where you are / what you saw*.  
**Track:** Open Track (with remote-building flavor)  
**Why it scores:** Bridges prior research (Pinpoint/Pulseboard instincts) without shipping a full ambient iOS app; unique among factory clones.  
**MVP:** **Do not** build native geofencing. Instead: Shortcuts/share sheet or a 1-page mobile web form: photo + voice note + optional lat/long paste → webhook/Supabase row → Cursor agent prompt includes that packet. Demo: “I’m at the client site, this broken screen…”  
**iOS Cursor as hero:** Context capture → agent launch from phone → review. Show the brief packet in the agent prompt.  
**Safety:** Explicit consent copy; context TTL; no silent Always-location; PII scrubber before prompt.  
**Coolness 9 / Feasibility 6** — Differentiation high; glue risk high. Only if someone on the team already knows Shortcuts/Supabase cold.

### #6 — **Deskless Ship** — B2B “founder commute” release train
**One-liner:** From phone: pick staged changelog → run QA agent → approve release notes → tag/merge.  
**Track:** Remote control building  
**Why it scores:** Real-world applicability for indie/B2B founders; clear oversight moments.  
**MVP:** Changelog draft + QA checklist agent + “release officer” human approval screen; merge to `main` only after approve.  
**iOS Cursor as hero:** Entire release officer flow on phone during a fake commute montage.  
**Safety:** Separate `release` role; checklist must be green; no force-push; rollback PR pre-staged.  
**Coolness 7 / Feasibility 7** — Solid but less “wow” than Factory/Shotfix unless release anxiety is sold hard.

### #7 — **Ambient Review Bot** — Always-on PR watcher with phone escalation
**One-liner:** Agent watches new PRs; only pings your phone when risk > threshold or tests fail.  
**Track:** Remote control building  
**Why it scores:** Ambient agents criterion; safety via selective attention.  
**MVP:** GitHub webhook or polling skill on fixture PRs; push-like notification text in demo; deep link into Cursor review. (True push may be stubbed with Live Activity on an agent you start.)  
**iOS Cursor as hero:** Notification → open Cursor → decide.  
**Safety:** Quiet hours; escalate-only policy; never auto-merge.  
**Coolness 7 / Feasibility 5** — Ambient is hard to *demo* in 2 min unless scripted tightly; easy to look fake.

### #8 — **Pulseboard Lite** — Lock Screen “now layer” for personal AI
**One-liner:** Widget/Live Activity showing next action from calendar/context.  
**Track:** Open Track  
**Why it scores:** Beautiful product story from prior research — **weak hackathon fit**.  
**MVP:** Even a SwiftUI stub is hostile from phone-only Cursor in 3h. Web mock ≠ iOS ambient.  
**iOS Cursor as hero:** Weak — Cursor is only the builder, not the runtime control plane.  
**Safety:** On-device defaults (good product, irrelevant to judging tonight).  
**Coolness 9 / Feasibility 2** — **Do not pick** unless rules unexpectedly allow pre-built native apps and Cursor is only for iteration (still misaligned with demo brief).

---

## 4. Top recommended play

### Primary: **Gatekeeper** (Remote-building track) + Europe twist

**Why this wins an evening hackathon:**

1. **Demo alignment is perfect** — kickoff, wait, review, merge are native iOS Cursor verbs.
2. **Judging criteria coverage** — autonomy (agent reviews/labels) + oversight (human gate) is the Cursor-shaped thesis, not a bolted-on ethics slide.
3. **Feasibility** — one repo, one skill, two fixture PRs, optional tiny audit DB. No sensor permissions, no Xcode, no Remote Control dependency.
4. **Differentiation vs the field** — many teams will show “agent wrote code.” You show “agent worked; human governed; phone was the control plane.”
5. **Failure mode is still demoable** — if the fancy UI slips, the iOS Cursor review + a `REVIEW.md` risk card still tells the story.
6. **Europe relevance** — stamp Art.50 disclosure on AI-facing outputs; open the pitch with on-call *or* heatwave commute (“I had to ship from my phone”).

**Ruthless scope cut:** No multi-tenant SaaS. No Slack. No auto-merge. No “platform.” Ship **risk-aware review decisions on the phone**.

### Backup A: **Shotfix**

Switch if: your team is stronger at frontend visual bugs than process/product narrative, or Gatekeeper starts feeling like “GitHub with extra steps” in rehearsal. Shotfix has instant visual proof and Cursor’s own blog as prior art — judges get it in 10 seconds.

### Backup B (Open Track / local wow): **Heatwave Commute Copilot**

Switch if: the room energy is “build something London feels tonight” and you want Open Track empathy over factory narrative. Still build *from* Cursor iOS; still show agent autonomy + human oversight on any automated claims/routes.

**Do not backup to native ambient apps.** That’s a different competition.

---

## 5. Execution timeline (18:20–21:45)

**Pre-doors (mandatory, before 18:20):**

- [ ] Cursor iOS installed, paid plan working, **test cloud agent** on a throwaway repo
- [ ] Demo repo created: small web app + CI green + `main` protected (merge via PR)
- [ ] Two fixture branches/PRs ready (or scripts to open them)
- [ ] `AGENTS.md` / review skill draft written on laptop *or* first agent task queued
- [ ] Loom/screen recording rehearsed on iPhone (mic, 1080p, Do Not Disturb exceptions for Cursor)
- [ ] Decide primary vs backup in 60 seconds at start — no debate club

| Time | Block | Actions |
|---|---|---|
| **18:20–18:30** | Decide & script | Lock Gatekeeper (or Shotfix). Write 5-beat demo script on Notes. Name the persona. |
| **18:30–18:45** | Scaffold | From **iPhone Cursor**: agent creates skill + `REVIEW` template + risk rules + optional Supabase audit table schema. Do not hand-type architecture. |
| **18:45–19:30** | Core loop | Make one happy path work end-to-end: trigger review agent → artifact on PR → human decision recorded → merge from phone. |
| **19:30–20:00** | Second path | Implement **reject → agent revises** OR risky vs safe PR contrast (oversight proof). |
| **20:00–20:25** | Polish | Risk badges, short PR summary, kill switch copy, README “how it works” for judges. Kill any half-built extras. |
| **20:25–20:40** | Dry run | Full demo once without recording. Fix the #1 break. |
| **20:40–21:10** | Record | 2–3 takes of ≤2 min Loom/YouTube. Pick the cleanest. **iOS Cursor on screen ≥40% of runtime.** |
| **21:10–21:30** | Buffer | Re-record if needed; add title card; submit; prep live Top-5 version (same script, slower). |
| **21:30–21:45** | Freeze | No new features. Only “demo won’t start” fixes. |

**Team split (if 2–3 people):**

- **A — Agent/skills/repo** (factory rules, fixtures)
- **B — Decision surface** (REVIEW format, Supabase audit, copy)
- **C — Demo director** (script, recording, timing, persona props)

Solo: skip Supabase; markdown audit trail is enough.

---

## 6. Grill questions (resolve before doors open)

1. **Who is the user in one breath?** On-call engineer, solo founder, or EM reviewing PRs on the school run? If you can’t pick one, Gatekeeper becomes “GitHub mobile cosplay.”
2. **What is the irreversible action, and who is allowed to take it?** If the agent can merge, what’s your safety story? If only humans merge, is the product still more than notifications?
3. **What does the phone UI decide that desktop GitHub doesn’t?** If the answer is “prettier summary,” you lose Product thinking. Need: risk tier, blast radius, policy, one-tap Approve/Kill tied to repo rules.
4. **What is fake in the demo, and will judges smell it?** Fixture alerts and staged PRs are fine; fake Live Activities or “agent finished” cuts without a real run are fatal. Pre-bake one real successful agent run you can replay.
5. **Cloud agent or Remote Control as the spine?** Default **cloud**. Only choose Remote Control if you’ve tested keep-awake + venue network + client version tonight. What’s plan B if Remote Control flakes at 20:40?

---

## Appendix A — Anti-portfolio (do not build)

- Full Pulseboard / Pinpoint / Verb native apps  
- Multi-agent “operating system for companies”  
- Anything needing HealthKit, Always location, or Screen Time entitlements  
- Auth0 + billing + marketing site  
- A demo where you never open Cursor iOS after the first compile

## Appendix B — One-sentence pitch (use this)

> **Gatekeeper turns iOS Cursor into a control tower: cloud agents do the work; your phone is where risk gets labeled, decisions get logged, and only humans merge.**

## Appendix C — Link to prior research

Prior Open Track ambient concepts (Pulseboard, Pinpoint, Verb) remain strong *product* bets for a longer build — see `docs/research/`. For this hackathon’s constraints and judging, they are intentionally deprioritized in favor of phone-as-control-plane workflows.

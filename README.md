# CHAR — built in this repo

### Tinder for the lies your product tells itself.

**Live → [char-xi.vercel.app](https://char-xi.vercel.app)**  
**App → [`char/`](./char/)** · **Story → [`char/README.md`](./char/README.md)**

You don’t fail because you can’t code.  
You fail because you shipped on a soft assumption and called it a plan.

CHAR turns Matt Pocock’s `/grill-me` into a **swipe deck of assumptions**. Keep · kill · research. Then **Apply** writes `CHAR.md` + ADRs + `AGENTS.md` into your GitHub repo via the Cursor Agent SDK — and opens a PR.

Built for the [London iOS Cursor Hackathon 2026](https://cursor-ios-hackathon-07-2026.vercel.app/).

---

## Start here

| Link | What |
|------|------|
| **[char/README.md](./char/README.md)** | Problem, pitch, technicals — the hackathon story |
| **[char/](./char/)** | Next.js app (Clerk + `@cursor/sdk` + HTTP MCP) |
| [docs/char-decisions.md](./docs/char-decisions.md) | Locked product calls |
| [docs/char-architecture.md](./docs/char-architecture.md) | Runtime / MCP / Apply design |
| [docs/creative-grill-concepts.md](./docs/creative-grill-concepts.md) | CHAR + sibling concepts |

```bash
cd char && cp .env.example .env.local && npm install && npm run dev
```

---

## Research trail (how we got here)

This workspace started as iOS device-context × AI research, then remapped for a 3-hour Cursor-on-iPhone hack:

- [Hackathon win strategy](docs/london-ios-hackathon-2026-strategy.md)
- [Europe agenda (Jul 2026)](docs/europe-agenda-july-2026.md)
- [Device context catalog](docs/research/ios-device-context-catalog.md)
- [App concepts](docs/research/ios-ai-app-concepts.md)

## Agent skills

Matt Pocock pack via [`skills.sh`](https://skills.sh/mattpocock/skills) → `.agents/skills/`  
(`/grill-me`, `/grilling`, `/grill-with-docs`, …)

---

*Keep what can carry weight. Kill what can’t. Apply the scars.*

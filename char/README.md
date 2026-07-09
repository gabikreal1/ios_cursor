# CHAR

Mobile-first web app: swipe assumption cards (grill-me), research, Apply → `CHAR.md` + ADRs + `AGENTS.md` via Cursor Agent SDK.

## Quick start (mock, no keys)

```bash
cd char
cp .env.example .env.local
npm run dev
```

With `CHAR_MOCK=1` and `CHAR_DEV_BYPASS=1`, you can heat a pitch and swipe without Clerk/Cursor keys.

## Real cloud grill / Apply

Set in `.env.local` / Vercel:

| Var | Purpose |
|-----|---------|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` / `CLERK_SECRET_KEY` | Clerk auth |
| `CURSOR_API_KEY` | Cursor Agent SDK (your account) |
| `CHAR_PUBLIC_URL` | Public base URL for MCP (`https://…`) — cloud agents must reach `/api/mcp` |
| `CHAR_MCP_SECRET` | Bearer shared with MCP headers |
| `CHAR_FALLBACK_REPO` | Repo to clone for pitch-only grills |
| `CHAR_MOCK=0` | Disable mock cards |

Turn off bypass for real Clerk: `CHAR_DEV_BYPASS=0`.

## React Bits

Registry in `components.json`:

```json
"@react-bits": "https://reactbits.dev/r/{name}.json"
```

Installed: Stack, BlurText, FadeContent, SpotlightCard, GlassSurface, SplitText (TS-TW).

## Docs

- Product decisions: `../docs/char-decisions.md`
- Architecture: `../docs/char-architecture.md`
- ADRs: `../docs/adr/`

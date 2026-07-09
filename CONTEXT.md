# CHAR

## Glossary

| Term | Meaning |
|------|---------|
| **Pitch** | Founder's initial request / idea dump |
| **Assumption card** | One load-bearing belief the idea needs to be true; swipe unit |
| **Keep / Kill / Research** | Swipe right / left / up |
| **Research brief** | Tinted card returned after ↑ research; may invalidate prior decisions |
| **Re-queue** | Putting affected kept/killed cards back at the front of the stack |
| **Match Sheet** | `CHAR.md` summary of kept / killed / researched / skipped |
| **Apply** | Explicit action: write rails to GitHub + open PR via Cursor cloud agent |
| **That’s enough** | Force-stop; unpaid cards marked skipped; still can Apply |
| **emit_cards** | HTTP MCP tool cloud agents call to push structured cards into a session |
| **Repo-grounded** | Cards produced with codebase context |
| **Pitch-only** | Cards produced from pitch without a repo |

## Product one-liner

Tinder for the lies your product tells itself — grill-me as swipe cards, then Apply decisions into the repo as `CHAR.md` + ADRs + `AGENTS.md`.

## Runtime one-liner

Cloud Cursor agent grills pitch (+ optional repo) → MCP emits cards → founder swipes → Apply cloud agent writes docs and opens a PR.

# Cloud grill + HTTP MCP for structured cards

Opening grill runs on Cursor **cloud** agents so the founder's GitHub repo is cloned without our workers owning git. Cloud rejects `local.customTools`, so structured swipe cards are emitted through a **network HTTP MCP** (`emit_cards`) hosted by the CHAR Next.js app, validated with Zod, and pushed to the session over SSE.

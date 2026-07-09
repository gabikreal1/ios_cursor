export function buildGrillPrompt(input: {
  sessionId: string;
  pitch: string;
  repoUrl?: string;
  mcpNote: string;
}): string {
  const grounded = input.repoUrl ? "repo-grounded" : "pitch-only";
  return `You are running a CHAR grilling session (Matt Pocock /grill-me style) for a solo founder.

## Mission
Turn the pitch${input.repoUrl ? " AND this repository's codebase" : ""} into an ordered decision tree of ASSUMPTIONS (not features).
Do NOT ask the user questions in chat. Emit swipe cards via the MCP tool emit_cards instead.

## Pitch
"""
${input.pitch}
"""

${input.repoUrl ? `## Repo\n${input.repoUrl}\nExplore the codebase briefly before emitting cards.` : "## Mode\nPitch-only (no repo). Mark grounded as pitch-only."}

## Card rules
- Each card = one load-bearing assumption the idea needs to be true.
- Order parents before children (decision tree).
- Emit the FIRST card as soon as you have one — do not wait for the full tree.
- Soft cap ~12 base assumption cards (research briefs later don't count the same way).
- Every card MUST include: id, category, assumption, recommendedStance (keep|kill|research), rationale, kind=assumption|fork, grounded=${grounded}.
- Optionally include researchSuggestions (exactly 3 short strings) for cards where research would help.
- When the base tree is covered, call emit_cards with done=true (can be an empty final call with done only if needed — prefer including last cards + done).

## MCP
${input.mcpNote}
sessionId MUST be: ${input.sessionId}

## Tone
Sharp, specific, slightly roasting. No generic PM fluff.`;
}

export function buildResearchPrompt(input: {
  sessionId: string;
  pitch: string;
  cardAssumption: string;
  query: string;
  suggestions: string[];
  priorDecisions: { id: string; assumption: string; decision: string }[];
}): string {
  return `You are CHAR's research intern for a founder grilling session.

## Pitch
${input.pitch}

## Card being researched
${input.cardAssumption}

## Research focus
${input.query}

## Suggested angles
${input.suggestions.map((s, i) => `${i + 1}. ${s}`).join("\n")}

## Prior decisions (may be invalidated)
${input.priorDecisions.map((d) => `- [${d.decision}] ${d.id}: ${d.assumption}`).join("\n")}

## Task
1. Do real web/docs research on the focus.
2. Call MCP tool emit_research with sessionId=${input.sessionId}, a research_brief card (kind=research_brief, color=research) including findings, sources, affectsCardIds.
3. Set requeueCardIds to prior decision card ids that should be re-swiped because evidence challenges them.

Be concrete. Cite sources as URLs when possible.`;
}

export function buildApplyPrompt(input: {
  sessionId: string;
  charMd: string;
  agentsMd: string;
  adrs: { path: string; content: string }[];
}): string {
  const adrBlock = input.adrs
    .map((a) => `### File: ${a.path}\n\`\`\`md\n${a.content}\n\`\`\``)
    .join("\n\n");

  return `Apply CHAR session ${input.sessionId} into this repository.

## Write these files (create directories as needed)

### File: CHAR.md
\`\`\`md
${input.charMd}
\`\`\`

### File: AGENTS.md
If AGENTS.md already exists, MERGE by appending a clearly marked "## CHAR constraints" section. If missing, create with:

\`\`\`md
${input.agentsMd}
\`\`\`

${adrBlock || "### No ADRs qualified this session."}

## Rules
- Do not refactor unrelated code.
- Open/update the PR with a clear title: "CHAR: apply grilled decisions".
- Summarize what you wrote when done.`;
}

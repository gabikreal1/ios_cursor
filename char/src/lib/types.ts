import { z } from "zod";

export const AssumptionCardSchema = z.object({
  id: z.string(),
  parentId: z.string().nullable().optional(),
  category: z.string().default("General"),
  assumption: z.string(),
  recommendedStance: z.enum(["keep", "kill", "research"]),
  rationale: z.string(),
  kind: z.enum(["assumption", "fork", "research_brief"]).default("assumption"),
  grounded: z.enum(["pitch-only", "repo-grounded"]).default("pitch-only"),
  researchSuggestions: z.array(z.string()).max(3).optional(),
  // research brief fields
  findings: z.string().optional(),
  sources: z.array(z.string()).optional(),
  affectsCardIds: z.array(z.string()).optional(),
  color: z.enum(["default", "research"]).optional(),
});

export type AssumptionCard = z.infer<typeof AssumptionCardSchema>;

export const EmitCardsSchema = z.object({
  sessionId: z.string(),
  cards: z.array(AssumptionCardSchema).min(1),
  done: z.boolean().optional().default(false),
});

export const EmitResearchSchema = z.object({
  sessionId: z.string(),
  brief: AssumptionCardSchema.extend({
    kind: z.literal("research_brief"),
    color: z.literal("research").default("research"),
  }),
  requeueCardIds: z.array(z.string()).default([]),
});

export type Decision = "keep" | "kill" | "research" | "skipped";

export type SessionStatus =
  | "extracting"
  | "swiping"
  | "researching"
  | "ready_to_apply"
  | "applying"
  | "done";

export type CharSession = {
  id: string;
  userId: string;
  pitch: string;
  repoUrl?: string;
  status: SessionStatus;
  cards: AssumptionCard[];
  queue: string[];
  decisions: Record<string, Decision>;
  grillDone: boolean;
  agentId?: string;
  applyAgentId?: string;
  prUrl?: string;
  applyError?: string;
  heatMessages: string[];
  createdAt: string;
  updatedAt: string;
};

export function isApplyReady(session: CharSession): boolean {
  return (
    session.queue.length === 0 &&
    (session.grillDone || Object.keys(session.decisions).length > 0)
  );
}

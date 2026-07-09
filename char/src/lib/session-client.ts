import type { AssumptionCard, CharSession } from "@/lib/types";

export function currentCard(session: CharSession): AssumptionCard | undefined {
  const id = session.queue[0];
  return session.cards.find((c) => c.id === id);
}

import { randomUUID } from "crypto";
import type { AssumptionCard, CharSession, Decision } from "./types";
import { isApplyReady } from "./types";

const g = globalThis as unknown as {
  __charSessions?: Map<string, CharSession>;
};

function store() {
  if (!g.__charSessions) g.__charSessions = new Map();
  return g.__charSessions;
}

export function createSession(input: {
  userId: string;
  pitch: string;
  repoUrl?: string;
}): CharSession {
  const now = new Date().toISOString();
  const session: CharSession = {
    id: randomUUID(),
    userId: input.userId,
    pitch: input.pitch,
    repoUrl: input.repoUrl || undefined,
    status: "extracting",
    cards: [],
    queue: [],
    decisions: {},
    grillDone: false,
    heatMessages: ["Striking a match…", "Reading the soft spots…"],
    createdAt: now,
    updatedAt: now,
  };
  store().set(session.id, session);
  return session;
}

export function getSession(id: string): CharSession | undefined {
  return store().get(id);
}

export function saveSession(session: CharSession) {
  session.updatedAt = new Date().toISOString();
  if (isApplyReady(session) && session.status === "swiping") {
    session.status = "ready_to_apply";
  }
  store().set(session.id, session);
  return session;
}

export function appendCards(sessionId: string, cards: AssumptionCard[], done?: boolean) {
  const session = getSession(sessionId);
  if (!session) throw new Error("Session not found");

  const existing = new Set(session.cards.map((c) => c.id));
  for (const card of cards) {
    if (existing.has(card.id)) {
      session.cards = session.cards.map((c) => (c.id === card.id ? card : c));
    } else {
      session.cards.push(card);
      session.queue.push(card.id);
    }
  }
  if (done) session.grillDone = true;
  if (session.status === "extracting") session.status = "swiping";
  return saveSession(session);
}

export function decide(
  sessionId: string,
  cardId: string,
  decision: Decision,
): CharSession {
  const session = getSession(sessionId);
  if (!session) throw new Error("Session not found");
  session.decisions[cardId] = decision;
  session.queue = session.queue.filter((id) => id !== cardId);
  return saveSession(session);
}

export function requeueFront(sessionId: string, cardIds: string[]) {
  const session = getSession(sessionId);
  if (!session) throw new Error("Session not found");
  const unique = cardIds.filter((id) => session.cards.some((c) => c.id === id));
  // clear prior decisions for remakes
  for (const id of unique) {
    delete session.decisions[id];
  }
  session.queue = [...unique, ...session.queue.filter((id) => !unique.includes(id))];
  session.status = "swiping";
  session.grillDone = false;
  return saveSession(session);
}

export function forceStop(sessionId: string) {
  const session = getSession(sessionId);
  if (!session) throw new Error("Session not found");
  for (const id of session.queue) {
    if (!session.decisions[id]) session.decisions[id] = "skipped";
  }
  session.queue = [];
  session.grillDone = true;
  session.status = "ready_to_apply";
  return saveSession(session);
}

export function currentCard(session: CharSession): AssumptionCard | undefined {
  const id = session.queue[0];
  return session.cards.find((c) => c.id === id);
}

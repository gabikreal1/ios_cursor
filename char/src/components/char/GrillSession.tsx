"use client";

import { useEffect, useMemo, useState } from "react";
import BlurText from "@/components/BlurText";
import FadeContent from "@/components/FadeContent";
import { SwipeCard } from "@/components/char/SwipeCard";
import type { AssumptionCard, CharSession } from "@/lib/types";
import { currentCard as pickCurrent } from "@/lib/session-client";
import { Button } from "@/components/ui/button";

type Props = {
  sessionId: string;
  initial: CharSession;
};

export function GrillSession({ sessionId, initial }: Props) {
  const [session, setSession] = useState(initial);
  const [researchOpen, setResearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const current = useMemo(() => pickCurrent(session), [session]);

  useEffect(() => {
    sessionStorage.setItem(`char:${sessionId}`, JSON.stringify(session));
  }, [session, sessionId]);

  async function swipe(action: "keep" | "kill" | "research" | "enough", extra?: { query?: string }) {
    setBusy(true);
    setError(null);
    try {
      const now = new Date().toISOString();
      setSession((previous) => {
        const next: CharSession = {
          ...previous,
          cards: [...previous.cards],
          queue: [...previous.queue],
          decisions: { ...previous.decisions },
          updatedAt: now,
        };

        if (action === "enough") {
          for (const id of next.queue) next.decisions[id] = "skipped";
          next.queue = [];
          next.grillDone = true;
          next.status = "ready_to_apply";
          return next;
        }

        if (!current) return next;
        next.decisions[current.id] = action;
        next.queue = next.queue.filter((id) => id !== current.id);

        if (action === "research") {
          const brief: AssumptionCard = {
            id: crypto.randomUUID(),
            parentId: current.id,
            category: "Research brief",
            assumption: `Evidence check: ${extra?.query || current.assumption}`,
            recommendedStance: "research",
            rationale:
              "Hack-mode brief: validate this with five target users before treating it as true.",
            findings:
              "The riskiest signal is whether users already spend time or money on a workaround. Ask for evidence, not opinions.",
            kind: "research_brief",
            grounded: current.grounded,
            color: "research",
            affectsCardIds: [current.id],
            researchSuggestions: current.researchSuggestions,
          };
          next.cards.push(brief);
          next.queue.unshift(brief.id);
        }

        if (next.queue.length === 0) {
          next.grillDone = true;
          next.status = "ready_to_apply";
        } else {
          next.status = "swiping";
        }
        return next;
      });
      setResearchOpen(false);
      setQuery("");
    } catch (e) {
      setError(String(e));
    } finally {
      setBusy(false);
    }
  }

  async function apply() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/sessions/${sessionId}/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Apply failed");
      setSession(data.session);
    } catch (e) {
      setError(String(e));
    } finally {
      setBusy(false);
    }
  }

  if (session.status === "extracting" && session.cards.length === 0) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-6 px-6 text-center">
        <BlurText
          text={session.heatMessages[session.heatMessages.length - 1] || "Heating…"}
          className="font-[family-name:var(--font-display)] text-3xl text-white"
          animateBy="words"
        />
        <p className="max-w-sm text-sm text-white/45">
          Cloud grill is reading your pitch
          {session.repoUrl ? " + repo" : ""}. First cards stream in as soft spots appear.
        </p>
      </div>
    );
  }

  if (session.status === "applying") {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 px-6 text-center">
        <BlurText
          text="Applying rails to your repo…"
          className="font-[family-name:var(--font-display)] text-3xl text-white"
        />
        <p className="text-sm text-white/45">Writing CHAR.md, ADRs, AGENTS.md — waiting for PR…</p>
      </div>
    );
  }

  if (session.status === "done" || (session.status === "ready_to_apply" && session.prUrl)) {
    return (
      <FadeContent className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center gap-6 px-6">
        <h1 className="font-[family-name:var(--font-display)] text-4xl text-white">Matched.</h1>
        <p className="text-white/60">Decisions landed in the repo.</p>
        {session.prUrl && (
          <a
            href={session.prUrl}
            target="_blank"
            rel="noreferrer"
            className="rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-center text-sm text-cyan-300"
          >
            Open pull request →
          </a>
        )}
        {session.applyError && (
          <p className="text-sm text-rose-300">{session.applyError}</p>
        )}
      </FadeContent>
    );
  }

  if (session.status === "ready_to_apply" && !current) {
    return (
      <FadeContent className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center gap-6 px-6">
        <h1 className="font-[family-name:var(--font-display)] text-4xl text-white">
          Match Sheet ready
        </h1>
        <p className="text-sm text-white/55">
          Queue clear. Apply writes CHAR.md + ADRs + AGENTS.md and opens a PR.
        </p>
        {!session.repoUrl && (
          <p className="text-sm text-amber-300/90">
            Add a repo URL on a new session to Apply. This run was pitch-only.
          </p>
        )}
        <Button
          disabled={busy || !session.repoUrl}
          onClick={apply}
          className="h-12 rounded-full bg-white text-black hover:bg-white/90"
        >
          Apply to repo
        </Button>
        <Button
          variant="ghost"
          className="text-white/50"
          onClick={() => swipe("enough")}
        >
          Re-check skipped
        </Button>
        {error && <p className="text-sm text-rose-300">{error}</p>}
      </FadeContent>
    );
  }

  return (
    <div className="mx-auto flex min-h-[100dvh] max-w-md flex-col px-4 pb-8 pt-6">
      <header className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-[0.2em] text-white/40">CHAR</p>
          <p className="text-sm text-white/60">
            {session.queue.length} left
            {session.grillDone ? "" : " · grilling…"}
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="text-white/50"
          disabled={busy}
          onClick={() => swipe("enough")}
        >
          That&apos;s enough
        </Button>
      </header>

      <div className="relative mx-auto aspect-[3/4] w-full max-w-[380px] flex-1">
        {current ? (
          <SwipeCard
            key={current.id}
            card={current}
            disabled={busy || researchOpen}
            onKeep={() => swipe("keep")}
            onKill={() => swipe("kill")}
            onResearch={() => {
              setQuery(current.researchSuggestions?.[0] || current.assumption);
              setResearchOpen(true);
            }}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-white/40">
            Waiting for cards…
          </div>
        )}
      </div>

      <div className="mt-6 grid grid-cols-3 gap-2">
        <Button
          disabled={busy || !current}
          onClick={() => swipe("kill")}
          className="h-12 rounded-2xl bg-rose-500/20 text-rose-200 hover:bg-rose-500/30"
        >
          Kill
        </Button>
        <Button
          disabled={busy || !current}
          onClick={() => {
            if (!current) return;
            setQuery(current.researchSuggestions?.[0] || "");
            setResearchOpen(true);
          }}
          className="h-12 rounded-2xl bg-cyan-500/20 text-cyan-100 hover:bg-cyan-500/30"
        >
          Research
        </Button>
        <Button
          disabled={busy || !current}
          onClick={() => swipe("keep")}
          className="h-12 rounded-2xl bg-emerald-500/20 text-emerald-100 hover:bg-emerald-500/30"
        >
          Keep
        </Button>
      </div>

      {error && <p className="mt-3 text-center text-sm text-rose-300">{error}</p>}

      {researchOpen && current && (
        <div className="fixed inset-0 z-50 flex items-end bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full rounded-[28px] border border-white/10 bg-zinc-950 p-5">
            <h3 className="font-[family-name:var(--font-display)] text-xl text-white">
              Research
            </h3>
            <p className="mt-1 text-sm text-white/50">{current.assumption}</p>
            <div className="mt-4 flex flex-col gap-2">
              {(current.researchSuggestions || ["Market evidence", "Competitor UX", "Technical feasibility"]).map(
                (s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setQuery(s)}
                    className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-left text-sm text-white/80"
                  >
                    {s}
                  </button>
                ),
              )}
            </div>
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Where / what about to research…"
              className="mt-3 min-h-[88px] w-full rounded-2xl border border-white/10 bg-black/40 p-3 text-sm text-white outline-none focus:border-cyan-400/40"
            />
            <div className="mt-4 flex gap-2">
              <Button
                variant="ghost"
                className="flex-1 text-white/50"
                onClick={() => setResearchOpen(false)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 rounded-full bg-cyan-400 text-black hover:bg-cyan-300"
                disabled={busy || !query.trim()}
                onClick={() => swipe("research", { query })}
              >
                Dispatch intern
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// re-export helper used above — avoid importing server store in client
export function SessionCardView(_card: AssumptionCard) {
  return null;
}

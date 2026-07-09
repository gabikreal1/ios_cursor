"use client";

import { motion, useMotionValue, useTransform, type PanInfo } from "motion/react";
import { useState } from "react";
import type { AssumptionCard } from "@/lib/types";
import { cn } from "@/lib/utils";

type Props = {
  card: AssumptionCard;
  onKeep: () => void;
  onKill: () => void;
  onResearch: () => void;
  disabled?: boolean;
};

export function SwipeCard({
  card,
  onKeep,
  onKill,
  onResearch,
  disabled,
}: Props) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-12, 12]);
  const keepOpacity = useTransform(x, [40, 140], [0, 1]);
  const killOpacity = useTransform(x, [-140, -40], [1, 0]);
  const researchOpacity = useTransform(y, [-140, -40], [1, 0]);
  const [exit, setExit] = useState<"keep" | "kill" | "research" | null>(null);

  const isResearch = card.kind === "research_brief" || card.color === "research";

  function handleDragEnd(_: unknown, info: PanInfo) {
    if (disabled) return;
    const { offset, velocity } = info;
    if (offset.y < -100 || velocity.y < -600) {
      setExit("research");
      onResearch();
      return;
    }
    if (offset.x > 120 || velocity.x > 600) {
      setExit("keep");
      onKeep();
      return;
    }
    if (offset.x < -120 || velocity.x < -600) {
      setExit("kill");
      onKill();
      return;
    }
    x.set(0);
    y.set(0);
  }

  return (
    <motion.div
      className="absolute inset-0 touch-none"
      style={{ x, y, rotate }}
      drag={disabled ? false : true}
      dragElastic={0.85}
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      onDragEnd={handleDragEnd}
      animate={
        exit === "keep"
          ? { x: 480, opacity: 0 }
          : exit === "kill"
            ? { x: -480, opacity: 0 }
            : exit === "research"
              ? { y: -480, opacity: 0 }
              : { x: 0, y: 0, opacity: 1 }
      }
      transition={{ type: "spring", stiffness: 320, damping: 28 }}
    >
      <div
        className={cn(
          "relative flex h-full w-full flex-col justify-between overflow-hidden rounded-[28px] border p-6 shadow-2xl",
          isResearch
            ? "border-cyan-400/30 bg-gradient-to-br from-cyan-950/90 via-slate-950 to-black"
            : "border-white/10 bg-gradient-to-br from-zinc-900 via-zinc-950 to-black",
        )}
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.08),transparent_55%)]" />

        <motion.div
          style={{ opacity: keepOpacity }}
          className="pointer-events-none absolute right-5 top-5 rounded-full border border-emerald-400/50 bg-emerald-500/20 px-3 py-1 text-xs font-semibold tracking-wide text-emerald-300"
        >
          KEEP
        </motion.div>
        <motion.div
          style={{ opacity: killOpacity }}
          className="pointer-events-none absolute left-5 top-5 rounded-full border border-rose-400/50 bg-rose-500/20 px-3 py-1 text-xs font-semibold tracking-wide text-rose-300"
        >
          KILL
        </motion.div>
        <motion.div
          style={{ opacity: researchOpacity }}
          className="pointer-events-none absolute left-1/2 top-5 -translate-x-1/2 rounded-full border border-cyan-400/50 bg-cyan-500/20 px-3 py-1 text-xs font-semibold tracking-wide text-cyan-300"
        >
          RESEARCH
        </motion.div>

        <div className="relative z-10 space-y-3">
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-white/45">
            <span>{card.category}</span>
            <span className="text-white/20">·</span>
            <span>{card.grounded}</span>
            {card.kind === "fork" && (
              <>
                <span className="text-white/20">·</span>
                <span className="text-amber-300/80">fork</span>
              </>
            )}
          </div>
          <h2 className="font-[family-name:var(--font-display)] text-[1.65rem] leading-tight text-white">
            {card.assumption}
          </h2>
        </div>

        <div className="relative z-10 space-y-4">
          {isResearch ? (
            <p className="text-sm leading-relaxed text-cyan-50/85">
              {card.findings || card.rationale}
            </p>
          ) : (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
              <p className="text-[11px] uppercase tracking-[0.16em] text-white/40">
                Recommended · {card.recommendedStance}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-white/75">
                {card.rationale}
              </p>
            </div>
          )}
          <p className="text-center text-[11px] text-white/35">
            ← kill · keep → · ↑ research
          </p>
        </div>
      </div>
    </motion.div>
  );
}

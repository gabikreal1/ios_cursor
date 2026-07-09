"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import BlurText from "@/components/BlurText";
import FadeContent from "@/components/FadeContent";
import { Button } from "@/components/ui/button";
import { AuthChrome } from "@/components/char/AuthChrome";

export default function HomePage() {
  const router = useRouter();
  const [pitch, setPitch] = useState("");
  const [repoUrl, setRepoUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bypass = process.env.NEXT_PUBLIC_CHAR_DEV_BYPASS === "1";

  async function heat() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pitch, repoUrl }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to start");
      router.push(`/s/${data.session.id}`);
    } catch (e) {
      setError(String(e));
      setBusy(false);
    }
  }

  return (
    <main className="relative mx-auto flex min-h-[100dvh] max-w-lg flex-col px-5 pb-10 pt-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(34,211,238,0.12),transparent_50%),radial-gradient(ellipse_at_bottom,rgba(255,255,255,0.06),transparent_45%)]" />

      <header className="relative z-10 mb-10 flex items-center justify-between">
        <p className="text-[11px] uppercase tracking-[0.28em] text-white/40">
          CHAR
        </p>
        <AuthChrome />
      </header>

      <FadeContent className="relative z-10 flex flex-1 flex-col">
        <BlurText
          text="Swipe your soft spots."
          className="font-[family-name:var(--font-display)] text-4xl leading-tight text-white sm:text-5xl"
          animateBy="words"
        />
        <p className="mt-4 max-w-sm text-base text-white/55">
          Grill-me as cards. Keep, kill, or research — then Apply decisions into
          your repo as CHAR.md + ADRs.
        </p>

        <div className="mt-10 space-y-4">
          <textarea
            value={pitch}
            onChange={(e) => setPitch(e.target.value)}
            placeholder="Throw something on the grill — your half-baked idea…"
            className="min-h-[140px] w-full rounded-[24px] border border-white/10 bg-white/5 p-4 text-base text-white outline-none backdrop-blur placeholder:text-white/30 focus:border-cyan-400/40"
          />
          <input
            value={repoUrl}
            onChange={(e) => setRepoUrl(e.target.value)}
            placeholder="GitHub repo URL (optional)"
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-white/30 focus:border-cyan-400/40"
          />
        </div>

        <div className="mt-auto pt-8">
          <Button
            disabled={busy || pitch.trim().length < 8}
            onClick={heat}
            className="h-14 w-full rounded-full bg-white text-base font-medium text-black hover:bg-white/90 disabled:opacity-40"
          >
            {busy ? "Striking match…" : bypass ? "Heat it (dev)" : "Heat it"}
          </Button>
          {error && (
            <p className="mt-3 text-center text-sm text-rose-300">{error}</p>
          )}
        </div>
      </FadeContent>
    </main>
  );
}

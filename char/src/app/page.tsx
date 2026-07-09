"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth, SignInButton } from "@clerk/nextjs";
import BlurText from "@/components/BlurText";
import { Button } from "@/components/ui/button";
import { AuthChrome } from "@/components/char/AuthChrome";

const MIN_PITCH = 8;
const clerkEnabled = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);
const bypass = process.env.NEXT_PUBLIC_CHAR_DEV_BYPASS === "1";

type HeatProps = {
  pitch: string;
  repoUrl: string;
  pitchReady: boolean;
};

function HeatControls({ pitch, repoUrl, pitchReady }: HeatProps) {
  if (clerkEnabled && !bypass) {
    return (
      <ClerkHeatControls
        pitch={pitch}
        repoUrl={repoUrl}
        pitchReady={pitchReady}
      />
    );
  }
  return (
    <GuestHeatControls
      pitch={pitch}
      repoUrl={repoUrl}
      pitchReady={pitchReady}
      label={bypass ? "Heat it (dev)" : "Heat it"}
    />
  );
}

function GuestHeatControls({
  pitch,
  repoUrl,
  pitchReady,
  label,
}: HeatProps & { label: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function heat() {
    if (!pitchReady || busy) return;
    setBusy(true);
    setError(null);
    try {
      const sessionId = await postSession(pitch, repoUrl);
      router.push(`/s/${sessionId}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setBusy(false);
    }
  }

  return (
    <>
      <Button
        disabled={busy || !pitchReady}
        onClick={heat}
        className="h-14 w-full rounded-full bg-white text-base font-medium text-black hover:bg-white/90 disabled:opacity-40"
      >
        {busy ? "Striking match…" : label}
      </Button>
      {error && (
        <p className="mt-3 text-center text-sm text-rose-300">{error}</p>
      )}
    </>
  );
}

function ClerkHeatControls({ pitch, repoUrl, pitchReady }: HeatProps) {
  const router = useRouter();
  const { isLoaded, isSignedIn } = useAuth();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function heat() {
    if (!pitchReady || busy || !isSignedIn) return;
    setBusy(true);
    setError(null);
    try {
      const sessionId = await postSession(pitch, repoUrl);
      router.push(`/s/${sessionId}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setBusy(false);
    }
  }

  if (!isLoaded) {
    return (
      <Button
        disabled
        className="h-14 w-full rounded-full bg-white text-base font-medium text-black disabled:opacity-40"
      >
        Lighting…
      </Button>
    );
  }

  if (!isSignedIn) {
    return (
      <SignInButton mode="modal">
        <Button className="h-14 w-full rounded-full bg-white text-base font-medium text-black hover:bg-white/90">
          Sign in to heat it
        </Button>
      </SignInButton>
    );
  }

  return (
    <>
      <Button
        disabled={busy || !pitchReady}
        onClick={heat}
        className="h-14 w-full rounded-full bg-white text-base font-medium text-black hover:bg-white/90 disabled:opacity-40"
      >
        {busy ? "Striking match…" : "Heat it"}
      </Button>
      {error && (
        <p className="mt-3 text-center text-sm text-rose-300">{error}</p>
      )}
    </>
  );
}

async function postSession(pitch: string, repoUrl: string): Promise<string> {
  const res = await fetch("/api/sessions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ pitch, repoUrl }),
  });
  const text = await res.text();
  let data: { error?: string; session?: { id: string } } = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    throw new Error(
      res.status === 401
        ? "Sign in to heat it"
        : `Server error (${res.status})`,
    );
  }
  if (!res.ok) throw new Error(data.error || "Failed to start");
  if (!data.session?.id) throw new Error("No session returned");
  return data.session.id;
}

export default function HomePage() {
  const [pitch, setPitch] = useState("");
  const [repoUrl, setRepoUrl] = useState("");
  const pitchReady = pitch.trim().length >= MIN_PITCH;

  return (
    <main className="relative mx-auto flex min-h-[100dvh] max-w-lg flex-col px-5 pb-10 pt-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(34,211,238,0.12),transparent_50%),radial-gradient(ellipse_at_bottom,rgba(255,255,255,0.06),transparent_45%)]" />

      <header className="relative z-10 mb-10 flex items-center justify-between">
        <p className="text-[11px] uppercase tracking-[0.28em] text-white/40">
          CHAR
        </p>
        <AuthChrome />
      </header>

      <div className="relative z-10 flex flex-1 flex-col">
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
          {!pitchReady && pitch.trim().length > 0 && (
            <p className="text-xs text-white/35">
              {MIN_PITCH - pitch.trim().length} more characters to strike a
              match…
            </p>
          )}
        </div>

        <div className="mt-auto pt-8">
          <HeatControls
            pitch={pitch}
            repoUrl={repoUrl}
            pitchReady={pitchReady}
          />
        </div>
      </div>
    </main>
  );
}

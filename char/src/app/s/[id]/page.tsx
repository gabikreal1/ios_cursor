"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { GrillSession } from "@/components/char/GrillSession";
import type { CharSession } from "@/lib/types";

export default function SessionPage() {
  const params = useParams<{ id: string }>();
  const [session, setSession] = useState<CharSession | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const res = await fetch(`/api/sessions/${params.id}`);
      const data = await res.json();
      if (cancelled) return;
      if (!res.ok) {
        setError(data.error || "Not found");
        return;
      }
      setSession(data.session);
    })();
    return () => {
      cancelled = true;
    };
  }, [params.id]);

  if (error) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center text-rose-300">
        {error}
      </div>
    );
  }
  if (!session) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center text-white/40">
        Loading…
      </div>
    );
  }

  return <GrillSession sessionId={session.id} initial={session} />;
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { OpsShell } from "@/components/ops/ops-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Msg = { role: "user" | "bot"; text: string; links?: { href: string; label: string }[] };

const QUICK = ["¿Cómo hago check-out?", "Wi‑Fi", "Liquidación contrata", "Tarifas", "Agua caliente"];

export default function ConciergePage() {
  const [input, setInput] = useState("");
  const [msgs, setMsgs] = useState<Msg[]>([
    {
      role: "bot",
      text: "Conserje Shadai 24/7 para personal minero y contratistas Las Bambas. Pregunte por Wi‑Fi, check-in/out, tarifas o liquidación.",
    },
  ]);
  const [busy, setBusy] = useState(false);

  async function send(messageRaw?: string) {
    const message = (messageRaw ?? input).trim();
    if (!message) return;
    setInput("");
    setMsgs((m) => [...m, { role: "user", text: message }]);
    setBusy(true);
    const res = await fetch("/api/concierge", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ message }),
    });
    const data = (await res.json()) as {
      answer?: string;
      error?: string;
      links?: { href: string; label: string }[];
    };
    setBusy(false);
    setMsgs((m) => [
      ...m,
      { role: "bot", text: data.answer || data.error || "Sin respuesta", links: data.links },
    ]);
  }

  return (
    <OpsShell title="Conserje virtual IA" subtitle="Soporte automatizado 24/7 con respuestas rápidas para faena y estadía.">
      <div className="overflow-hidden border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-soft)]">
        <div className="flex flex-wrap gap-2 border-b border-[var(--border)] p-3">
          {QUICK.map((q) => (
            <button
              key={q}
              type="button"
              disabled={busy}
              onClick={() => void send(q)}
              className="h-9 border border-[var(--border)] px-3 text-xs font-semibold transition hover:border-[var(--ink)] hover:bg-[var(--ink)] hover:text-[var(--paper)]"
            >
              {q}
            </button>
          ))}
        </div>
        <div className="max-h-[52vh] space-y-3 overflow-y-auto bg-[var(--surface-2)] p-4">
          {msgs.map((m, i) => (
            <div
              key={`${m.role}-${i}`}
              className={
                m.role === "user"
                  ? "ml-10 border border-[var(--brass)] bg-[var(--ink)] px-4 py-3 text-sm text-[var(--paper)]"
                  : "mr-10 border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--text)] shadow-sm"
              }
            >
              <p>{m.text}</p>
              {m.links?.length ? (
                <div className="mt-2 flex flex-wrap gap-2">
                  {m.links.map((l) => (
                    <Link key={l.href} href={l.href} className="text-xs font-bold text-[var(--brass)] underline">
                      {l.label}
                    </Link>
                  ))}
                </div>
              ) : null}
            </div>
          ))}
        </div>
        <div className="flex gap-2 border-t border-[var(--border)] p-3">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Escriba su consulta…"
            onKeyDown={(e) => {
              if (e.key === "Enter") void send();
            }}
          />
          <Button type="button" onClick={() => void send()} disabled={busy}>
            Enviar
          </Button>
        </div>
      </div>
    </OpsShell>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { OpsShell } from "@/components/ops/ops-shell";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type Msg = { role: "user" | "bot"; text: string; links?: { href: string; label: string }[] };

export default function ConciergePage() {
  const [input, setInput] = useState("");
  const [msgs, setMsgs] = useState<Msg[]>([
    {
      role: "bot",
      text: "Conserje virtual Shadai 24/7. Pregunte por Wi‑Fi, check-in/out, tarifas, liquidación o mantenimiento.",
    },
  ]);
  const [busy, setBusy] = useState(false);

  async function send() {
    const message = input.trim();
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
      {
        role: "bot",
        text: data.answer || data.error || "Sin respuesta",
        links: data.links,
      },
    ]);
  }

  return (
    <OpsShell title="Conserje virtual IA" subtitle="Asistencia 24/7 para huéspedes, guardias y recepción.">
      <Card>
        <CardBody className="space-y-3">
          <div className="max-h-[50vh] space-y-3 overflow-y-auto rounded-xl bg-[var(--surface-2)] p-3">
            {msgs.map((m, i) => (
              <div
                key={`${m.role}-${i}`}
                className={
                  m.role === "user"
                    ? "ml-8 rounded-2xl bg-[var(--brand)] px-3 py-2 text-sm text-white"
                    : "mr-8 rounded-2xl bg-[var(--surface)] px-3 py-2 text-sm text-[var(--text)] shadow-sm"
                }
              >
                <p>{m.text}</p>
                {m.links?.length ? (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {m.links.map((l) => (
                      <Link key={l.href} href={l.href} className="text-xs font-bold underline">
                        {l.label}
                      </Link>
                    ))}
                  </div>
                ) : null}
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ej. ¿Cómo hago el check-out con DNI?"
              onKeyDown={(e) => {
                if (e.key === "Enter") void send();
              }}
            />
            <Button type="button" onClick={() => void send()} disabled={busy}>
              Enviar
            </Button>
          </div>
        </CardBody>
      </Card>
    </OpsShell>
  );
}

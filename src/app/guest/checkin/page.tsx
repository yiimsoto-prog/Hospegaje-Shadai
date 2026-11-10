"use client";

import { useEffect, useRef, useState } from "react";
import { SiteHeader } from "@/components/layout/site-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const STEPS = ["Identidad", "Habitación", "Firma", "Confirmar"] as const;

export default function GuestCheckinPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const [step, setStep] = useState(0);
  const [docType, setDocType] = useState<"DNI" | "CE">("DNI");
  const [roomNumber, setRoomNumber] = useState("");
  const [workerName, setWorkerName] = useState("");
  const [dni, setDni] = useState("");
  const [contrataName, setContrataName] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [audit, setAudit] = useState<{ checkInId?: string; signed?: boolean } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || step !== 2) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "#1c1915";
    ctx.lineWidth = 2.2;
    ctx.lineCap = "round";

    function pos(e: PointerEvent) {
      const rect = canvas!.getBoundingClientRect();
      return {
        x: ((e.clientX - rect.left) / rect.width) * canvas!.width,
        y: ((e.clientY - rect.top) / rect.height) * canvas!.height,
      };
    }
    function onDown(e: PointerEvent) {
      drawing.current = true;
      const p = pos(e);
      ctx!.beginPath();
      ctx!.moveTo(p.x, p.y);
    }
    function onMove(e: PointerEvent) {
      if (!drawing.current) return;
      const p = pos(e);
      ctx!.lineTo(p.x, p.y);
      ctx!.stroke();
    }
    function onUp() {
      drawing.current = false;
    }
    canvas.addEventListener("pointerdown", onDown);
    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerup", onUp);
    canvas.addEventListener("pointerleave", onUp);
    return () => {
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerup", onUp);
      canvas.removeEventListener("pointerleave", onUp);
    };
  }, [step]);

  function clearSignature() {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  function canNext() {
    if (step === 0) {
      if (workerName.trim().length < 3) return false;
      if (docType === "DNI") return /^\d{8}$/.test(dni);
      return /^[A-Za-z0-9]{9,12}$/.test(dni);
    }
    if (step === 1) return roomNumber.trim().length > 0;
    return true;
  }

  async function submit() {
    setBusy(true);
    setStatus(null);
    const signatureDataUrl = canvasRef.current?.toDataURL("image/png") || "";
    const res = await fetch("/api/guest/checkin", {
      method: "POST",
      headers: { "content-type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({
        roomNumber,
        workerName,
        dni,
        contrataName,
        signatureDataUrl,
        docType,
      }),
    });
    const data = (await res.json()) as {
      message?: string;
      error?: string;
      roomNumber?: string;
      checkInId?: string;
      audit?: { signed?: boolean };
    };
    setBusy(false);
    if (!res.ok) {
      setStatus(data.message || data.error || "No se pudo registrar (¿sesión staff?)");
      return;
    }
    setAudit({ checkInId: data.checkInId, signed: data.audit?.signed });
    setStatus(`Check-in OK · Hab. ${data.roomNumber}`);
    setStep(3);
  }

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-10">
        <header className="mb-8">
          <p className="eyebrow">Huéspedes</p>
          <h1 className="font-display mt-2 text-4xl">Check-in digital</h1>
          <p className="mt-2 text-[var(--text-muted)]">
            Flujo guiado: identidad, habitación, firma y auditoría.
          </p>
        </header>
      <ol className="mb-8 grid grid-cols-2 gap-2 md:grid-cols-4">
        {STEPS.map((label, i) => (
          <li
            key={label}
            className={`border px-3 py-3 text-center text-[0.68rem] font-bold uppercase tracking-[0.16em] ${
              i === step
                ? "border-[var(--ink)] bg-[var(--ink)] text-[var(--paper)]"
                : i < step
                  ? "border-[var(--brass)] text-[var(--text)]"
                  : "border-[var(--border)] text-[var(--text-faint)]"
            }`}
          >
            {i + 1}. {label}
          </li>
        ))}
      </ol>

      <div className="border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-soft)] md:p-8">
        {step === 0 ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm sm:col-span-2">
              Tipo de documento
              <div className="mt-2 flex gap-2">
                {(["DNI", "CE"] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setDocType(t)}
                    className={`h-10 flex-1 border text-xs font-bold uppercase tracking-[0.14em] ${
                      docType === t ? "border-[var(--ink)] bg-[var(--ink)] text-[var(--paper)]" : "border-[var(--border)]"
                    }`}
                  >
                    {t === "DNI" ? "DNI (8 dígitos)" : "Carné extranjería"}
                  </button>
                ))}
              </div>
            </label>
            <label className="text-sm sm:col-span-2">
              Nombre completo del trabajador
              <Input className="mt-1" value={workerName} onChange={(e) => setWorkerName(e.target.value)} />
            </label>
            <label className="text-sm">
              Número de documento
              <Input
                className="mt-1"
                value={dni}
                onChange={(e) => setDni(e.target.value)}
                placeholder={docType === "DNI" ? "71234567" : "001234567"}
              />
            </label>
            <label className="text-sm">
              Contrata / empresa (Las Bambas)
              <Input
                className="mt-1"
                value={contrataName}
                onChange={(e) => setContrataName(e.target.value)}
                placeholder="Ej. Contrata Demo Andina"
              />
            </label>
          </div>
        ) : null}

        {step === 1 ? (
          <div className="grid gap-4">
            <label className="text-sm">
              Número de habitación
              <Input className="mt-1" value={roomNumber} onChange={(e) => setRoomNumber(e.target.value)} placeholder="101" />
            </label>
            <p className="text-sm text-[var(--text-muted)]">
              Debe estar <Badge tone="success">disponible</Badge> en el rack. El sistema asignará al
              trabajador y dejará la habitación en estado ocupada.
            </p>
          </div>
        ) : null}

        {step === 2 ? (
          <div>
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-semibold">Firma digital del trabajador</p>
              <Button type="button" variant="secondary" size="sm" onClick={clearSignature}>
                Limpiar
              </Button>
            </div>
            <canvas
              ref={canvasRef}
              width={720}
              height={220}
              className="h-48 w-full touch-none border border-[var(--border)] bg-white"
              aria-label="Pad de firma"
            />
            <p className="mt-2 text-xs text-[var(--text-faint)]">
              La firma se almacena como evidencia de auditoría junto al check-in (metadatos de personal
              autenticado).
            </p>
          </div>
        ) : null}

        {step === 3 ? (
          <div className="space-y-3 text-sm">
            <Badge tone="success">Registro completado</Badge>
            <p className="font-display text-3xl">{status}</p>
            {audit?.checkInId ? (
              <p className="text-[var(--text-muted)]">
                ID auditoría: <code className="text-xs">{audit.checkInId}</code>
                {audit.signed ? " · Firma capturada" : " · Sin firma"}
              </p>
            ) : null}
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setStep(0);
                setStatus(null);
                setAudit(null);
                setRoomNumber("");
                setWorkerName("");
                setDni("");
                setContrataName("");
              }}
            >
              Nuevo check-in
            </Button>
          </div>
        ) : null}

        {status && step !== 3 ? (
          <p role="alert" className="mt-4 text-sm font-semibold text-[var(--danger)]">
            {status}
          </p>
        ) : null}

        {step < 3 ? (
          <div className="mt-6 flex flex-wrap gap-2">
            <Button type="button" variant="secondary" disabled={step === 0 || busy} onClick={() => setStep((s) => s - 1)}>
              Atrás
            </Button>
            {step < 2 ? (
              <Button type="button" disabled={!canNext() || busy} onClick={() => setStep((s) => s + 1)}>
                Continuar
              </Button>
            ) : (
              <Button type="button" disabled={busy} onClick={() => void submit()}>
                {busy ? "Registrando…" : "Confirmar check-in"}
              </Button>
            )}
          </div>
        ) : null}
      </div>
      </main>
    </div>
  );
}

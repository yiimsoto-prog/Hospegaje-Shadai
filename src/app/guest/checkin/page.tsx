"use client";

import { useEffect, useRef, useState } from "react";
import { OpsShell } from "@/components/ops/ops-shell";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function GuestCheckinPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const [roomNumber, setRoomNumber] = useState("");
  const [workerName, setWorkerName] = useState("");
  const [dni, setDni] = useState("");
  const [contrataName, setContrataName] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "#0f172a";
    ctx.lineWidth = 2;
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
  }, []);

  function clearSignature() {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  async function submit() {
    setBusy(true);
    setStatus(null);
    const signatureDataUrl = canvasRef.current?.toDataURL("image/png") || "";
    const res = await fetch("/api/guest/checkin", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ roomNumber, workerName, dni, contrataName, signatureDataUrl }),
    });
    const data = (await res.json()) as {
      message?: string;
      error?: string;
      roomNumber?: string;
      checkInId?: string;
    };
    setBusy(false);
    if (!res.ok) {
      setStatus(data.message || data.error || "No se pudo registrar (¿sesión staff?)");
      return;
    }
    setStatus(`Check-in OK · ${data.roomNumber} · ticket ${data.checkInId?.slice(0, 8)}`);
    setRoomNumber("");
    setWorkerName("");
    setDni("");
    setContrataName("");
    clearSignature();
  }

  return (
    <OpsShell
      title="Check-in digital"
      subtitle="Validación de identidad (DNI), asignación de habitación y firma digital del trabajador / guardia."
    >
      <Card>
        <CardHeader>
          <h2 className="font-display text-lg font-semibold">Registro de ingreso</h2>
        </CardHeader>
        <CardBody className="grid gap-3 sm:grid-cols-2">
          <label className="text-sm sm:col-span-1">
            Habitación
            <Input className="mt-1" value={roomNumber} onChange={(e) => setRoomNumber(e.target.value)} placeholder="101" />
          </label>
          <label className="text-sm">
            DNI
            <Input className="mt-1" value={dni} onChange={(e) => setDni(e.target.value)} placeholder="71234567" inputMode="numeric" />
          </label>
          <label className="text-sm sm:col-span-2">
            Nombre del trabajador
            <Input className="mt-1" value={workerName} onChange={(e) => setWorkerName(e.target.value)} />
          </label>
          <label className="text-sm sm:col-span-2">
            Contrata (opcional)
            <Input className="mt-1" value={contrataName} onChange={(e) => setContrataName(e.target.value)} />
          </label>
          <div className="sm:col-span-2">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-semibold">Firma digital</p>
              <Button type="button" variant="secondary" size="sm" onClick={clearSignature}>
                Limpiar
              </Button>
            </div>
            <canvas
              ref={canvasRef}
              width={640}
              height={200}
              className="h-40 w-full touch-none rounded-xl border border-[var(--border)] bg-white"
              aria-label="Pad de firma"
            />
          </div>
          <div className="sm:col-span-2 flex flex-wrap gap-2">
            <Button type="button" onClick={() => void submit()} disabled={busy}>
              {busy ? "Registrando…" : "Confirmar check-in"}
            </Button>
            {status ? <p className="text-sm text-[var(--text-muted)]">{status}</p> : null}
          </div>
        </CardBody>
      </Card>
    </OpsShell>
  );
}

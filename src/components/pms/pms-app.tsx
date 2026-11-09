"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  BedDouble,
  ClipboardList,
  Moon,
  Shield,
  Sparkles,
  Sun,
  Wallet,
  Users,
} from "lucide-react";
import { AssignDialog } from "@/components/pms/assign-dialog";
import { AttendancePanel } from "@/components/pms/attendance-panel";
import { B2BPanel } from "@/components/pms/b2b-panel";
import { PettyCashPanel } from "@/components/pms/petty-cash-panel";
import { RoomRack } from "@/components/pms/room-rack";
import { StaffAuthDialog } from "@/components/pms/staff-auth-dialog";
import { StatusPill } from "@/components/pms/status-pill";
import { useTheme } from "@/components/theme-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { useAppStore } from "@/lib/store/app-store";
import { formatMoney } from "@/lib/utils";
import type { StaffRole } from "@/lib/types";

type AdminTab = "rack" | "b2b" | "caja" | "asistencia" | "hk";

export function PmsApp() {
  const {
    state,
    ready,
    me,
    refresh,
    bootstrapAdmin,
    assignGuardia,
    markRoomClean,
    liberarGuardia,
    addPettyCash,
    addAttendance,
    stats,
  } = useAppStore();
  const { theme, toggleTheme } = useTheme();

  const [roleView, setRoleView] = useState<StaffRole>("guest");
  const [authOpen, setAuthOpen] = useState(false);
  const [authTarget, setAuthTarget] = useState<Exclude<StaffRole, "guest">>("admin");
  const [authMessage, setAuthMessage] = useState<string | null>(null);
  const [canBootstrap, setCanBootstrap] = useState(false);
  const [assignRoom, setAssignRoom] = useState<string | null>(null);
  const [adminTab, setAdminTab] = useState<AdminTab>("rack");
  const [toast, setToast] = useState<string | null>(null);

  const canAdmin = me?.role === "admin";
  const canHk = me?.role === "admin" || me?.role === "housekeeping";

  function showToast(msg: string) {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2800);
  }

  async function requestRole(next: StaffRole) {
    if (next === "guest") {
      setRoleView("guest");
      return;
    }
    const res = await fetch("/api/auth/me", { cache: "no-store" });
    if (res.status === 401) {
      setAuthTarget(next);
      setCanBootstrap(false);
      setAuthMessage("Inicia sesión con Cursor (app privada o de equipo) para continuar.");
      setAuthOpen(true);
      return;
    }
    const data = (await res.json()) as {
      role: "admin" | "housekeeping" | null;
      canBootstrap?: boolean;
      teamRole?: string | null;
    };
    setCanBootstrap(Boolean(data.canBootstrap));
    await refresh();
    const effective =
      data.role || (data.teamRole === "admin" && next === "admin" ? "admin" : null);
    if (next === "admin" && (effective === "admin" || data.teamRole === "admin")) {
      setRoleView("admin");
      return;
    }
    if (next === "housekeeping" && (effective === "admin" || effective === "housekeeping")) {
      setRoleView("housekeeping");
      return;
    }
    setAuthTarget(next);
    setAuthMessage(
      data.canBootstrap
        ? "Aún no hay personal. Puedes registrar el primer administrador."
        : "Tu usuario no tiene rol de personal. Pide alta al administrador."
    );
    setAuthOpen(true);
  }

  const pendingHk = useMemo(
    () => state.housekeepingTasks.filter((t) => t.status === "pendiente"),
    [state.housekeepingTasks]
  );

  if (!ready) {
    return (
      <div className="grid min-h-screen place-items-center text-sm text-[var(--text-muted)]">
        Cargando sistema…
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[var(--nav)] text-[var(--nav-text)]">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 font-display text-lg font-semibold">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-[var(--brand)]">
                <BedDouble className="h-4 w-4" />
              </span>
              Hospedaje Shadai
            </Link>
            <Badge tone={state.dataMode === "mock" ? "warning" : "success"}>
              {state.dataMode === "mock" ? "DB local" : "Postgres"}
            </Badge>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {(
              [
                ["guest", "Huésped"],
                ["admin", "Admin"],
                ["housekeeping", "Limpieza"],
              ] as const
            ).map(([id, label]) => (
              <Button
                key={id}
                size="sm"
                variant={roleView === id ? "primary" : "ghost"}
                className={roleView === id ? "" : "text-[var(--nav-muted)] hover:text-white"}
                onClick={() => requestRole(id)}
              >
                {id !== "guest" && !((id === "admin" && canAdmin) || (id === "housekeeping" && canHk)) ? (
                  <Shield className="h-3.5 w-3.5" aria-hidden />
                ) : null}
                {label}
              </Button>
            ))}
            <Button size="sm" variant="ghost" className="text-[var(--nav-muted)]" onClick={toggleTheme} aria-label="Cambiar tema">
              {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6">
        {roleView === "guest" ? (
          <section className="fade-in space-y-6">
            <div className="slide-up rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 md:p-8">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--text-faint)]">Portal huésped</p>
              <h1 className="font-display mt-2 text-3xl font-semibold md:text-4xl">{state.hotel.name}</h1>
              <p className="mt-2 max-w-2xl text-[var(--text-muted)]">
                {state.hotel.tagline}. Wi‑Fi <strong>{state.hotel.wifiNetwork}</strong> —{" "}
                {state.hotel.wifiPasswordHint}.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                <Link
                  href="/checkout"
                  className="inline-flex h-11 items-center justify-center rounded-xl bg-[var(--brand)] px-4 text-sm font-semibold text-white transition hover:bg-[var(--brand-hover)]"
                >
                  Ir a Check-out móvil
                </Link>
                <Button variant="secondary" onClick={() => showToast(state.hotel.address)}>
                  Ver ubicación
                </Button>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <Card>
                <CardBody>
                  <p className="text-xs font-semibold uppercase text-[var(--text-faint)]">Libres</p>
                  <p className="font-display text-3xl font-semibold">{stats.available}</p>
                </CardBody>
              </Card>
              <Card>
                <CardBody>
                  <p className="text-xs font-semibold uppercase text-[var(--text-faint)]">Ocupación</p>
                  <p className="font-display text-3xl font-semibold">{stats.occupancy}%</p>
                </CardBody>
              </Card>
              <Card>
                <CardBody>
                  <p className="text-xs font-semibold uppercase text-[var(--text-faint)]">Check-out</p>
                  <p className="font-display text-3xl font-semibold">{state.hotel.checkoutHour}</p>
                </CardBody>
              </Card>
            </div>
            <div>
              <h2 className="font-display mb-3 text-2xl font-semibold">Habitaciones 101–306</h2>
              <RoomRack
                rooms={state.rooms}
                canManage={false}
                onAssign={() => undefined}
                onLiberar={() => undefined}
                onClean={() => undefined}
              />
            </div>
          </section>
        ) : null}

        {roleView === "admin" ? (
          <section className="fade-in space-y-5">
            <div>
              <h1 className="font-display text-3xl font-semibold">Panel PMS</h1>
              <p className="text-sm text-[var(--text-muted)]">
                Operación autorizada en servidor · {me?.name || "Administración"}
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              {[
                ["Ocupación", `${stats.occupancy}%`],
                ["Libres", String(stats.available)],
                ["Limpieza", String(stats.cleaning)],
                ["Ingresos", formatMoney(stats.revenue)],
                ["Caja chica", formatMoney(stats.pettyBalance)],
              ].map(([label, value]) => (
                <Card key={label}>
                  <CardBody>
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--text-faint)]">{label}</p>
                    <p className="font-display mt-1 text-2xl font-semibold">{value}</p>
                  </CardBody>
                </Card>
              ))}
            </div>
            <div className="flex flex-wrap gap-2" role="tablist" aria-label="Módulos admin">
              {(
                [
                  ["rack", "Pizarra", BedDouble],
                  ["b2b", "Liquidación B2B", ClipboardList],
                  ["caja", "Caja chica", Wallet],
                  ["asistencia", "Asistencia", Users],
                  ["hk", "Limpieza", Sparkles],
                ] as const
              ).map(([id, label, Icon]) => (
                <Button
                  key={id}
                  size="sm"
                  role="tab"
                  aria-selected={adminTab === id}
                  variant={adminTab === id ? "primary" : "secondary"}
                  onClick={() => setAdminTab(id)}
                >
                  <Icon className="h-4 w-4" /> {label}
                </Button>
              ))}
            </div>
            {adminTab === "rack" ? (
              <RoomRack
                rooms={state.rooms}
                canManage
                onAssign={(n) => setAssignRoom(n)}
                onLiberar={async (n) => {
                  await liberarGuardia(n);
                  showToast(`Habitación ${n} liberada`);
                }}
                onClean={async (n) => {
                  await markRoomClean(n);
                  showToast(`Habitación ${n} lista`);
                }}
              />
            ) : null}
            {adminTab === "b2b" ? <B2BPanel pernoctas={state.pernoctas} /> : null}
            {adminTab === "caja" ? (
              <PettyCashPanel
                entries={state.pettyCash}
                balance={stats.pettyBalance}
                staffName={me?.name || "Admin"}
                onAdd={addPettyCash}
              />
            ) : null}
            {adminTab === "asistencia" ? (
              <AttendancePanel records={state.attendance} onAdd={addAttendance} />
            ) : null}
            {adminTab === "hk" ? (
              <div className="space-y-3">
                <p className="text-sm text-[var(--text-muted)]">Pendientes: {pendingHk.length}</p>
                {pendingHk.length === 0 ? (
                  <div className="empty-state">No hay tareas de housekeeping pendientes</div>
                ) : (
                  pendingHk.map((t) => {
                    const room = state.rooms.find((r) => r.number === t.room_number);
                    return (
                      <Card key={t.id}>
                        <CardBody className="flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <p className="font-semibold">Habitación {t.room_number}</p>
                            <p className="text-sm text-[var(--text-muted)]">{t.notes}</p>
                            {room ? <StatusPill status={room.status} /> : null}
                          </div>
                          <Button
                            onClick={async () => {
                              await markRoomClean(t.room_number);
                              showToast(`Hab. ${t.room_number} marcada limpia`);
                            }}
                          >
                            Marcar como lista
                          </Button>
                        </CardBody>
                      </Card>
                    );
                  })
                )}
              </div>
            ) : null}
          </section>
        ) : null}

        {roleView === "housekeeping" ? (
          <section className="fade-in space-y-4">
            <h1 className="font-display text-3xl font-semibold">Housekeeping</h1>
            <div className="grid gap-3 md:grid-cols-2">
              {state.rooms
                .filter((r) => r.status === "limpieza")
                .map((room) => (
                  <Card key={room.id}>
                    <CardBody className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-display text-xl font-semibold">Hab. {room.number}</p>
                        <p className="text-sm text-[var(--text-muted)]">{room.name}</p>
                      </div>
                      <Button
                        variant="gold"
                        onClick={async () => {
                          await markRoomClean(room.number);
                          showToast(`Hab. ${room.number} lista`);
                        }}
                      >
                        Lista
                      </Button>
                    </CardBody>
                  </Card>
                ))}
            </div>
            {state.rooms.every((r) => r.status !== "limpieza") ? (
              <div className="empty-state">Nada pendiente de aseo</div>
            ) : null}
          </section>
        ) : null}
      </main>

      <StaffAuthDialog
        open={authOpen}
        targetRole={authTarget}
        canBootstrap={canBootstrap}
        message={authMessage}
        onClose={() => setAuthOpen(false)}
        onBootstrap={async () => {
          const res = await bootstrapAdmin();
          if (res.ok) {
            setAuthOpen(false);
            setRoleView(authTarget === "admin" ? "admin" : "housekeeping");
            showToast("Administrador registrado");
          } else {
            setAuthMessage(res.error || "No se pudo registrar");
          }
        }}
        onRetry={async () => {
          await refresh();
          setAuthOpen(false);
          await requestRole(authTarget);
        }}
      />

      <AssignDialog
        open={Boolean(assignRoom)}
        roomNumber={assignRoom}
        contratas={state.contratas}
        onClose={() => setAssignRoom(null)}
        onSubmit={async (data) => {
          if (!assignRoom) return { ok: false, error: "Sin habitación" };
          const res = await assignGuardia({ roomNumber: assignRoom, ...data });
          if (res.ok) showToast(`Guardia asignada a Hab. ${assignRoom}`);
          return res;
        }}
      />

      {toast ? (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2 rounded-xl bg-[var(--nav)] px-4 py-2 text-sm font-semibold text-white"
        >
          {toast}
        </div>
      ) : null}
    </div>
  );
}

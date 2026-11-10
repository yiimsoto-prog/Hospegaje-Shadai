"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  BedDouble,
  BookUser,
  ClipboardList,
  Moon,
  Receipt,
  Settings2,
  Shield,
  Sparkles,
  Sun,
  UtensilsCrossed,
  Wallet,
  Users,
} from "lucide-react";
import { AssignDialog } from "@/components/pms/assign-dialog";
import { AttendancePanel } from "@/components/pms/attendance-panel";
import { B2BPanel } from "@/components/pms/b2b-panel";
import { FoliosPanel, GuestBookPanel } from "@/components/pms/folios-panel";
import { GuestPortal } from "@/components/pms/guest-portal";
import { PettyCashPanel } from "@/components/pms/petty-cash-panel";
import { RoomRack } from "@/components/pms/room-rack";
import { SettingsEditor } from "@/components/pms/settings-editor";
import { StaffAuthDialog } from "@/components/pms/staff-auth-dialog";
import { StatusPill } from "@/components/pms/status-pill";
import { useTheme } from "@/components/theme-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { useAppStore } from "@/lib/store/app-store";
import { formatMoney } from "@/lib/utils";
import type { StaffRole } from "@/lib/types";

type AdminTab =
  | "rack"
  | "b2b"
  | "folios"
  | "pedidos"
  | "libro"
  | "caja"
  | "asistencia"
  | "hk"
  | "edit";

export function PmsApp() {
  const {
    state,
    ready,
    me,
    refresh,
    bootstrapAdmin,
    loginStaff,
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
  const [foodEnabled, setFoodEnabled] = useState(false);

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
    const res = await fetch("/api/auth/me", { cache: "no-store", credentials: "same-origin" });
    if (res.status === 401) {
      const data = (await res.json().catch(() => ({}))) as {
        canBootstrap?: boolean;
        message?: string;
      };
      setAuthTarget(next);
      setCanBootstrap(Boolean(data.canBootstrap));
      setAuthMessage(
        data.message ||
          (data.canBootstrap
            ? "Crea el primer administrador con email y contraseña."
            : "Inicia sesión con email y contraseña de personal.")
      );
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
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[var(--navy-deep)] text-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-3">
            <Link href="/" className="font-display text-xl tracking-wide">
              Hospedaje <span className="text-amber-300">Shadai</span>
            </Link>
            <span className="hidden text-xs italic text-slate-300 sm:inline">{state.hotel.tagline}</span>
            <Badge tone={state.dataMode === "mock" ? "warning" : "success"}>
              {state.dataMode === "mock" ? "Modo local" : "Datos vivos"}
            </Badge>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {(
              [
                ["guest", "Portal huésped"],
                ["admin", "Panel PMS (Admin)"],
                ["housekeeping", "Limpieza"],
              ] as const
            ).map(([id, label]) => (
              <Button
                key={id}
                size="sm"
                variant={roleView === id ? "primary" : "ghost"}
                className={
                  roleView === id
                    ? "bg-sky-600 text-white hover:bg-sky-500"
                    : "text-slate-300 hover:bg-white/10 hover:text-white"
                }
                onClick={() => requestRole(id)}
              >
                {id !== "guest" && !((id === "admin" && canAdmin) || (id === "housekeeping" && canHk)) ? (
                  <Shield className="h-3.5 w-3.5" aria-hidden />
                ) : null}
                {label}
              </Button>
            ))}
            <Button
              size="sm"
              className="bg-amber-500 text-slate-900 hover:bg-amber-400"
              onClick={() => showToast("En móvil: menú del navegador → Agregar a inicio")}
            >
              Instalar en celular
            </Button>
            <Button size="sm" variant="ghost" className="text-slate-300" onClick={toggleTheme} aria-label="Cambiar tema">
              {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6">
        {roleView === "guest" ? (
          <GuestPortal
            hotel={state.hotel}
            rooms={state.rooms}
            available={stats.available}
            occupancy={stats.occupancy}
            onToast={showToast}
          />
        ) : null}

        {roleView === "admin" ? (
          <section className="fade-in space-y-5">
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
              {[
                ["Ocupación actual", `${stats.occupancy}%`, "text-sky-700 dark:text-sky-300"],
                ["Habitaciones libres", String(stats.available), "text-emerald-700 dark:text-emerald-300"],
                ["En limpieza / turno", String(stats.cleaning), "text-orange-600 dark:text-orange-300"],
                ["Ingresos registrados", formatMoney(stats.revenue), "text-indigo-700 dark:text-indigo-300"],
                ["Saldos por cobrar", formatMoney(stats.balanceDue), "text-rose-700 dark:text-rose-300"],
              ].map(([label, value, tone]) => (
                <Card key={label}>
                  <CardBody>
                    <p className="text-[11px] font-bold uppercase tracking-wide text-[var(--text-faint)]">{label}</p>
                    <p className={`font-display mt-1 text-3xl font-semibold ${tone}`}>{value}</p>
                  </CardBody>
                </Card>
              ))}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-[var(--navy-deep)] px-4 py-3 text-white">
              <p className="text-sm">
                Portal huésped público · áreas admin con sesión. Personal autenticado:{" "}
                <strong>{me?.name || "Administración"}</strong>
              </p>
              <Button
                size="sm"
                className="bg-amber-500 text-slate-900 hover:bg-amber-400"
                onClick={() => setAdminTab("edit")}
              >
                Editar app
              </Button>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3">
              <div>
                <p className="text-sm font-semibold">Módulo opcional · servicio & alimentos</p>
                <p className="text-xs text-[var(--text-muted)]">
                  {foodEnabled ? "Visible en pedidos" : "Oculto / en preparación"}
                </p>
              </div>
              <Button
                size="sm"
                className={foodEnabled ? "bg-slate-600" : "bg-emerald-600 hover:bg-emerald-500"}
                onClick={() => setFoodEnabled((v) => !v)}
              >
                {foodEnabled ? "Ocultar alimentos" : "Habilitar alimentos"}
              </Button>
            </div>

            <div className="flex flex-wrap gap-2" role="tablist" aria-label="Módulos admin">
              {(
                [
                  ["rack", "Pizarra de habitaciones", BedDouble],
                  ["b2b", "Liquidación B2B (Las Bambas)", ClipboardList],
                  ["folios", "Consumos & folios", Receipt],
                  ["pedidos", "Pedidos y servicios", UtensilsCrossed],
                  ["libro", "Libro de huéspedes", BookUser],
                  ["caja", "Caja chica", Wallet],
                  ["asistencia", "Asistencia", Users],
                  ["hk", "Limpieza", Sparkles],
                  ["edit", "Editar app", Settings2],
                ] as const
              ).map(([id, label, Icon]) => (
                <Button
                  key={id}
                  size="sm"
                  role="tab"
                  aria-selected={adminTab === id}
                  className={
                    adminTab === id
                      ? "bg-[var(--navy)] text-white hover:bg-[var(--brand-hover)]"
                      : ""
                  }
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
            {adminTab === "folios" ? <FoliosPanel rooms={state.rooms} /> : null}
            {adminTab === "libro" ? <GuestBookPanel rooms={state.rooms} /> : null}
            {adminTab === "pedidos" ? (
              <div className="empty-state">
                {foodEnabled
                  ? "Módulo de alimentos habilitado. Conecte inventario/ERP para tomar pedidos."
                  : "Pedidos y servicios ocultos. Pulse «Habilitar alimentos» para activarlos."}
              </div>
            ) : null}
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
            {adminTab === "edit" ? (
              <SettingsEditor
                key={`${state.hotel.email}-${state.hotel.wifiNetwork}-${state.rooms[0]?.photo_url || ""}`}
                hotel={state.hotel}
                rooms={state.rooms}
                onSaved={refresh}
                onToast={showToast}
              />
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
        onBootstrap={async (creds) => {
          const res = await bootstrapAdmin(creds);
          if (res.ok) {
            setAuthOpen(false);
            setRoleView("admin");
            showToast("Administrador registrado");
          } else {
            throw new Error(res.error || "No se pudo registrar");
          }
        }}
        onLogin={async (creds) => {
          const res = await loginStaff(creds);
          if (!res.ok) throw new Error(res.error || "Login fallido");
          setAuthOpen(false);
          setRoleView(authTarget);
          showToast("Sesión iniciada");
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
          className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2 rounded-xl bg-[var(--navy-deep)] px-4 py-2 text-sm font-semibold text-white"
        >
          {toast}
        </div>
      ) : null}
    </div>
  );
}

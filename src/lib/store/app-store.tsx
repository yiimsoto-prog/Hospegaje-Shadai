"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import roomsSeed from "@/lib/data/rooms-seed.json";
import contratasSeed from "@/lib/data/contratas-seed.json";
import { HOTEL } from "@/lib/data/hotel";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import {
  bookingCode,
  nowISO,
  ticketCode,
  todayISO,
} from "@/lib/utils";
import type {
  AppState,
  AttendanceRecord,
  Booking,
  Contrata,
  PettyCashEntry,
  Room,
  StaffRole,
} from "@/lib/types";

const STORAGE_KEY = "shadai_master_v1";
const AUTH_KEY = "shadai_staff_session_v1";

type StaffSession = { role: Exclude<StaffRole, "guest">; name: string };

type StoreApi = {
  state: AppState;
  ready: boolean;
  session: StaffSession | null;
  loginStaff: (pin: string, role: Exclude<StaffRole, "guest">) => Promise<boolean>;
  logoutStaff: () => void;
  assignGuardia: (input: {
    roomNumber: string;
    workerName: string;
    dni: string;
    contrataId?: string;
  }) => Promise<{ ok: boolean; error?: string }>;
  validateCheckout: (roomNumber: string, dni: string) => Promise<{
    ok: boolean;
    error?: string;
    already?: boolean;
    workerName?: string;
    contrataName?: string;
  }>;
  confirmCheckout: (roomNumber: string, dni: string) => Promise<{
    ok: boolean;
    error?: string;
    ticket?: string;
    checkoutAt?: string;
  }>;
  markRoomClean: (roomNumber: string) => Promise<void>;
  setRoomStatus: (roomNumber: string, status: Room["status"]) => Promise<void>;
  addPettyCash: (entry: Omit<PettyCashEntry, "id" | "created_at">) => Promise<void>;
  addAttendance: (entry: Omit<AttendanceRecord, "id" | "recorded_at">) => Promise<void>;
  createBooking: (input: {
    roomNumber: string;
    guestName: string;
    guestDoc: string;
  }) => Promise<{ ok: boolean; error?: string }>;
  liberarGuardia: (roomNumber: string) => Promise<void>;
  resetDemo: () => Promise<void>;
  stats: {
    occupancy: number;
    available: number;
    cleaning: number;
    revenue: number;
    balanceDue: number;
    pettyBalance: number;
  };
};

const StoreContext = createContext<StoreApi | null>(null);

function buildInitialState(): AppState {
  return {
    hotel: HOTEL,
    rooms: roomsSeed as Room[],
    contratas: contratasSeed as Contrata[],
    bookings: [],
    pernoctas: [],
    pettyCash: [
      {
        id: "pc-seed-1",
        type: "ingreso",
        category: "Fondo inicial",
        description: "Apertura de caja chica — muestra",
        amount: 200,
        created_at: nowISO(),
        created_by: "Sistema",
        sede: "Challhuahuacho",
      },
    ],
    attendance: [],
    housekeepingTasks: [],
    roomServiceEnabled: false,
    dataMode: isSupabaseConfigured() ? "supabase" : "mock",
  };
}

function loadState(): AppState {
  if (typeof window === "undefined") return buildInitialState();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return buildInitialState();
    const parsed = JSON.parse(raw) as AppState;
    return {
      ...buildInitialState(),
      ...parsed,
      hotel: HOTEL,
      dataMode: isSupabaseConfigured() ? "supabase" : "mock",
    };
  } catch {
    return buildInitialState();
  }
}

/**
 * Demo PINs only when Supabase is NOT configured.
 * In production with Supabase, staff must sign in via Auth (email magic link / password).
 * These values are intentionally weak and labeled — never show them in the production UI.
 */
const DEMO_PINS: Record<Exclude<StaffRole, "guest">, string[]> = {
  admin: ["demo-admin", "0000"],
  housekeeping: ["demo-hk", "1111"],
};

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(buildInitialState);
  const [session, setSession] = useState<StaffSession | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setState(loadState());
    try {
      const raw = localStorage.getItem(AUTH_KEY);
      if (raw) setSession(JSON.parse(raw) as StaffSession);
    } catch {
      /* ignore */
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state, ready]);

  const persistSession = useCallback((s: StaffSession | null) => {
    setSession(s);
    if (s) localStorage.setItem(AUTH_KEY, JSON.stringify(s));
    else localStorage.removeItem(AUTH_KEY);
  }, []);

  const loginStaff = useCallback(
    async (pin: string, role: Exclude<StaffRole, "guest">) => {
      if (isSupabaseConfigured()) {
        // Production path: PIN login must be replaced by Supabase Auth.
        // Keep false until Edge Function / email auth is wired by the operator.
        return false;
      }
      const ok = DEMO_PINS[role].includes(pin.trim());
      if (!ok) return false;
      persistSession({
        role,
        name: role === "admin" ? "Recepción Demo" : "Limpieza Demo",
      });
      return true;
    },
    [persistSession]
  );

  const logoutStaff = useCallback(() => persistSession(null), [persistSession]);

  const assignGuardia = useCallback(
    async (input: {
      roomNumber: string;
      workerName: string;
      dni: string;
      contrataId?: string;
    }) => {
      const dni = input.dni.trim();
      const name = input.workerName.trim();
      if (!/^\d{8}$/.test(dni)) return { ok: false, error: "DNI debe tener 8 dígitos" };
      if (name.length < 3) return { ok: false, error: "Nombre inválido" };

      setState((prev) => {
        const contrata = prev.contratas.find((c) => c.id === input.contrataId);
        const rooms = prev.rooms.map((r) => {
          if (r.number !== input.roomNumber) return r;
          return {
            ...r,
            status: "ocupada" as const,
            cleaning_state: "limpio" as const,
            assignment: {
              workerName: name,
              dni,
              contrataId: contrata?.id ?? null,
              contrataName: contrata?.razon_social ?? null,
              assignedAt: nowISO(),
              lastCheckoutAt: null,
              checkedOutToday: false,
            },
          };
        });
        return { ...prev, rooms };
      });
      return { ok: true };
    },
    []
  );

  const validateCheckout = useCallback(async (roomNumber: string, dni: string) => {
    const room = state.rooms.find((r) => r.number === roomNumber);
    if (!room) return { ok: false, error: "Habitación no encontrada" };
    if (!room.assignment) return { ok: false, error: "Habitación sin guardia asignada" };
    if (room.assignment.dni !== dni.trim()) {
      return { ok: false, error: "El DNI no corresponde al trabajador de esta habitación" };
    }
    if (room.assignment.checkedOutToday) {
      return {
        ok: false,
        already: true,
        error: "Salida ya registrada hoy",
        workerName: room.assignment.workerName,
      };
    }
    return {
      ok: true,
      workerName: room.assignment.workerName,
      contrataName: room.assignment.contrataName ?? undefined,
    };
  }, [state.rooms]);

  const confirmCheckout = useCallback(
    async (roomNumber: string, dni: string) => {
      const validation = await validateCheckout(roomNumber, dni);
      if (!validation.ok) return validation;

      const ticket = ticketCode();
      const checkoutAt = nowISO();
      setState((prev) => {
        const room = prev.rooms.find((r) => r.number === roomNumber)!;
        const rooms = prev.rooms.map((r) => {
          if (r.number !== roomNumber || !r.assignment) return r;
          return {
            ...r,
            status: "limpieza" as const,
            cleaning_state: "sucio" as const,
            assignment: {
              ...r.assignment,
              checkedOutToday: true,
              lastCheckoutAt: checkoutAt,
            },
          };
        });
        return {
          ...prev,
          rooms,
          housekeepingTasks: [
            {
              id: crypto.randomUUID(),
              room_number: roomNumber,
              status: "pendiente",
              notes: "Check-out móvil — aseo diario",
              created_at: checkoutAt,
            },
            ...prev.housekeepingTasks,
          ],
          pernoctas: [
            {
              id: crypto.randomUUID(),
              ticket,
              room_number: roomNumber,
              dni: dni.trim(),
              worker_name: validation.workerName || room.assignment!.workerName,
              contrata_name: validation.contrataName || room.assignment!.contrataName || "",
              night_date: todayISO(),
              checkout_at: checkoutAt,
              tariff: room.price_per_night,
              validated: true,
            },
            ...prev.pernoctas,
          ],
        };
      });
      return { ok: true, ticket, checkoutAt };
    },
    [validateCheckout]
  );

  const markRoomClean = useCallback(async (roomNumber: string) => {
    setState((prev) => ({
      ...prev,
      rooms: prev.rooms.map((r) =>
        r.number === roomNumber
          ? {
              ...r,
              status: r.assignment ? "ocupada" : "disponible",
              cleaning_state: "limpio",
            }
          : r
      ),
      housekeepingTasks: prev.housekeepingTasks.map((t) =>
        t.room_number === roomNumber && t.status === "pendiente"
          ? { ...t, status: "completa" }
          : t
      ),
    }));
  }, []);

  const setRoomStatus = useCallback(async (roomNumber: string, status: Room["status"]) => {
    setState((prev) => ({
      ...prev,
      rooms: prev.rooms.map((r) => (r.number === roomNumber ? { ...r, status } : r)),
    }));
  }, []);

  const addPettyCash = useCallback(
    async (entry: Omit<PettyCashEntry, "id" | "created_at">) => {
      setState((prev) => ({
        ...prev,
        pettyCash: [
          { ...entry, id: crypto.randomUUID(), created_at: nowISO() },
          ...prev.pettyCash,
        ],
      }));
    },
    []
  );

  const addAttendance = useCallback(
    async (entry: Omit<AttendanceRecord, "id" | "recorded_at">) => {
      setState((prev) => ({
        ...prev,
        attendance: [
          { ...entry, id: crypto.randomUUID(), recorded_at: nowISO() },
          ...prev.attendance,
        ],
      }));
    },
    []
  );

  const createBooking = useCallback(
    async (input: { roomNumber: string; guestName: string; guestDoc: string }) => {
      const room = state.rooms.find((r) => r.number === input.roomNumber);
      if (!room) return { ok: false, error: "Habitación no encontrada" };
      if (room.status !== "disponible") return { ok: false, error: "Habitación no disponible" };
      const booking: Booking = {
        id: crypto.randomUUID(),
        code: bookingCode(),
        room_number: input.roomNumber,
        guest_name: input.guestName.trim(),
        guest_doc: input.guestDoc.trim(),
        check_in: todayISO(),
        check_out: null,
        status: "activa",
        base_price: room.price_per_night,
        charges: [
          {
            id: crypto.randomUUID(),
            description: "Pernocta",
            amount: room.price_per_night,
            created_at: nowISO(),
          },
        ],
        payments: [],
      };
      setState((prev) => ({
        ...prev,
        bookings: [booking, ...prev.bookings],
        rooms: prev.rooms.map((r) =>
          r.number === input.roomNumber
            ? {
                ...r,
                status: "ocupada",
                current_booking_id: booking.id,
                assignment: {
                  workerName: booking.guest_name,
                  dni: booking.guest_doc,
                  contrataId: null,
                  contrataName: null,
                  assignedAt: nowISO(),
                  lastCheckoutAt: null,
                  checkedOutToday: false,
                },
              }
            : r
        ),
      }));
      return { ok: true };
    },
    [state.rooms]
  );

  const liberarGuardia = useCallback(async (roomNumber: string) => {
    setState((prev) => ({
      ...prev,
      rooms: prev.rooms.map((r) =>
        r.number === roomNumber
          ? {
              ...r,
              status: "limpieza",
              cleaning_state: "sucio",
              assignment: null,
              current_booking_id: null,
            }
          : r
      ),
      housekeepingTasks: [
        {
          id: crypto.randomUUID(),
          room_number: roomNumber,
          status: "pendiente",
          notes: "Liberación de guardia — limpieza profunda",
          created_at: nowISO(),
        },
        ...prev.housekeepingTasks,
      ],
    }));
  }, []);

  const resetDemo = useCallback(async () => {
    const next = buildInitialState();
    setState(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }, []);

  const stats = useMemo(() => {
    const total = state.rooms.length || 1;
    const occupied = state.rooms.filter((r) => r.status === "ocupada").length;
    const available = state.rooms.filter((r) => r.status === "disponible").length;
    const cleaning = state.rooms.filter((r) => r.status === "limpieza").length;
    let revenue = 0;
    let balanceDue = 0;
    for (const b of state.bookings) {
      const charges = b.charges.reduce((s, c) => s + c.amount, 0);
      const payments = b.payments.reduce((s, p) => s + p.amount, 0);
      revenue += payments;
      balanceDue += Math.max(0, charges - payments);
    }
    revenue += state.pernoctas.reduce((s, p) => s + p.tariff, 0);
    const pettyBalance = state.pettyCash.reduce(
      (s, e) => s + (e.type === "ingreso" ? e.amount : -e.amount),
      0
    );
    return {
      occupancy: Math.round((occupied / total) * 100),
      available,
      cleaning,
      revenue,
      balanceDue,
      pettyBalance,
    };
  }, [state]);

  const api = useMemo<StoreApi>(
    () => ({
      state,
      ready,
      session,
      loginStaff,
      logoutStaff,
      assignGuardia,
      validateCheckout,
      confirmCheckout,
      markRoomClean,
      setRoomStatus,
      addPettyCash,
      addAttendance,
      createBooking,
      liberarGuardia,
      resetDemo,
      stats,
    }),
    [
      state,
      ready,
      session,
      loginStaff,
      logoutStaff,
      assignGuardia,
      validateCheckout,
      confirmCheckout,
      markRoomClean,
      setRoomStatus,
      addPettyCash,
      addAttendance,
      createBooking,
      liberarGuardia,
      resetDemo,
      stats,
    ]
  );

  return <StoreContext.Provider value={api}>{children}</StoreContext.Provider>;
}

export function useAppStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useAppStore must be used within AppProvider");
  return ctx;
}

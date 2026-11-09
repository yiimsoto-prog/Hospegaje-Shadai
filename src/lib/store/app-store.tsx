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
import { HOTEL } from "@/lib/data/hotel";
import roomsSeed from "@/lib/data/rooms-seed.json";
import contratasSeed from "@/lib/data/contratas-seed.json";
import type {
  AppState,
  AttendanceRecord,
  Contrata,
  PettyCashEntry,
  Room,
  StaffRole,
} from "@/lib/types";

type Me = {
  role: Exclude<StaffRole, "guest"> | null;
  name?: string;
  canBootstrap?: boolean;
};

type StoreApi = {
  state: AppState;
  ready: boolean;
  me: Me | null;
  refresh: () => Promise<void>;
  bootstrapAdmin: () => Promise<{ ok: boolean; error?: string }>;
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
  liberarGuardia: (roomNumber: string) => Promise<void>;
  addPettyCash: (entry: Omit<PettyCashEntry, "id" | "created_at">) => Promise<void>;
  addAttendance: (entry: Omit<AttendanceRecord, "id" | "recorded_at">) => Promise<void>;
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

function guestFallback(): AppState {
  return {
    hotel: HOTEL,
    rooms: roomsSeed as Room[],
    contratas: contratasSeed as Contrata[],
    bookings: [],
    pernoctas: [],
    pettyCash: [],
    attendance: [],
    housekeepingTasks: [],
    roomServiceEnabled: false,
    dataMode: "mock",
  };
}

async function api<T>(url: string, init?: RequestInit): Promise<{ status: number; data: T }> {
  const res = await fetch(url, {
    ...init,
    headers: {
      "content-type": "application/json",
      ...(init?.headers || {}),
    },
    cache: "no-store",
  });
  const data = (await res.json().catch(() => ({}))) as T;
  return { status: res.status, data };
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(guestFallback);
  const [me, setMe] = useState<Me | null>(null);
  const [ready, setReady] = useState(false);

  const refresh = useCallback(async () => {
    const { status, data } = await api<AppState & { me?: Me }>("/api/state");
    if (status >= 400) {
      setState(guestFallback());
      setMe(null);
      return;
    }
    setState({
      hotel: data.hotel,
      rooms: data.rooms,
      contratas: data.contratas,
      bookings: data.bookings ?? [],
      pernoctas: data.pernoctas ?? [],
      pettyCash: data.pettyCash ?? [],
      attendance: data.attendance ?? [],
      housekeepingTasks: data.housekeepingTasks ?? [],
      roomServiceEnabled: false,
      dataMode: data.dataMode === "postgres" ? "postgres" : "mock",
    });
    setMe(data.me ?? null);
  }, []);

  useEffect(() => {
    refresh().finally(() => setReady(true));
  }, [refresh]);

  const bootstrapAdmin = useCallback(async () => {
    const { status, data } = await api<{ error?: string }>("/api/auth/bootstrap", { method: "POST" });
    if (status >= 400) return { ok: false, error: data.error || "No se pudo inicializar admin" };
    await refresh();
    return { ok: true };
  }, [refresh]);

  const assignGuardia = useCallback(
    async (input: { roomNumber: string; workerName: string; dni: string; contrataId?: string }) => {
      const { status, data } = await api<{ error?: string }>("/api/rooms/assign", {
        method: "POST",
        body: JSON.stringify(input),
      });
      if (status >= 400) {
        return {
          ok: false,
          error:
            data.error === "room_not_available"
              ? "Habitación no disponible"
              : data.error === "invalid_input"
                ? "DNI (8 dígitos) y nombre válidos requeridos"
                : "No autorizado o error de servidor",
        };
      }
      await refresh();
      return { ok: true };
    },
    [refresh]
  );

  const validateCheckout = useCallback(async (roomNumber: string, dni: string) => {
    const { data } = await api<{
      ok: boolean;
      error?: string;
      already?: boolean;
      workerName?: string;
      contrataName?: string;
    }>("/api/mobile/validate", {
      method: "POST",
      body: JSON.stringify({ roomNumber, dni }),
    });
    return data;
  }, []);

  const confirmCheckout = useCallback(async (roomNumber: string, dni: string) => {
    const { data } = await api<{
      ok: boolean;
      error?: string;
      ticket?: string;
      checkoutAt?: string;
    }>("/api/mobile/checkout", {
      method: "POST",
      body: JSON.stringify({ roomNumber, dni }),
    });
    if (data.ok) await refresh();
    return data;
  }, [refresh]);

  const markRoomClean = useCallback(
    async (roomNumber: string) => {
      await api("/api/rooms/clean", { method: "POST", body: JSON.stringify({ roomNumber }) });
      await refresh();
    },
    [refresh]
  );

  const liberarGuardia = useCallback(
    async (roomNumber: string) => {
      await api("/api/rooms/liberar", { method: "POST", body: JSON.stringify({ roomNumber }) });
      await refresh();
    },
    [refresh]
  );

  const addPettyCash = useCallback(
    async (entry: Omit<PettyCashEntry, "id" | "created_at">) => {
      await api("/api/petty-cash", {
        method: "POST",
        body: JSON.stringify({
          type: entry.type,
          category: entry.category,
          description: entry.description,
          amount: entry.amount,
        }),
      });
      await refresh();
    },
    [refresh]
  );

  const addAttendance = useCallback(
    async (entry: Omit<AttendanceRecord, "id" | "recorded_at">) => {
      await api("/api/attendance", {
        method: "POST",
        body: JSON.stringify(entry),
      });
      await refresh();
    },
    [refresh]
  );

  const stats = useMemo(() => {
    const total = state.rooms.length || 1;
    const occupied = state.rooms.filter((r) => r.status === "ocupada").length;
    const available = state.rooms.filter((r) => r.status === "disponible").length;
    const cleaning = state.rooms.filter((r) => r.status === "limpieza").length;
    const revenue = state.pernoctas.reduce((s, p) => s + p.tariff, 0);
    const pettyBalance = state.pettyCash.reduce(
      (s, e) => s + (e.type === "ingreso" ? e.amount : -e.amount),
      0
    );
    return {
      occupancy: Math.round((occupied / total) * 100),
      available,
      cleaning,
      revenue,
      balanceDue: 0,
      pettyBalance,
    };
  }, [state]);

  const apiValue = useMemo<StoreApi>(
    () => ({
      state,
      ready,
      me,
      refresh,
      bootstrapAdmin,
      assignGuardia,
      validateCheckout,
      confirmCheckout,
      markRoomClean,
      liberarGuardia,
      addPettyCash,
      addAttendance,
      stats,
    }),
    [
      state,
      ready,
      me,
      refresh,
      bootstrapAdmin,
      assignGuardia,
      validateCheckout,
      confirmCheckout,
      markRoomClean,
      liberarGuardia,
      addPettyCash,
      addAttendance,
      stats,
    ]
  );

  return <StoreContext.Provider value={apiValue}>{children}</StoreContext.Provider>;
}

export function useAppStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useAppStore must be used within AppProvider");
  return ctx;
}

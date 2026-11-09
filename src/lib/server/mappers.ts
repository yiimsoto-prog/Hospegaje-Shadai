import type {
  AttendanceRecord,
  Contrata,
  HotelInfo,
  HousekeepingTask,
  Pernocta,
  PettyCashEntry,
  Room,
  RoomAssignment,
} from "@/lib/types";

export function mapHotel(row: Record<string, unknown>): HotelInfo {
  return {
    name: String(row.name),
    tagline: String(row.tagline),
    city: String(row.city),
    address: String(row.address),
    email: String(row.email),
    phones: (row.phones as HotelInfo["phones"]) ?? [],
    currency: String(row.currency ?? "S/"),
    wifiNetwork: String(row.wifi_network),
    wifiPasswordHint: "Solicitar en recepción (no se publica en el código)",
    checkoutHour: String(row.checkout_hour ?? "11:00"),
  };
}

export function mapRoom(row: Record<string, unknown>): Room {
  return {
    id: String(row.id),
    number: String(row.number),
    name: String(row.name),
    type: row.room_type as Room["type"],
    floor: Number(row.floor),
    capacity: Number(row.capacity),
    bed: String(row.bed ?? ""),
    price_per_night: Number(row.price_per_night),
    status: row.status as Room["status"],
    amenities: (row.amenities as string[]) ?? [],
    cleaning_notes: String(row.cleaning_notes ?? ""),
    housekeeper: null,
    current_booking_id: row.current_booking_id ? String(row.current_booking_id) : null,
    cleaning_state: (row.cleaning_state as Room["cleaning_state"]) ?? "limpio",
    assignment: (row.assignment as RoomAssignment | null) ?? null,
  };
}

export function mapContrata(row: Record<string, unknown>): Contrata {
  return {
    id: String(row.id),
    ruc: String(row.ruc),
    razon_social: String(row.razon_social),
    contacto: String(row.contacto ?? ""),
    telefono: String(row.telefono ?? ""),
  };
}

export function mapPernocta(row: Record<string, unknown>): Pernocta {
  return {
    id: String(row.id),
    ticket: String(row.ticket),
    room_number: String(row.room_number),
    dni: String(row.dni),
    worker_name: String(row.worker_name),
    contrata_name: String(row.contrata_name ?? ""),
    night_date: String(row.night_date).slice(0, 10),
    checkout_at: new Date(String(row.checkout_at)).toISOString(),
    tariff: Number(row.tariff),
    validated: Boolean(row.validated),
  };
}

export function mapPetty(row: Record<string, unknown>): PettyCashEntry {
  return {
    id: String(row.id),
    type: row.entry_type as PettyCashEntry["type"],
    category: String(row.category),
    description: String(row.description),
    amount: Number(row.amount),
    created_at: new Date(String(row.created_at)).toISOString(),
    created_by: String(row.created_by),
    sede: String(row.sede),
  };
}

export function mapAttendance(row: Record<string, unknown>): AttendanceRecord {
  return {
    id: String(row.id),
    staff_name: String(row.staff_name),
    role: String(row.staff_role),
    type: row.mark_type as AttendanceRecord["type"],
    note: String(row.note ?? ""),
    sede: String(row.sede),
    recorded_at: new Date(String(row.recorded_at)).toISOString(),
  };
}

export function mapHk(row: Record<string, unknown>): HousekeepingTask {
  return {
    id: String(row.id),
    room_number: String(row.room_number),
    status: row.status as HousekeepingTask["status"],
    notes: String(row.notes ?? ""),
    created_at: new Date(String(row.created_at)).toISOString(),
  };
}

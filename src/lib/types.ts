export type StaffRole = "guest" | "admin" | "housekeeping";
export type RoomStatus = "disponible" | "ocupada" | "limpieza" | "mantenimiento";
export type CleaningState = "limpio" | "sucio" | "en_proceso";
export type RoomType = "confort" | "estandar";

export interface HotelInfo {
  name: string;
  tagline: string;
  city: string;
  address: string;
  phones: { number: string; label: string; whatsapp: string }[];
  email: string;
  currency: string;
  wifiNetwork: string;
  /** Editable from admin CMS; shown on guest portal when set. */
  wifiPassword: string;
  wifiPasswordHint: string;
  checkoutHour: string;
  heroPhoto: string;
  galleryPhotos: string[];
}

export interface RoomAssignment {
  workerName: string;
  dni: string;
  contrataId: string | null;
  contrataName: string | null;
  assignedAt: string;
  lastCheckoutAt: string | null;
  checkedOutToday: boolean;
}

export interface Room {
  id: string;
  number: string;
  name: string;
  type: RoomType;
  floor: number;
  capacity: number;
  bed: string;
  price_per_night: number;
  status: RoomStatus;
  amenities: string[];
  cleaning_notes: string;
  housekeeper: string | null;
  current_booking_id: string | null;
  cleaning_state: CleaningState;
  assignment: RoomAssignment | null;
  /** Public photo URL (Unsplash or CDN). Editable in admin CMS. */
  photo_url: string;
}

export interface Contrata {
  id: string;
  ruc: string;
  razon_social: string;
  contacto: string;
  telefono: string;
}

export interface Booking {
  id: string;
  code: string;
  room_number: string;
  guest_name: string;
  guest_doc: string;
  check_in: string;
  check_out: string | null;
  status: "activa" | "cerrada" | "cancelada";
  base_price: number;
  charges: LedgerItem[];
  payments: LedgerItem[];
}

export interface LedgerItem {
  id: string;
  description: string;
  amount: number;
  method?: string;
  reference?: string;
  created_at: string;
}

export interface Pernocta {
  id: string;
  ticket: string;
  room_number: string;
  dni: string;
  worker_name: string;
  contrata_name: string;
  night_date: string;
  checkout_at: string;
  tariff: number;
  validated: boolean;
}

export interface PettyCashEntry {
  id: string;
  type: "ingreso" | "egreso";
  category: string;
  description: string;
  amount: number;
  created_at: string;
  created_by: string;
  sede: string;
}

export interface AttendanceRecord {
  id: string;
  staff_name: string;
  role: string;
  type: "entrada" | "salida";
  recorded_at: string;
  note: string;
  sede: string;
}

export interface HousekeepingTask {
  id: string;
  room_number: string;
  status: "pendiente" | "completa";
  notes: string;
  created_at: string;
}

export interface AppState {
  hotel: HotelInfo;
  rooms: Room[];
  contratas: Contrata[];
  bookings: Booking[];
  pernoctas: Pernocta[];
  pettyCash: PettyCashEntry[];
  attendance: AttendanceRecord[];
  housekeepingTasks: HousekeepingTask[];
  roomServiceEnabled: boolean;
  dataMode: "mock" | "supabase" | "postgres";
}

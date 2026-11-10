import type { HotelInfo, Room } from "@/lib/types";
import { HOTEL } from "@/lib/data/hotel";
import roomsSeed from "@/lib/data/rooms-seed.json";
import { MEDIA } from "@/lib/data/media";

/** In-process mutable overlay (memory driver + merge after DB writes). */
let hotelState: HotelInfo = {
  ...HOTEL,
  wifiPassword: HOTEL.wifiPassword || "",
  heroPhoto: HOTEL.heroPhoto || MEDIA.heroAndes,
  galleryPhotos: HOTEL.galleryPhotos?.length
    ? HOTEL.galleryPhotos
    : [MEDIA.roomBed, MEDIA.roomTv, MEDIA.bathroom, MEDIA.reception],
};

const roomState = new Map<string, Room>(
  (roomsSeed as Room[]).map((r, idx) => {
    const photos = [MEDIA.roomBed, MEDIA.roomTv, MEDIA.roomDouble, MEDIA.roomWarm, MEDIA.bathroom, MEDIA.reception];
    return [
      r.number,
      {
        ...r,
        photo_url: r.photo_url || photos[idx % photos.length],
      },
    ];
  })
);

export function getCachedHotel(): HotelInfo {
  return { ...hotelState, phones: hotelState.phones.map((p) => ({ ...p })) };
}

export function setCachedHotel(next: HotelInfo) {
  hotelState = {
    ...next,
    phones: next.phones.map((p) => ({ ...p })),
    galleryPhotos: [...(next.galleryPhotos || [])],
  };
}

export function getCachedRooms(): Room[] {
  return [...roomState.values()].sort((a, b) => a.number.localeCompare(b.number, undefined, { numeric: true }));
}

export function getCachedRoom(number: string): Room | undefined {
  return roomState.get(number);
}

export function setCachedRoom(room: Room) {
  roomState.set(room.number, { ...room });
}

export function mergeHotelFromRow(row: Record<string, unknown> | null | undefined): HotelInfo {
  if (!row || !row.name) return getCachedHotel();
  const content =
    typeof row.content_json === "string"
      ? (JSON.parse(row.content_json || "{}") as Partial<HotelInfo>)
      : ((row.content_json as Partial<HotelInfo>) || {});
  const phones =
    typeof row.phones === "string" ? (JSON.parse(row.phones) as HotelInfo["phones"]) : (row.phones as HotelInfo["phones"]);
  const merged: HotelInfo = {
    name: String(row.name ?? hotelState.name),
    tagline: String(row.tagline ?? hotelState.tagline),
    city: String(row.city ?? hotelState.city),
    address: String(row.address ?? hotelState.address),
    email: String(row.email ?? hotelState.email),
    phones: phones?.length ? phones : hotelState.phones,
    currency: String(row.currency ?? hotelState.currency),
    wifiNetwork: String(row.wifi_network ?? hotelState.wifiNetwork),
    wifiPassword: String(row.wifi_password ?? content.wifiPassword ?? hotelState.wifiPassword ?? ""),
    wifiPasswordHint: String(content.wifiPasswordHint ?? hotelState.wifiPasswordHint),
    checkoutHour: String(row.checkout_hour ?? hotelState.checkoutHour),
    heroPhoto: String(content.heroPhoto ?? hotelState.heroPhoto ?? MEDIA.heroAndes),
    galleryPhotos: (content.galleryPhotos as string[] | undefined) || hotelState.galleryPhotos,
  };
  setCachedHotel(merged);
  return getCachedHotel();
}

export function mergeRoomFromRow(row: Record<string, unknown>): Room {
  const number = String(row.number);
  const prev = roomState.get(number);
  const amenities =
    typeof row.amenities === "string" ? (JSON.parse(row.amenities || "[]") as string[]) : ((row.amenities as string[]) ?? prev?.amenities ?? []);
  const assignment =
    typeof row.assignment === "string"
      ? (JSON.parse(row.assignment || "null") as Room["assignment"])
      : ((row.assignment as Room["assignment"]) ?? prev?.assignment ?? null);
  const room: Room = {
    id: String(row.id ?? prev?.id ?? number),
    number,
    name: String(row.name ?? prev?.name ?? `Habitación ${number}`),
    type: (row.room_type ?? row.type ?? prev?.type ?? "estandar") as Room["type"],
    floor: Number(row.floor ?? prev?.floor ?? 1),
    capacity: Number(row.capacity ?? prev?.capacity ?? 1),
    bed: String(row.bed ?? prev?.bed ?? ""),
    price_per_night: Number(row.price_per_night ?? prev?.price_per_night ?? 0),
    status: (row.status as Room["status"]) ?? prev?.status ?? "disponible",
    amenities,
    cleaning_notes: String(row.cleaning_notes ?? prev?.cleaning_notes ?? ""),
    housekeeper: prev?.housekeeper ?? null,
    current_booking_id: row.current_booking_id ? String(row.current_booking_id) : prev?.current_booking_id ?? null,
    cleaning_state: (row.cleaning_state as Room["cleaning_state"]) ?? prev?.cleaning_state ?? "limpio",
    assignment,
    photo_url: String(row.photo_url || prev?.photo_url || ""),
  };
  setCachedRoom(room);
  return room;
}

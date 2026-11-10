"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MEDIA } from "@/lib/data/media";
import type { HotelInfo, Room } from "@/lib/types";

type Props = {
  hotel: HotelInfo;
  rooms: Room[];
  onSaved: () => Promise<void>;
  onToast: (msg: string) => void;
};

const PRESET_PHOTOS = [
  MEDIA.roomBed,
  MEDIA.roomTv,
  MEDIA.roomDouble,
  MEDIA.roomWarm,
  MEDIA.bathroom,
  MEDIA.reception,
  MEDIA.heroAndes,
  MEDIA.townAndes,
];

export function SettingsEditor({ hotel, rooms, onSaved, onToast }: Props) {
  const [form, setForm] = useState<HotelInfo>(hotel);
  const [selectedRoom, setSelectedRoom] = useState(rooms[0]?.number || "");
  const room = rooms.find((r) => r.number === selectedRoom) || rooms[0];
  const [roomForm, setRoomForm] = useState<Room | null>(room || null);
  const [busy, setBusy] = useState(false);

  function pickRoom(number: string) {
    setSelectedRoom(number);
    const r = rooms.find((x) => x.number === number);
    if (r) setRoomForm({ ...r });
  }

  async function saveHotel() {
    setBusy(true);
    const res = await fetch("/api/admin/settings", {
      method: "PUT",
      credentials: "same-origin",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(form),
    });
    setBusy(false);
    if (!res.ok) {
      onToast("No se pudo guardar hotel (¿sesión admin?)");
      return;
    }
    await onSaved();
    onToast("Datos del hotel guardados");
  }

  async function saveRoom() {
    if (!roomForm) return;
    setBusy(true);
    const res = await fetch("/api/admin/rooms", {
      method: "PUT",
      credentials: "same-origin",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(roomForm),
    });
    setBusy(false);
    if (!res.ok) {
      onToast("No se pudo guardar habitación");
      return;
    }
    await onSaved();
    onToast(`Habitación ${roomForm.number} actualizada`);
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--navy-deep)] p-5 text-white shadow-[var(--shadow-soft)]">
        <p className="text-[0.7rem] font-bold uppercase tracking-[0.18em] text-amber-300">CMS · Editar aplicación</p>
        <h2 className="mt-2 font-display text-3xl">Configuración completa del hotel</h2>
        <p className="mt-2 text-sm text-slate-200">
          Edita nombre, slogan, teléfonos, correo, Wi‑Fi, fotos y cada habitación. Los cambios se reflejan en portal
          huésped y PMS.
        </p>
      </div>

      <section className="grid gap-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-soft)] lg:grid-cols-2">
        <h3 className="font-display text-2xl lg:col-span-2">Hotel · contactos · Wi‑Fi</h3>
        {(
          [
            ["name", "Nombre"],
            ["tagline", "Slogan"],
            ["city", "Ciudad"],
            ["address", "Dirección"],
            ["email", "Correo"],
            ["wifiNetwork", "Red Wi‑Fi"],
            ["wifiPassword", "Contraseña Wi‑Fi"],
            ["wifiPasswordHint", "Ayuda Wi‑Fi"],
            ["checkoutHour", "Hora check-out"],
            ["heroPhoto", "URL foto portada"],
          ] as const
        ).map(([key, label]) => (
          <label key={key} className="text-sm font-medium">
            {label}
            <Input
              className="mt-1"
              value={String(form[key] ?? "")}
              onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
            />
          </label>
        ))}
        {form.phones.map((p, idx) => (
          <div key={idx} className="grid gap-2 rounded-xl border border-[var(--border)] p-3 sm:grid-cols-3 lg:col-span-2">
            <Input
              placeholder="Número visible"
              value={p.number}
              onChange={(e) => {
                const phones = [...form.phones];
                phones[idx] = { ...phones[idx], number: e.target.value };
                setForm((f) => ({ ...f, phones }));
              }}
            />
            <Input
              placeholder="Etiqueta"
              value={p.label}
              onChange={(e) => {
                const phones = [...form.phones];
                phones[idx] = { ...phones[idx], label: e.target.value };
                setForm((f) => ({ ...f, phones }));
              }}
            />
            <Input
              placeholder="WhatsApp (519...)"
              value={p.whatsapp}
              onChange={(e) => {
                const phones = [...form.phones];
                phones[idx] = { ...phones[idx], whatsapp: e.target.value };
                setForm((f) => ({ ...f, phones }));
              }}
            />
          </div>
        ))}
        <div className="lg:col-span-2">
          <p className="mb-2 text-sm font-medium">Fotos de galería (URLs)</p>
          <div className="grid gap-2">
            {(form.galleryPhotos || []).map((url, idx) => (
              <Input
                key={idx}
                value={url}
                onChange={(e) => {
                  const galleryPhotos = [...(form.galleryPhotos || [])];
                  galleryPhotos[idx] = e.target.value;
                  setForm((f) => ({ ...f, galleryPhotos }));
                }}
              />
            ))}
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {PRESET_PHOTOS.map((src) => (
              // eslint-disable-next-line @next/next/no-img-element
              <button
                key={src}
                type="button"
                className="h-14 w-20 overflow-hidden rounded-lg border border-[var(--border)]"
                onClick={() => setForm((f) => ({ ...f, heroPhoto: src }))}
                title="Usar como portada"
              >
                <img src={src} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        </div>
        <div className="lg:col-span-2">
          <Button type="button" disabled={busy} onClick={() => void saveHotel()}>
            Guardar hotel / contactos / fotos
          </Button>
        </div>
      </section>

      <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-soft)]">
        <h3 className="font-display text-2xl">Habitaciones</h3>
        <div className="mt-3 flex flex-wrap gap-2">
          {rooms.map((r) => (
            <button
              key={r.number}
              type="button"
              onClick={() => pickRoom(r.number)}
              className={`h-9 rounded-lg px-3 text-xs font-bold ${
                selectedRoom === r.number
                  ? "bg-[var(--navy)] text-white"
                  : "border border-[var(--border)] text-[var(--text-muted)]"
              }`}
            >
              {r.number}
            </button>
          ))}
        </div>
        {roomForm ? (
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <label className="text-sm">
              Nombre
              <Input
                className="mt-1"
                value={roomForm.name}
                onChange={(e) => setRoomForm({ ...roomForm, name: e.target.value })}
              />
            </label>
            <label className="text-sm">
              Tipo
              <select
                className="mt-1 h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 text-sm"
                value={roomForm.type}
                onChange={(e) =>
                  setRoomForm({ ...roomForm, type: e.target.value as Room["type"] })
                }
              >
                <option value="confort">Confort</option>
                <option value="estandar">Estándar</option>
              </select>
            </label>
            <label className="text-sm">
              Cama / descripción
              <Input
                className="mt-1"
                value={roomForm.bed}
                onChange={(e) => setRoomForm({ ...roomForm, bed: e.target.value })}
              />
            </label>
            <label className="text-sm">
              Precio / noche
              <Input
                className="mt-1"
                type="number"
                value={roomForm.price_per_night}
                onChange={(e) =>
                  setRoomForm({ ...roomForm, price_per_night: Number(e.target.value) })
                }
              />
            </label>
            <label className="text-sm md:col-span-2">
              URL foto habitación
              <Input
                className="mt-1"
                value={roomForm.photo_url || ""}
                onChange={(e) => setRoomForm({ ...roomForm, photo_url: e.target.value })}
              />
            </label>
            <div className="flex flex-wrap gap-2 md:col-span-2">
              {PRESET_PHOTOS.map((src) => (
                <button
                  key={src}
                  type="button"
                  className="h-14 w-20 overflow-hidden rounded-lg border border-[var(--border)]"
                  onClick={() => setRoomForm({ ...roomForm, photo_url: src })}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
            {roomForm.photo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={roomForm.photo_url}
                alt={`Hab ${roomForm.number}`}
                className="aspect-video w-full rounded-xl object-cover md:col-span-2"
              />
            ) : null}
            <div className="md:col-span-2">
              <Button type="button" disabled={busy} onClick={() => void saveRoom()}>
                Guardar habitación {roomForm.number}
              </Button>
            </div>
          </div>
        ) : null}
      </section>
    </div>
  );
}

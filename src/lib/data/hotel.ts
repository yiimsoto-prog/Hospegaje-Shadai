import type { HotelInfo } from "@/lib/types";

export const HOTEL: HotelInfo = {
  name: "Hospedaje Shadai",
  tagline: "Bajo la cobertura del Altísimo",
  city: "Challhuahuacho, Cotabambas — Apurímac",
  address: "Av. 18 de Noviembre s/n — Barrio Los Álamos, Challhuahuacho",
  phones: [
    { number: "949 268 775", label: "Atención / Reservas", whatsapp: "51949268775" },
    { number: "992 125 903", label: "Recepción", whatsapp: "51992125903" },
  ],
  email: "hospedajeshadai@gmail.com",
  currency: "S/",
  wifiNetwork: "HOSPEDAJE SHADAI",
  wifiPasswordHint: "Solicitar en recepción (no se publica en el código)",
  checkoutHour: "11:00",
};

export const SEDES = ["Challhuahuacho"] as const;

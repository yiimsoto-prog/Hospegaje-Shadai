/**
 * Hotel & Challhuahuacho-inspired media (Unsplash — libre para uso web).
 * Las de ciudad representan paisaje altoandino / pueblos de Apurímac–Cusco
 * (no son fotos oficiales municipales; evocan el entorno de Challhuahuacho).
 */
export const MEDIA = {
  heroAndes:
    "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=2400&q=80",
  roomBed:
    "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=1600&q=80",
  roomTv:
    "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1600&q=80",
  roomDouble:
    "https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=1600&q=80",
  roomWarm:
    "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1600&q=80",
  bathroom:
    "https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?auto=format&fit=crop&w=1600&q=80",
  reception:
    "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1600&q=80",
  townAndes:
    "https://images.unsplash.com/photo-1526392060635-9d6019884377?auto=format&fit=crop&w=1600&q=80",
  townStreet:
    "https://images.unsplash.com/photo-1587595431973-160d0d94add1?auto=format&fit=crop&w=1600&q=80",
  highlandRoad:
    "https://images.unsplash.com/photo-1531761535209-180857e963b9?auto=format&fit=crop&w=1600&q=80",
  valleyDusk:
    "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1600&q=80",
} as const;

export const ROOM_GALLERY = [
  {
    src: MEDIA.roomBed,
    title: "Cama 2 plazas",
    caption: "Descanso reparador tras jornada en altura",
  },
  {
    src: MEDIA.roomTv,
    title: "Smart TV 50\"",
    caption: "Habitación Simple Confort con entretenimiento",
  },
  {
    src: MEDIA.roomDouble,
    title: "Ambiente sobrio",
    caption: "Luz natural, ropero y mesa de trabajo",
  },
  {
    src: MEDIA.roomWarm,
    title: "Calidez altoandina",
    caption: "Calefactor eléctrico y ropa de cama limpia",
  },
  {
    src: MEDIA.bathroom,
    title: "Baño privado",
    caption: "Agua caliente 24 horas",
  },
  {
    src: MEDIA.reception,
    title: "Recepción",
    caption: "Atención continua para contratas y huéspedes",
  },
] as const;

export const CITY_GALLERY = [
  {
    src: MEDIA.townAndes,
    title: "Cordillera de Apurímac",
    caption: "Entorno de Challhuahuacho · Cotabambas",
  },
  {
    src: MEDIA.townStreet,
    title: "Pueblo altoandino",
    caption: "Calles y ritmo de ciudad minera en altura",
  },
  {
    src: MEDIA.highlandRoad,
    title: "Ruta a Cotabambas",
    caption: "Acceso por paisaje agreste y cielo limpio",
  },
  {
    src: MEDIA.valleyDusk,
    title: "Atardecer en los Andes",
    caption: "El valle que abraza Challhuahuacho",
  },
] as const;

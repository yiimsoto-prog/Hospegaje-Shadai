type ConciergeReply = { answer: string; intent: string; links?: { href: string; label: string }[] };

const FAQ: { keys: string[]; intent: string; answer: string; links?: ConciergeReply["links"] }[] = [
  {
    keys: ["wifi", "internet", "clave", "password"],
    intent: "wifi",
    answer:
      "La red Wi‑Fi es HOSPEDAJE SHADAI. La clave se entrega en recepción (no se publica). Horario de soporte: 24h en recepción.",
  },
  {
    keys: ["checkout", "check-out", "salida", "dni"],
    intent: "checkout",
    answer:
      "Para salida diaria de guardia use el Check-out móvil con DNI de 8 dígitos y número de habitación. Se genera ticket de auditoría para la contrata.",
    links: [{ href: "/checkout", label: "Abrir check-out móvil" }],
  },
  {
    keys: ["checkin", "check-in", "ingreso", "llegada"],
    intent: "checkin",
    answer:
      "El check-in digital registra DNI, habitación y firma del trabajador. Recepción o admin confirman la asignación en el PMS.",
    links: [{ href: "/guest/checkin", label: "Check-in digital" }],
  },
  {
    keys: ["precio", "tarifa", "cuesta", "habitacion", "habitación"],
    intent: "pricing",
    answer:
      "Habitación Simple Confort desde S/ 40. Las tarifas dinámicas según ocupación/temporada se ven en Operaciones → IA Demanda.",
    links: [{ href: "/ops/ai", label: "Ver proyección de demanda" }],
  },
  {
    keys: ["factura", "liquidacion", "liquidación", "contrata", "igv"],
    intent: "billing",
    answer:
      "La liquidación B2B agrupa pernoctas por contrata con subtotal + IGV 18%. Genere el reporte parametrizado en ERP.",
    links: [{ href: "/ops/erp", label: "ERP / liquidación" }],
  },
  {
    keys: ["mantenimiento", "agua", "caliente", "calefactor", "roto"],
    intent: "maintenance",
    answer:
      "Reporte fallas en Mantenimiento preventivo. Priorizamos agua caliente 24h, calefactores y filtración para operación minera.",
    links: [{ href: "/ops/maintenance", label: "Abrir mantenimiento" }],
  },
  {
    keys: ["pago", "pagar", "yape", "tarjeta", "culqi", "mercadopago"],
    intent: "payments",
    answer:
      "La pasarela de pagos se activa con Culqi/Mercado Pago vía secretos del Worker (nunca en el frontend). Mientras tanto, caja chica y liquidación B2B cubren el flujo operativo.",
    links: [{ href: "/ops/security", label: "Estado de integraciones" }],
  },
];

export function answerConcierge(message: string): ConciergeReply {
  const q = message.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "");
  for (const item of FAQ) {
    if (item.keys.some((k) => q.includes(k.normalize("NFD").replace(/\p{Diacritic}/gu, "")))) {
      return { answer: item.answer, intent: item.intent, links: item.links };
    }
  }
  return {
    intent: "fallback",
    answer:
      "Soy el conserje virtual 24/7 de Hospedaje Shadai. Puedo ayudar con Wi‑Fi, check-in/out, tarifas, liquidación a contratas y mantenimiento. ¿Qué necesita?",
    links: [
      { href: "/ops", label: "Centro de operaciones" },
      { href: "/pms", label: "PMS" },
      { href: "/checkout", label: "Check-out" },
    ],
  };
}

/** Input validation helpers — defense in depth against injection / bad payloads. */

export function sanitizeText(input: unknown, max = 200): string {
  return String(input ?? "")
    .replace(/[\u0000-\u001F\u007F]/g, "")
    .trim()
    .slice(0, max);
}

export function isValidDni(input: unknown): boolean {
  return /^\d{8}$/.test(String(input ?? "").trim());
}

/** DNI (8) or Carné de Extranjería (9–12 alfanumérico). */
export function isValidIdentityDoc(input: unknown): boolean {
  const v = String(input ?? "").trim();
  return /^\d{8}$/.test(v) || /^[A-Za-z0-9]{9,12}$/.test(v);
}

export function isValidRuc(input: unknown): boolean {
  return /^\d{11}$/.test(String(input ?? "").trim());
}

export function clampMoney(input: unknown): number | null {
  const n = Number(input);
  if (!Number.isFinite(n) || n < 0 || n > 1_000_000) return null;
  return Math.round(n * 100) / 100;
}

export function requireFields<T extends Record<string, unknown>>(
  body: T,
  keys: (keyof T)[]
): string | null {
  for (const key of keys) {
    const v = body[key];
    if (v === undefined || v === null || String(v).trim() === "") {
      return `missing_${String(key)}`;
    }
  }
  return null;
}

import type { StaffRole } from "@/lib/server/authz";

export type StaffRecord = {
  viewer_sub: string;
  email: string;
  full_name: string;
  role: StaffRole;
  active: boolean;
  password_hash: string;
};

/** Process-local mirror so Workers memory mode and flaky DB still keep the first admin. */
const bySub = new Map<string, StaffRecord>();
const byEmail = new Map<string, string>();

export function staffCount(): number {
  return bySub.size;
}

export function upsertStaff(record: StaffRecord) {
  const email = record.email.toLowerCase();
  bySub.set(record.viewer_sub, { ...record, email });
  byEmail.set(email, record.viewer_sub);
}

export function getStaffBySub(sub: string): StaffRecord | null {
  return bySub.get(sub) ?? null;
}

export function getStaffByEmail(email: string): StaffRecord | null {
  const sub = byEmail.get(email.toLowerCase());
  if (!sub) return null;
  return bySub.get(sub) ?? null;
}

export function listStaff(): StaffRecord[] {
  return [...bySub.values()];
}

import { redirect } from "next/navigation";

/** Operaciones ahora vive dentro de /app (panel admin). */
export default function OpsRedirectPage() {
  redirect("/app?tab=ops");
}

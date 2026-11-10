import { redirect } from "next/navigation";

/** Legacy path → staff app */
export default function PmsRedirectPage() {
  redirect("/app");
}

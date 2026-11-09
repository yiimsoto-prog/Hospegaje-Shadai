import type { Metadata } from "next";
import { PmsApp } from "@/components/pms/pms-app";

export const metadata: Metadata = {
  title: "Sistema PMS",
};

export default function PmsPage() {
  return <PmsApp />;
}

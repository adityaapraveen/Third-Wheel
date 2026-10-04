import { Suspense } from "react";
import { LifeTogether } from "@/components/LifeTogether";
export const metadata = { title: "Life Together — fictional simulation" };
export default function LifePage() {
  return (
    <Suspense
      fallback={
        <div className="page-wrap empty-state">Opening the shared home…</div>
      }
    >
      <LifeTogether />
    </Suspense>
  );
}

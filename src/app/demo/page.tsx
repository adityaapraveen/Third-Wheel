import { Suspense } from "react";
import { DemoDashboard } from "@/components/DemoDashboard";
export const metadata = { title: "The experiment" };
export default function DemoPage() {
  return (
    <Suspense
      fallback={
        <div className="page-wrap">
          Your representative is entering the villa…
        </div>
      }
    >
      <DemoDashboard />
    </Suspense>
  );
}

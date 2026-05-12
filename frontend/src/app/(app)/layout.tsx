import { BottomNav } from "@/components/BottomNav";
import { DailyEventGate } from "@/components/DailyEventGate";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col flex-1 bg-canvas pb-28 min-h-screen">
      {children}
      <BottomNav />
      <DailyEventGate />
    </div>
  );
}

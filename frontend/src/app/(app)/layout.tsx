import { BottomNav } from "@/components/BottomNav";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col flex-1 bg-gray-50 pb-16 min-h-screen">
      {/* pb-16 compensa a altura da BottomNav */}
      {children}
      <BottomNav />
    </div>
  );
}

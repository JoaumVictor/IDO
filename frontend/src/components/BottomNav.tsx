"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, User, Sparkles, Settings } from "lucide-react";

export function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    { href: "/feed", icon: Home, label: "Navegar" },
    { href: "/profile", icon: User, label: "Meu IDO" },
    { href: "/skills", icon: Sparkles, label: "Skills" },
    { href: "/settings", icon: Settings, label: "Config" },
  ];

  return (
    <nav className="fixed bottom-0 w-full max-w-150 bg-white/80 backdrop-blur-md border-t border-gray-100 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)] z-50">
      <div className="flex justify-around items-center h-16 pb-safe">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center w-full h-full transition-colors ${
                isActive ? "text-indigo-600" : "text-gray-400 hover:text-gray-600"
              }`}
            >
              <div className={`p-1.5 rounded-xl transition-all ${isActive ? "bg-indigo-50 text-indigo-600" : "text-gray-400"}`}>
                <Icon className="w-6 h-6" strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span className={`text-[10px] mt-0.5 font-medium ${isActive ? "font-bold text-indigo-700" : ""}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

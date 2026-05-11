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
    <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-150 px-5 pb-5 pt-3 z-50 pointer-events-none">
      <nav className="neo-raised-sm rounded-full pointer-events-auto px-3 py-2">
        <div className="flex justify-around items-center">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center justify-center w-full py-1.5 transition-colors"
              >
                <div
                  className={`relative flex items-center justify-center w-11 h-11 rounded-full transition-all ${
                    isActive ? "neo-pressed-sm" : ""
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 ${
                      isActive ? "text-accent" : "text-text-secondary"
                    }`}
                    strokeWidth={2.5}
                  />
                  {isActive && (
                    <span className="absolute -top-0.5 right-1 w-1.5 h-1.5 rounded-full bg-accent neo-glow-accent" />
                  )}
                </div>
                <span
                  className={`text-[10px] mt-1 font-display font-bold tracking-wider uppercase ${
                    isActive ? "text-accent" : "text-text-muted"
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

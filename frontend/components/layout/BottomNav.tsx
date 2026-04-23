"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Search,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/prospects", label: "Prospects", icon: Users },
  { href: "/dashboard/campaigns", label: "Campagnes", icon: Search },
  { href: "/dashboard/settings", label: "Paramètres", icon: Settings },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 z-50 bg-white/90 backdrop-blur-md border-t border-black/10 safe-area-inset-bottom">
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg text-[10px] font-medium transition-colors min-w-[56px]",
                isActive
                  ? "text-blue-600"
                  : "text-muted-foreground"
              )}
            >
              <item.icon className={cn("size-5", isActive && "text-blue-600")} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

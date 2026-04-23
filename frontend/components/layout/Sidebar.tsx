"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Search,
  Settings,
  Zap,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { CreditMeter } from "./CreditMeter";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/prospects", label: "Prospects", icon: Users },
  { href: "/dashboard/campaigns", label: "Campagnes", icon: Search },
  { href: "/dashboard/scraping", label: "Scraping", icon: Zap },
  { href: "/dashboard/settings", label: "Paramètres", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex flex-col w-64 h-screen sticky top-0 border-r border-white/40 bg-white/60 backdrop-blur-md p-4">
      {/* Logo */}
      <div className="flex items-center gap-2 px-2 mb-6">
        <div className="size-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
          <span className="text-white font-bold text-sm">L</span>
        </div>
        <span className="font-semibold text-lg">Leadaly</span>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-1 flex-1">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-blue-50 text-blue-600"
                  : "text-muted-foreground hover:bg-gray-100 hover:text-gray-900"
              )}
            >
              <item.icon className="size-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Credit meter */}
      <div className="mt-4">
        <CreditMeter />
      </div>

      {/* Lang toggle */}
      <button className="flex items-center justify-between px-3 py-2 mt-3 text-xs text-muted-foreground hover:text-foreground transition-colors">
        <span>FR</span>
        <ChevronDown className="size-3" />
      </button>
    </aside>
  );
}

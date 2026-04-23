"use client";

import { Bell, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function TopBar() {
  return (
    <header className="lg:hidden sticky top-0 z-40 flex items-center justify-between px-4 py-3 bg-white/80 backdrop-blur-md border-b border-black/5">
      {/* Logo */}
      <div className="flex items-center gap-2">
        <div className="size-7 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
          <span className="text-white font-bold text-xs">L</span>
        </div>
        <span className="font-semibold text-sm">Leadaly</span>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="size-8">
          <Bell className="size-4" />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors px-1.5 py-1 rounded-md hover:bg-gray-100">
            FR
            <ChevronDown className="size-3" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Français</DropdownMenuItem>
            <DropdownMenuItem>English</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

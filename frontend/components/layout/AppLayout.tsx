"use client";

import { Sidebar } from "./Sidebar";
import { BottomNav } from "./BottomNav";
import { TopBar } from "./TopBar";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 min-h-screen pb-20 lg:pb-0">
        <TopBar />
        <div className="p-4 lg:p-6">{children}</div>
      </main>
      <BottomNav />
    </div>
  );
}

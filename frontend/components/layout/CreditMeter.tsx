"use client";

import { Zap } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

// Mock data — replace with real API call
const credits = { remaining: 347, total: 500 };
const percent = Math.round((credits.remaining / credits.total) * 100);

export function CreditMeter() {
  return (
    <div className="card-leadaly rounded-xl p-3">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <Zap className="size-3.5 text-blue-500 fill-blue-500" />
          <span className="text-xs font-medium">Crédits</span>
        </div>
        <span className="text-xs text-muted-foreground">
          {credits.remaining} / {credits.total}
        </span>
      </div>
      <Progress
        value={percent}
        className={cn("h-2", percent < 20 && "[&>div]:bg-red-500")}
      />
      <p className="text-[10px] text-muted-foreground mt-1.5">
        {percent < 20
          ? "Crédits faibles — rechargez bientôt"
          : `${credits.total - credits.remaining} crédits utilisés ce mois`}
      </p>
    </div>
  );
}

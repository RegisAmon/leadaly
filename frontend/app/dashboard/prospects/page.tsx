"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProspectsPage() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Prospects</h1>
          <p className="text-sm text-muted-foreground">
            Aucun prospect pour le moment
          </p>
        </div>
        <Skeleton className="h-9 w-32 rounded-lg" />
      </div>

      {/* Filter bar skeleton */}
      <Card className="card-leadaly border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-2">
            {["Tous", "Nouveau", "Contacté", "Qualifié"].map((tab) => (
              <Skeleton key={tab} className="h-8 w-20 rounded-full" />
            ))}
            <div className="flex-1" />
            <Skeleton className="h-8 w-48 rounded-lg" />
          </div>
        </CardContent>
      </Card>

      {/* Empty state */}
      <Card className="card-leadaly border-0 shadow-sm">
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <div className="size-12 rounded-full bg-blue-50 flex items-center justify-center mb-4">
            <span className="text-2xl">🎯</span>
          </div>
          <h3 className="font-medium mb-1">Aucun prospect trouvé</h3>
          <p className="text-sm text-muted-foreground max-w-xs">
            Lancez votre première campagne de scraping LinkedIn pour commencer à
            collecter des prospects.
          </p>
          <Skeleton className="h-9 w-44 rounded-lg mt-4" />
        </CardContent>
      </Card>
    </div>
  );
}

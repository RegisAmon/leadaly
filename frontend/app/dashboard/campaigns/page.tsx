"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function CampaignsPage() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Campagnes</h1>
          <p className="text-sm text-muted-foreground">
            0 campagne active
          </p>
        </div>
        <Skeleton className="h-9 w-36 rounded-lg" />
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        {["Total", "En cours", "Terminées"].map((label) => (
          <Card key={label} className="card-leadaly border-0 shadow-sm">
            <CardContent className="p-3 text-center">
              <Skeleton className="h-6 w-8 mx-auto mb-1" />
              <Skeleton className="h-3 w-16 mx-auto" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty state */}
      <Card className="card-leadaly border-0 shadow-sm">
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <div className="size-12 rounded-full bg-indigo-50 flex items-center justify-center mb-4">
            <span className="text-2xl">🔍</span>
          </div>
          <h3 className="font-medium mb-1">Aucune campagne</h3>
          <p className="text-sm text-muted-foreground max-w-xs">
            Créez votre première campagne pour rechercher des prospects sur
            LinkedIn.
          </p>
          <Skeleton className="h-9 w-44 rounded-lg mt-4" />
        </CardContent>
      </Card>
    </div>
  );
}

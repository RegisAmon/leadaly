"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function ScrapingPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold">Scraping LinkedIn</h1>
        <p className="text-sm text-muted-foreground">
          Lancez des campagnes de recherche sur LinkedIn Sales Navigator
        </p>
      </div>

      {/* API status */}
      <Card className="card-leadaly border-0 shadow-sm">
        <CardContent className="p-4">
          <h3 className="text-sm font-medium mb-3">État des connexions</h3>
          <div className="space-y-2">
            {[
              { name: "LinkdAPI", status: "non connecté" },
              { name: "Apify", status: "non connecté" },
            ].map((api) => (
              <div
                key={api.name}
                className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
              >
                <span className="text-sm">{api.name}</span>
                <Skeleton className="h-5 w-24 rounded-full" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Empty jobs list */}
      <Card className="card-leadaly border-0 shadow-sm">
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <div className="size-12 rounded-full bg-amber-50 flex items-center justify-center mb-4">
            <span className="text-2xl">⚡</span>
          </div>
          <h3 className="font-medium mb-1">Aucun job en cours</h3>
          <p className="text-sm text-muted-foreground max-w-xs">
            Les jobs de scraping apparaîtront ici une fois lancés.
          </p>
          <Skeleton className="h-9 w-44 rounded-lg mt-4" />
        </CardContent>
      </Card>
    </div>
  );
}

"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

export default function SettingsPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold">Paramètres</h1>
        <p className="text-sm text-muted-foreground">
          Gérez votre workspace et vos préférences
        </p>
      </div>

      {/* Workspace */}
      <Card className="card-leadaly border-0 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Workspace</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1.5">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-9 w-full rounded-lg" />
          </div>
          <div className="space-y-1.5">
            <Skeleton className="h-3 w-32" />
            <Skeleton className="h-9 w-full rounded-lg" />
          </div>
          <Skeleton className="h-9 w-28 rounded-lg" />
        </CardContent>
      </Card>

      {/* Billing */}
      <Card className="card-leadaly border-0 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Abonnement</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <Skeleton className="h-4 w-20 mb-1" />
              <Skeleton className="h-3 w-32" />
            </div>
            <Skeleton className="h-9 w-36 rounded-lg" />
          </div>
        </CardContent>
      </Card>

      {/* Danger zone */}
      <Card className="card-leadaly border-0 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base text-destructive">Zone danger</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <Skeleton className="h-3 w-40 mb-1" />
              <Skeleton className="h-2 w-64" />
            </div>
            <Skeleton className="h-9 w-32 rounded-lg" />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <Skeleton className="h-3 w-36 mb-1" />
              <Skeleton className="h-2 w-56" />
            </div>
            <Skeleton className="h-9 w-40 rounded-lg" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

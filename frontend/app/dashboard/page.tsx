"use client";

import { Users, Search, TrendingUp, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const stats = [
  {
    label: "Total Prospects",
    value: "1,247",
    change: "+12% ce mois",
    icon: Users,
    color: "text-blue-500",
  },
  {
    label: "Campagnes",
    value: "5",
    change: "2 actives",
    icon: Search,
    color: "text-indigo-500",
  },
  {
    label: "Taux d'ouverture",
    value: "34.2%",
    change: "+2.1% vs mois dernier",
    icon: TrendingUp,
    color: "text-emerald-500",
  },
  {
    label: "En attente",
    value: "3 jobs",
    change: "LinkedIn scraping",
    icon: Clock,
    color: "text-amber-500",
  },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold">Tableau de bord</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Bienvenue 👋 — voici l&apos;aperçu de votre activité
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="card-leadaly border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <span className="text-xs text-muted-foreground font-medium">
                  {stat.label}
                </span>
                <stat.icon className={`size-4 ${stat.color}`} />
              </div>
              <p className="text-2xl font-semibold">{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{stat.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* bySector */}
        <Card className="card-leadaly border-0 shadow-sm">
          <CardContent className="p-4">
            <h3 className="text-sm font-medium mb-4">Prospects par secteur</h3>
            <div className="space-y-3">
              {[
                { sector: "Tech", count: 487, pct: 72 },
                { sector: "Finance", count: 234, pct: 50 },
                { sector: "Santé", count: 189, pct: 38 },
                { sector: "Retail", count: 156, pct: 30 },
                { sector: "Industrie", count: 98, pct: 18 },
              ].map(({ sector, count, pct }) => (
                <div key={sector} className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground w-16 shrink-0">{sector}</span>
                  <div className="flex-1 bg-muted rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-xs font-medium w-10 text-right shrink-0">{count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* recentActivity */}
        <Card className="card-leadaly border-0 shadow-sm">
          <CardContent className="p-4">
            <h3 className="text-sm font-medium mb-4">Activité récente</h3>
            <div className="space-y-3">
              {[
                { icon: "📥", text: "47 prospects ajoutés", sub: "Campagne SaaS France Q2", time: "il y a 2h" },
                { icon: "✅", text: "Job scraping terminé", sub: "31 nouveaux leads", time: "il y a 5h" },
                { icon: "💰", text: "12 crédits utilisés", sub: "Enrichissement Hunter", time: "hier" },
                { icon: "📧", text: "8 emails envoyés", sub: "Campagne Fintech Paris", time: "hier" },
              ].map(({ icon, text, sub, time }, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-lg">{icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{text}</p>
                    <p className="text-xs text-muted-foreground">{sub}</p>
                  </div>
                  <span className="text-xs text-muted-foreground shrink-0">{time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

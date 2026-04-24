"use client";

import { useState } from "react";
import { Plus, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CreateCampaignDialog } from "@/components/campaigns/CreateCampaignDialog";
import { CampaignCard, type Campaign } from "@/components/campaigns/CampaignCard";

const MOCK_CAMPAIGNS: Campaign[] = [
  {
    id: "1",
    name: "SaaS France Q2 2026",
    status: "completed",
    leads_count: 142,
    credits_used: 15,
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    completed_at: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: "2",
    name: "Fintech Paris 2026",
    status: "running",
    leads_count: 38,
    credits_used: 4,
    created_at: new Date(Date.now() - 3600000).toISOString(),
    completed_at: null,
  },
];

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>(MOCK_CAMPAIGNS);
  const [dialogOpen, setDialogOpen] = useState(false);

  function handleCreate(data: { name: string; filters: Record<string, unknown> }) {
    const newCampaign: Campaign = {
      id: `camp-${Date.now()}`,
      name: data.name,
      status: "draft",
      leads_count: 0,
      credits_used: 0,
      created_at: new Date().toISOString(),
      completed_at: null,
    };
    setCampaigns((prev) => [newCampaign, ...prev]);
    console.log("Create campaign:", data);
  }

  function handleDelete(id: string) {
    setCampaigns((prev) => prev.filter((c) => c.id !== id));
  }

  function handleRun(id: string) {
    setCampaigns((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, status: "running" as const } : c
      )
    );
  }

  const total = campaigns.length;
  const running = campaigns.filter((c) => c.status === "running").length;
  const completed = campaigns.filter((c) => c.status === "completed").length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Campagnes</h1>
          <p className="text-sm text-muted-foreground">
            {total} campagne{total !== 1 ? "s" : ""}, {running} en cours
          </p>
        </div>
        <Button
          size="sm"
          className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:opacity-90"
          onClick={() => setDialogOpen(true)}
        >
          <Plus className="size-4 mr-1.5" />
          Nouvelle campagne
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="card-leadaly border-0 shadow-sm">
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold">{total}</p>
            <p className="text-xs text-muted-foreground">Total</p>
          </CardContent>
        </Card>
        <Card className="card-leadaly border-0 shadow-sm">
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-blue-600">{running}</p>
            <p className="text-xs text-muted-foreground">En cours</p>
          </CardContent>
        </Card>
        <Card className="card-leadaly border-0 shadow-sm">
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-emerald-600">{completed}</p>
            <p className="text-xs text-muted-foreground">Terminées</p>
          </CardContent>
        </Card>
      </div>

      {/* Campaigns list */}
      {campaigns.length === 0 ? (
        <Card className="card-leadaly border-0 shadow-sm">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="size-12 rounded-full bg-indigo-50 flex items-center justify-center mb-4">
              <Mail className="size-6 text-indigo-500" />
            </div>
            <h3 className="font-medium mb-1">Aucune campagne</h3>
            <p className="text-sm text-muted-foreground max-w-xs">
              Créez votre première campagne pour rechercher des prospects sur LinkedIn.
            </p>
            <Button
              className="mt-4 bg-gradient-to-r from-indigo-500 to-purple-500 hover:opacity-90"
              onClick={() => setDialogOpen(true)}
            >
              <Plus className="size-4 mr-1.5" />
              Nouvelle campagne
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {campaigns.map((campaign) => (
            <CampaignCard
              key={campaign.id}
              campaign={campaign}
              onRun={handleRun}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      <CreateCampaignDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onCreate={handleCreate}
      />
    </div>
  );
}

"use client";

import { useState, useRef, useEffect } from "react";
import { Mail, MoreHorizontal, Play, Trash2, BarChart3, CheckCircle2, XCircle, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export interface Campaign {
  id: string;
  name: string;
  status: "draft" | "running" | "completed" | "failed";
  leads_count: number;
  credits_used: number;
  created_at: string;
  completed_at: string | null;
}

interface CampaignCardProps {
  campaign: Campaign;
  onRun?: (id: string) => void;
  onDelete?: (id: string) => void;
  onStats?: (id: string) => void;
}

function StatusIcon({ status }: { status: Campaign["status"] }) {
  switch (status) {
    case "completed":
      return <CheckCircle2 className="size-4 text-emerald-500" />;
    case "running":
      return <Clock className="size-4 text-blue-500 animate-pulse" />;
    case "failed":
      return <XCircle className="size-4 text-red-500" />;
    default:
      return <Mail className="size-4 text-muted-foreground" />;
  }
}

function timeAgo(dateStr: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return "à l&apos;instant";
  if (seconds < 3600) return `il y a ${Math.floor(seconds / 60)}min`;
  if (seconds < 86400) return `il y a ${Math.floor(seconds / 3600)}h`;
  return `il y a ${Math.floor(seconds / 86400)}j`;
}

function MiniDropdown({ onDelete }: { onDelete: () => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <Button variant="ghost" size="icon-sm" onClick={() => setOpen((v) => !v)}>
        <MoreHorizontal className="size-3.5" />
      </Button>
      {open && (
        <div className="absolute right-0 top-full mt-1 z-50 w-40 rounded-lg border bg-popover shadow-md">
          <button
            className="w-full text-left px-3 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors rounded-lg"
            onClick={() => { setOpen(false); onDelete(); }}
          >
            <Trash2 className="size-3.5 inline mr-2" />
            Supprimer
          </button>
        </div>
      )}
    </div>
  );
}

export function CampaignCard({ campaign, onRun, onDelete, onStats }: CampaignCardProps) {
  return (
    <Card className="card-leadaly border-0 shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <StatusIcon status={campaign.status} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-medium text-sm truncate">{campaign.name}</span>
                <Badge
                  variant={
                    campaign.status === "completed"
                      ? "default"
                      : campaign.status === "running"
                      ? "secondary"
                      : "outline"
                  }
                  className="text-[10px] capitalize"
                >
                  {campaign.status === "draft"
                    ? "Brouillon"
                    : campaign.status === "running"
                    ? "En cours"
                    : campaign.status === "completed"
                    ? "Terminée"
                    : "Échoué"}
                </Badge>
              </div>
              <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                <span>Créé {timeAgo(campaign.created_at)}</span>
                {campaign.leads_count > 0 && (
                  <span className="flex items-center gap-1">
                    <BarChart3 className="size-3" />
                    {campaign.leads_count} prospects
                  </span>
                )}
                {campaign.credits_used > 0 && (
                  <span>{campaign.credits_used} crédits</span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {campaign.status === "draft" && (
              <Button
                size="icon-sm"
                variant="ghost"
                className="text-emerald-600"
                onClick={() => onRun?.(campaign.id)}
              >
                <Play className="size-3.5" />
              </Button>
            )}
            {campaign.leads_count > 0 && (
              <Button
                size="icon-sm"
                variant="ghost"
                className="text-muted-foreground"
                onClick={() => onStats?.(campaign.id)}
              >
                <BarChart3 className="size-3.5" />
              </Button>
            )}
            <MiniDropdown onDelete={() => onDelete?.(campaign.id)} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

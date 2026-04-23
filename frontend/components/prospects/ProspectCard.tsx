"use client";

import { Building2, MapPin, Mail, ArrowRight, Trash2 } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

export interface Prospect {
  id: string;
  linkedin_url: string | null;
  first_name: string | null;
  last_name: string | null;
  full_name: string | null;
  title: string | null;
  company_name: string | null;
  company_size: string | null;
  industry: string | null;
  location: string | null;
  email: string | null;
  email_status: string | null;
  phone: string | null;
  seniority: string | null;
  score: number;
  tags: string[];
  raw_data: Record<string, unknown>;
  created_at: string;
}

const industryColors: Record<string, string> = {
  Tech: "bg-blue-500",
  Finance: "bg-emerald-500",
  Santé: "bg-rose-500",
  Retail: "bg-amber-500",
  default: "bg-indigo-500",
};

function getInitials(first?: string | null, last?: string | null, name?: string | null): string {
  if (first && last) return `${first[0]}${last[0]}`.toUpperCase();
  if (name) return name.split(" ").slice(0, 2).map((p) => p[0]).join("").toUpperCase();
  return "?";
}

function getIndustryColor(industry?: string | null): string {
  return industry ? (industryColors[industry] || industryColors.default) : industryColors.default;
}

function getScoreVariant(score: number): "default" | "secondary" | "destructive" {
  if (score >= 70) return "default";
  if (score >= 40) return "secondary";
  return "destructive";
}

interface ProspectCardProps {
  prospect: Prospect;
  selected?: boolean;
  onSelect?: (id: string) => void;
  onDelete?: (id: string) => void;
  onDetail?: (prospect: Prospect) => void;
  onSend?: (prospect: Prospect) => void;
}

export function ProspectCard({
  prospect,
  selected,
  onSelect,
  onDelete,
  onDetail,
  onSend,
}: ProspectCardProps) {
  const initials = getInitials(prospect.first_name, prospect.last_name, prospect.full_name);
  const color = getIndustryColor(prospect.industry);

  return (
    <div
      className={cn(
        "card-leadaly rounded-xl p-4 flex flex-col gap-3 transition-all",
        selected && "ring-2 ring-blue-500"
      )}
    >
      {/* Header */}
      <div className="flex items-start gap-3">
        <Checkbox
          checked={selected}
          onCheckedChange={() => onSelect?.(prospect.id)}
          className="mt-1"
        />
        <Avatar className="size-10 rounded-lg">
          <AvatarFallback className={cn("text-white text-sm font-semibold", color)}>
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm truncate">
            {prospect.full_name || [prospect.first_name, prospect.last_name].filter(Boolean).join(" ") || "Sans nom"}
          </p>
          <p className="text-xs text-muted-foreground truncate">{prospect.title || "—"}</p>
        </div>
        <Button
          variant="ghost"
          size="icon-sm"
          className="text-muted-foreground shrink-0"
          onClick={() => onDelete?.(prospect.id)}
        >
          <Trash2 className="size-3.5" />
        </Button>
      </div>

      {/* Email */}
      {prospect.email && (
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Mail className="size-3 shrink-0" />
          <span className="truncate">{prospect.email}</span>
        </div>
      )}

      {/* Company + location */}
      <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
        {prospect.company_name && (
          <span className="flex items-center gap-1">
            <Building2 className="size-3" />
            {prospect.company_name}
          </span>
        )}
        {prospect.location && (
          <span className="flex items-center gap-1">
            <MapPin className="size-3" />
            {prospect.location}
          </span>
        )}
      </div>

      {/* Badges */}
      <div className="flex flex-wrap gap-1.5">
        {prospect.industry && <Badge variant="secondary" className="text-[10px]">{prospect.industry}</Badge>}
        {prospect.seniority && <Badge variant="outline" className="text-[10px]">{prospect.seniority}</Badge>}
        {prospect.email_status && (
          <Badge
            variant={prospect.email_status === "valid" ? "default" : prospect.email_status === "risky" ? "secondary" : "destructive"}
            className="text-[10px]"
          >
            {prospect.email_status}
          </Badge>
        )}
        {prospect.score > 0 && (
          <Badge variant={getScoreVariant(prospect.score)} className="text-[10px]">
            Score {prospect.score}
          </Badge>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-1">
        <Button variant="outline" size="sm" className="flex-1 text-xs h-8" onClick={() => onDetail?.(prospect)}>
          Détails
        </Button>
        <Button
          size="sm"
          className="flex-1 text-xs h-8 bg-gradient-to-r from-blue-500 to-indigo-500 hover:opacity-90"
          onClick={() => onSend?.(prospect)}
        >
          Envoyer <ArrowRight className="size-3 ml-1" />
        </Button>
      </div>
    </div>
  );
}

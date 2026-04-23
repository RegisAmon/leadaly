"use client";

import { Building2, MapPin, Mail, ArrowRight, Link as LinkIcon } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Prospect } from "./ProspectCard";

interface ProspectDetailProps {
  prospect: Prospect | null;
  open: boolean;
  onClose: () => void;
  onSend?: (prospect: Prospect) => void;
}

function getInitials(first?: string | null, last?: string | null, name?: string | null): string {
  if (first && last) return `${first[0]}${last[0]}`.toUpperCase();
  if (name) return name.split(" ").slice(0, 2).map((p) => p[0]).join("").toUpperCase();
  return "?";
}

const industryColors: Record<string, string> = {
  Tech: "bg-blue-500",
  Finance: "bg-emerald-500",
  Santé: "bg-rose-500",
  Retail: "bg-amber-500",
  default: "bg-indigo-500",
};

export function ProspectDetail({ prospect, open, onClose, onSend }: ProspectDetailProps) {
  if (!prospect) return null;

  const initials = getInitials(prospect.first_name, prospect.last_name, prospect.full_name);
  const color = industryColors[prospect.industry || ""] || industryColors.default;

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader className="space-y-0 pb-4">
          <div className="flex items-start gap-3 mt-2">
            <Avatar className="size-14 rounded-xl">
              <AvatarFallback className={cn("text-white text-lg font-semibold", color)}>
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <SheetTitle className="text-base">
                {prospect.full_name || [prospect.first_name, prospect.last_name].filter(Boolean).join(" ")}
              </SheetTitle>
              <SheetDescription className="text-xs mt-0.5">
                {prospect.title || "—"}
              </SheetDescription>
              <div className="flex gap-1.5 mt-2 flex-wrap">
                {prospect.industry && (
                  <Badge variant="secondary" className="text-[10px]">{prospect.industry}</Badge>
                )}
                {prospect.seniority && (
                  <Badge variant="outline" className="text-[10px]">{prospect.seniority}</Badge>
                )}
                {prospect.score > 0 && (
                  <Badge
                    variant={prospect.score >= 70 ? "default" : prospect.score >= 40 ? "secondary" : "destructive"}
                    className="text-[10px]"
                  >
                    Score {prospect.score}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </SheetHeader>

        <div className="space-y-4 py-2">
          {/* Contact */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Contact</h4>
            {prospect.email && (
              <a href={`mailto:${prospect.email}`} className="flex items-center gap-2 text-sm hover:text-blue-600">
                <Mail className="size-4 text-muted-foreground shrink-0" />
                {prospect.email}
              </a>
            )}
            {prospect.phone && (
              <div className="flex items-center gap-2 text-sm">
                <span className="size-4 text-muted-foreground shrink-0 text-xs">📞</span>
                {prospect.phone}
              </div>
            )}
            {prospect.linkedin_url && (
              <a
                href={prospect.linkedin_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm hover:text-blue-600"
              >
                <LinkIcon className="size-4 text-muted-foreground shrink-0" />
                <span className="truncate">LinkedIn</span>
              </a>
            )}
          </div>

          <Separator />

          {/* Company */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Entreprise</h4>
            {prospect.company_name && (
              <div className="flex items-center gap-2 text-sm">
                <Building2 className="size-4 text-muted-foreground shrink-0" />
                {prospect.company_name}
              </div>
            )}
            {prospect.company_size && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="size-4 shrink-0 text-xs">🌐</span>
                {prospect.company_size} employés
              </div>
            )}
            {prospect.location && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="size-4 shrink-0" />
                {prospect.location}
              </div>
            )}
          </div>

          {/* Tags */}
          {prospect.tags?.length ? (
            <>
              <Separator />
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Tags</h4>
                <div className="flex flex-wrap gap-1.5">
                  {prospect.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-[10px]">{tag}</Badge>
                  ))}
                </div>
              </div>
            </>
          ) : null}
        </div>

        <SheetFooter className="pt-4">
          <Button
            className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:opacity-90"
            onClick={() => onSend?.(prospect)}
          >
            Envoyer un email
            <ArrowRight className="size-4 ml-2" />
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

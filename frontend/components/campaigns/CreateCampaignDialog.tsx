"use client";

import { useState } from "react";
import {
  Plus,
  RefreshCw,
  Mail,
  MoreHorizontal,
  Trash2,
  Play,
  BarChart3,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";

interface CreateCampaignDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (data: { name: string; filters: Record<string, unknown> }) => void;
}

export function CreateCampaignDialog({ open, onOpenChange, onCreate }: CreateCampaignDialogProps) {
  const [name, setName] = useState("");
  const [keywords, setKeywords] = useState("");
  const [location, setLocation] = useState("France");
  const [seniority, setSeniority] = useState("");
  const [maxResults, setMaxResults] = useState(100);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleSubmit() {
    if (!name.trim()) return;
    setIsSubmitting(true);
    onCreate({
      name: name.trim(),
      filters: {
        keywords: keywords.split(",").map((k) => k.trim()).filter(Boolean),
        location,
        seniority,
        max_results: maxResults,
      },
    });
    setIsSubmitting(false);
    setName("");
    setKeywords("");
    setLocation("France");
    setSeniority("");
    setMaxResults(100);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="size-5 text-indigo-500" />
            Nouvelle campagne
          </DialogTitle>
          <DialogDescription>
            Définissez vos critères de recherche LinkedIn. Vous pourrez lancer le scraping après création.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2 max-h-[60vh] overflow-y-auto">
          <div className="space-y-1.5">
            <Label htmlFor="name">Nom de la campagne</Label>
            <Input
              id="name"
              placeholder="Ex: SaaS France Q2 2026"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <Separator />

          <div className="space-y-1.5">
            <Label htmlFor="keywords">Mots-clés</Label>
            <Textarea
              id="keywords"
              placeholder="SaaS&#10;Sales Director&#10;Tech Startup"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              className="h-20 resize-none"
            />
            <p className="text-xs text-muted-foreground">Un mot-clé par ligne</p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="location">Localisation</Label>
            <Input
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="seniority">Niveau hiérarchique</Label>
            <select
              id="seniority"
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
              value={seniority}
              onChange={(e) => setSeniority(e.target.value)}
            >
              <option value="">Tous</option>
              <option value="C-Level">C-Level</option>
              <option value="VP">VP / Directeur</option>
              <option value="Manager">Manager</option>
              <option value="Individual">Individual Contributor</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between">
              <Label>Résultats max</Label>
              <Badge variant="secondary">{maxResults}</Badge>
            </div>
            <input
              type="range"
              min={10}
              max={500}
              step={10}
              value={maxResults}
              onChange={(e) => setMaxResults(Number(e.target.value))}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              {Math.ceil(maxResults / 10)} crédit{maxResults > 10 ? "s" : ""}估计
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Annuler</Button>
          <Button
            onClick={handleSubmit}
            disabled={!name.trim() || isSubmitting}
            className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:opacity-90"
          >
            <Plus className="size-4 mr-1.5" />
            Créer la campagne
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

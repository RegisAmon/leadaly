"use client";

import { useState } from "react";
import { RefreshCw, Zap } from "lucide-react";
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
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

interface CreateJobDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (job: {
    api_source: string;
    filters: {
      keywords: string[];
      location: string;
      industry: string;
      seniority: string;
      max_results: number;
    };
  }) => void;
}

const SENIORITY_LEVELS = [
  { value: "", label: "Tous" },
  { value: "C-Level", label: "C-Level (CEO, CTO...)" },
  { value: "VP", label: "VP / Directeur" },
  { value: "Manager", label: "Manager" },
  { value: "Individual", label: "Individual Contributor" },
];

const INDUSTRIES = [
  { value: "", label: "Tous les secteurs" },
  { value: "Tech", label: "Tech / Software" },
  { value: "Finance", label: "Finance / Banque" },
  { value: "Santé", label: "Santé / Pharma" },
  { value: "Retail", label: "Retail / E-commerce" },
  { value: "Industrie", label: "Industrie / BTP" },
  { value: "Conseil", label: "Conseil / Consulting" },
];

export function CreateJobDialog({ open, onOpenChange, onCreate }: CreateJobDialogProps) {
  const [keywords, setKeywords] = useState("");
  const [location, setLocation] = useState("France");
  const [industry, setIndustry] = useState("");
  const [seniority, setSeniority] = useState("");
  const [maxResults, setMaxResults] = useState(100);
  const [apiSource, setApiSource] = useState<"apify" | "linkdapi">("apify");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleSubmit() {
    if (!keywords.trim()) return;

    setIsSubmitting(true);
    onCreate({
      api_source: apiSource,
      filters: {
        keywords: keywords.split(",").map((k) => k.trim()).filter(Boolean),
        location,
        industry,
        seniority,
        max_results: maxResults,
      },
    });
    setIsSubmitting(false);
    onOpenChange(false);
  }

  const keywordList = keywords
    .split(",")
    .map((k) => k.trim())
    .filter(Boolean);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RefreshCw className="size-5 text-blue-500" />
            Nouveau job LinkedIn
          </DialogTitle>
          <DialogDescription>
            Configurez votre recherche LinkedIn Sales Navigator. Les résultats apparaîtront dans vos prospects.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2 max-h-[60vh] overflow-y-auto">
          {/* Keywords */}
          <div className="space-y-1.5">
            <Label htmlFor="keywords">Mots-clés de recherche</Label>
            <Input
              id="keywords"
              placeholder="SaaS, Sales Director, B2B..."
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Séparés par des virgules. Ex: &ldquo;Sales Manager&rdquo;, &ldquo;Tech Startup&rdquo;, &ldquo;Paris&rdquo;
            </p>
            {keywordList.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {keywordList.map((kw) => (
                  <Badge key={kw} variant="secondary" className="text-[10px]">{kw}</Badge>
                ))}
              </div>
            )}
          </div>

          {/* Location */}
          <div className="space-y-1.5">
            <Label htmlFor="location">Localisation</Label>
            <Input
              id="location"
              placeholder="France, Paris, Europe..."
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>

          {/* Industry + seniority row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="industry">Secteur</Label>
              <select
                id="industry"
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
              >
                {INDUSTRIES.map((ind) => (
                  <option key={ind.value} value={ind.value}>{ind.label}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="seniority">Niveau hiérarchique</Label>
              <select
                id="seniority"
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
                value={seniority}
                onChange={(e) => setSeniority(e.target.value)}
              >
                {SENIORITY_LEVELS.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
          </div>

          <Separator />

          {/* Max results */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label>Nombre de résultats max</Label>
              <Badge variant="secondary">{maxResults}</Badge>
            </div>
            <Slider
              value={[maxResults]}
              onValueChange={(val) => setMaxResults(Number(Array.isArray(val) ? val[0] : val))}
              min={10}
              max={500}
              step={10}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              1 crédit par lot de 10 résultats. Plus vous demandez, plus ça coûte de crédits.
            </p>
          </div>

          {/* API source */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <Label>Source de scraping</Label>
                <p className="text-xs text-muted-foreground">API utilisée pour extraire les profils</p>
              </div>
              <div className="flex gap-2">
                <Badge
                  variant={apiSource === "apify" ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => setApiSource("apify")}
                >
                  Apify
                </Badge>
                <Badge
                  variant={apiSource === "linkdapi" ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => setApiSource("linkdapi")}
                >
                  LinkdAPI
                </Badge>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!keywords.trim() || isSubmitting}
            className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:opacity-90"
          >
            <Zap className="size-4 mr-1.5" />
            Lancer le scraping
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

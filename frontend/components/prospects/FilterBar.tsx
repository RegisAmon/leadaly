"use client";

import { useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

export type FilterTab = "all" | "new" | "contacted" | "qualified";

interface FilterBarProps {
  tab: FilterTab;
  onTabChange: (tab: FilterTab) => void;
  search: string;
  onSearchChange: (v: string) => void;
  minScore: number;
  onMinScoreChange: (v: number) => void;
  industry: string;
  onIndustryChange: (v: string) => void;
}

const INDUSTRIES = ["Tous", "Tech", "Finance", "Santé", "Retail", "Industrie"];

export function FilterBar({
  tab,
  onTabChange,
  search,
  onSearchChange,
  minScore,
  onMinScoreChange,
  industry,
  onIndustryChange,
}: FilterBarProps) {
  return (
    <div className="card-leadaly rounded-xl p-4 space-y-3">
      {/* Tabs + search row */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Tabs
          value={tab}
          onValueChange={(v) => onTabChange(v as FilterTab)}
          className="flex-1"
        >
          <TabsList className="w-full justify-start overflow-auto">
            <TabsTrigger value="all">Tous</TabsTrigger>
            <TabsTrigger value="new">Nouveaux</TabsTrigger>
            <TabsTrigger value="contacted">Contactés</TabsTrigger>
            <TabsTrigger value="qualified">Qualifiés</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
          <Input
            placeholder="Rechercher..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-8 h-9"
          />
        </div>
      </div>

      <Separator />

      {/* Filters row */}
      <div className="flex flex-wrap gap-2 items-center">
        <SlidersHorizontal className="size-3.5 text-muted-foreground shrink-0" />

        <Select value={industry} onValueChange={(v) => { if (v !== null) onIndustryChange(v); }}>
          <SelectTrigger className="h-8 w-36 text-xs">
            <SelectValue placeholder="Secteur" />
          </SelectTrigger>
          <SelectContent>
            {INDUSTRIES.map((ind) => (
              <SelectItem key={ind} value={ind === "Tous" ? "" : ind}>
                {ind}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={String(minScore)}
          onValueChange={(v) => onMinScoreChange(Number(v))}
        >
          <SelectTrigger className="h-8 w-32 text-xs">
            <SelectValue placeholder="Score min" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="0">Tous</SelectItem>
            <SelectItem value="40">40+</SelectItem>
            <SelectItem value="60">60+</SelectItem>
            <SelectItem value="80">80+</SelectItem>
          </SelectContent>
        </Select>

        {/* Active filters as badges */}
        {(minScore > 0 || industry) && (
          <div className="flex gap-1.5 ml-auto">
            {minScore > 0 && (
              <Badge
                variant="secondary"
                className="text-[10px] h-5 cursor-pointer"
                onClick={() => onMinScoreChange(0)}
              >
                Score {minScore}+ ✕
              </Badge>
            )}
            {industry && (
              <Badge
                variant="secondary"
                className="text-[10px] h-5 cursor-pointer"
                onClick={() => onIndustryChange("")}
              >
                {industry} ✕
              </Badge>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

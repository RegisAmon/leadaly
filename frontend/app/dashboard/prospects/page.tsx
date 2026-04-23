"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import api, { injectToken } from "@/lib/api";
import { FilterBar, type FilterTab } from "@/components/prospects/FilterBar";
import { ProspectGrid } from "@/components/prospects/ProspectGrid";
import type { Prospect } from "@/components/prospects/ProspectCard";

function emptyProspect(raw_data: Record<string, unknown> = {}): Prospect {
  return {
    id: "",
    linkedin_url: null,
    first_name: null,
    last_name: null,
    full_name: null,
    title: null,
    company_name: null,
    company_size: null,
    industry: null,
    location: null,
    email: null,
    email_status: null,
    phone: null,
    seniority: null,
    score: 0,
    tags: [],
    raw_data,
    created_at: "",
  };
}

// Mock data for development — replace with real API when backend is ready
const MOCK_PROSPECTS: Prospect[] = [
  {
    ...emptyProspect(),
    id: "1",
    first_name: "Marie",
    last_name: "Dupont",
    full_name: "Marie Dupont",
    title: "Head of Sales",
    company_name: "TechCorp",
    company_size: "51-200",
    industry: "Tech",
    location: "Paris, France",
    email: "marie.dupont@techcorp.com",
    email_status: "valid",
    seniority: "C-Level",
    score: 85,
    tags: ["VIP", "SaaS"],
    created_at: new Date().toISOString(),
  },
  {
    ...emptyProspect(),
    id: "2",
    first_name: "Jean",
    last_name: "Martin",
    full_name: "Jean Martin",
    title: "VP Engineering",
    company_name: "StartupXYZ",
    company_size: "11-50",
    industry: "Tech",
    location: "Lyon, France",
    email: "jmartin@startupxyz.io",
    email_status: "risky",
    seniority: "VP",
    score: 62,
    tags: ["technique"],
    created_at: new Date().toISOString(),
  },
  {
    ...emptyProspect(),
    id: "3",
    first_name: "Sophie",
    last_name: "Bernard",
    full_name: "Sophie Bernard",
    title: "Directrice Marketing",
    company_name: "FinancePlus",
    company_size: "201-500",
    industry: "Finance",
    location: "Bruxelles, Belgique",
    email: null,
    seniority: "Director",
    score: 45,
    tags: [],
    created_at: new Date().toISOString(),
  },
];

export default function ProspectsPage() {
  const [tab, setTab] = useState<FilterTab>("all");
  const [search, setSearch] = useState("");
  const [minScore, setMinScore] = useState(0);
  const [industry, setIndustry] = useState("");

  // Use mock data for now — switch to real API when backend is ready
  // const { data: prospects, isLoading } = useQuery({
  //   queryKey: ["/api/leads"],
  //   queryFn: () => api.get<Prospect[]>("/leads").then(r => r.data),
  // });

  const prospects = MOCK_PROSPECTS;
  const isLoading = false;

  // Filter locally
  const filtered = prospects.filter((p) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      [p.first_name, p.last_name, p.full_name, p.company_name, p.email]
        .filter(Boolean)
        .some((v) => v?.toLowerCase().includes(q));
    const matchScore = p.score >= minScore;
    const matchIndustry = !industry || p.industry === industry;
    const matchTab =
      tab === "all" ||
      (tab === "new" && !p.tags?.length) ||
      (tab === "contacted" && p.tags?.includes("contacted")) ||
      (tab === "qualified" && p.score >= 60);
    return matchSearch && matchScore && matchIndustry && matchTab;
  });

  function handleSend(prospect: Prospect) {
    // TODO: open compose modal
    console.log("Send email to", prospect.email);
  }

  function handleDelete(id: string) {
    // TODO: call DELETE /api/leads/{id}
    console.log("Delete", id);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Prospects</h1>
          <p className="text-sm text-muted-foreground">
            {filtered.length} prospect{filtered.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Button size="sm" className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:opacity-90">
          <Plus className="size-4 mr-1.5" />
          Nouvelle campagne
        </Button>
      </div>

      <FilterBar
        tab={tab}
        onTabChange={setTab}
        search={search}
        onSearchChange={setSearch}
        minScore={minScore}
        onMinScoreChange={setMinScore}
        industry={industry}
        onIndustryChange={setIndustry}
      />

      <ProspectGrid
        prospects={filtered}
        loading={isLoading}
        onDelete={handleDelete}
        onSend={handleSend}
      />
    </div>
  );
}

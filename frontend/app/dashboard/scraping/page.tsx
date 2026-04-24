"use client";

import { useState } from "react";
import { RefreshCw, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { JobList, type ScrapingJob } from "@/components/scraping/JobList";
import { CreateJobDialog } from "@/components/scraping/CreateJobDialog";

// Mock data — replace with real API when backend is ready
const MOCK_JOBS: ScrapingJob[] = [
  {
    id: "1",
    status: "completed",
    api_source: "apify",
    total_results: 47,
    new_leads: 31,
    duplicate_leads: 16,
    error_message: null,
    started_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    completed_at: new Date(Date.now() - 3600000).toISOString(),
    created_at: new Date(Date.now() - 3600000 * 3).toISOString(),
  },
  {
    id: "2",
    status: "running",
    api_source: "apify",
    total_results: 0,
    new_leads: 0,
    duplicate_leads: 0,
    error_message: null,
    started_at: new Date(Date.now() - 300000).toISOString(),
    completed_at: null,
    created_at: new Date(Date.now() - 400000).toISOString(),
  },
];

export default function ScrapingPage() {
  const [jobs, setJobs] = useState<ScrapingJob[]>(MOCK_JOBS);
  const [loading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  function handleCreateJob(payload: {
    api_source: string;
    filters: {
      keywords: string[];
      location: string;
      industry: string;
      seniority: string;
      max_results: number;
    };
  }) {
    const newJob: ScrapingJob = {
      id: `job-${Date.now()}`,
      status: "running",
      api_source: payload.api_source,
      total_results: 0,
      new_leads: 0,
      duplicate_leads: 0,
      error_message: null,
      started_at: new Date().toISOString(),
      completed_at: null,
      created_at: new Date().toISOString(),
    };
    setJobs((prev) => [newJob, ...prev]);
    // TODO: call POST /api/jobs with payload.filters
    console.log("Create job:", payload);
  }

  function handleCancelJob(jobId: string) {
    setJobs((prev) =>
      prev.map((j) =>
        j.id === jobId ? { ...j, status: "cancelled" as const } : j
      )
    );
    // TODO: call POST /api/jobs/{jobId}/cancel
    console.log("Cancel job:", jobId);
  }

  const runningJobs = jobs.filter((j) => j.status === "running" || j.status === "pending");

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold flex items-center gap-2">
            <RefreshCw className="size-5 text-blue-500" />
            Scraping LinkedIn
          </h1>
          <p className="text-sm text-muted-foreground">
            Lancez des campagnes sur LinkedIn Sales Navigator pour trouver des prospects B2B.
          </p>
        </div>
        <Button
          size="sm"
          className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:opacity-90"
          onClick={() => setDialogOpen(true)}
        >
          <Zap className="size-4 mr-1.5" />
          Nouveau job
        </Button>
      </div>

      {/* Active jobs notice */}
      {runningJobs.length > 0 && (
        <div className="rounded-xl bg-blue-50 border border-blue-100 p-3 flex items-center gap-3">
          <RefreshCw className="size-4 text-blue-500 animate-spin shrink-0" />
          <p className="text-sm text-blue-700">
            {runningJobs.length} job{runningJobs.length > 1 ? "s" : ""} en cours d&apos;exécution. Les prospects seront ajoutés automatiquement.
          </p>
        </div>
      )}

      {/* Jobs list */}
      <JobList jobs={jobs} loading={loading} onCancel={handleCancelJob} />

      {/* Create job dialog */}
      <CreateJobDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onCreate={handleCreateJob}
      />
    </div>
  );
}

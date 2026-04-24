"use client";

import { useState } from "react";
import { RefreshCw, CheckCircle2, Clock, AlertCircle, XCircle, Ban, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export interface ScrapingJob {
  id: string;
  status: "pending" | "running" | "completed" | "failed" | "cancelled";
  api_source: string;
  total_results: number;
  new_leads: number;
  duplicate_leads: number;
  error_message: string | null;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
}

function JobStatusIcon({ status }: { status: ScrapingJob["status"] }) {
  switch (status) {
    case "completed":
      return <CheckCircle2 className="size-4 text-emerald-500" />;
    case "running":
      return <Loader2 className="size-4 text-blue-500 animate-spin" />;
    case "pending":
      return <Clock className="size-4 text-amber-500" />;
    case "failed":
      return <XCircle className="size-4 text-red-500" />;
    case "cancelled":
      return <Ban className="size-4 text-muted-foreground" />;
  }
}

function timeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (seconds < 60) return "à l'instant";
  if (seconds < 3600) return `il y a ${Math.floor(seconds / 60)}min`;
  if (seconds < 86400) return `il y a ${Math.floor(seconds / 3600)}h`;
  return `il y a ${Math.floor(seconds / 86400)}j`;
}

interface JobCardProps {
  job: ScrapingJob;
  onCancel?: (id: string) => void;
}

function JobCard({ job, onCancel }: JobCardProps) {
  return (
    <Card className="card-leadaly border-0 shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <JobStatusIcon status={job.status} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-medium capitalize">
                  {job.api_source === "apify" ? "Apify" : "LinkdAPI"}
                </span>
                <Badge variant="outline" className="text-[10px] capitalize">
                  {job.status}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {timeAgo(job.started_at || job.created_at)}
              </p>
            </div>
          </div>

          {job.status === "running" || job.status === "pending" ? (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs h-7 text-muted-foreground"
              onClick={() => onCancel?.(job.id)}
            >
              Annuler
            </Button>
          ) : null}
        </div>

        {/* Progress for running jobs */}
        {job.status === "running" && (
          <div className="mt-3">
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>Analyse en cours...</span>
            </div>
            <Progress className="h-1.5" />
          </div>
        )}

        {/* Results for completed jobs */}
        {job.status === "completed" && (
          <div className="mt-3 flex gap-4 text-xs">
            <div>
              <span className="font-semibold text-emerald-600">{job.new_leads}</span>
              <span className="text-muted-foreground ml-1">nouveaux</span>
            </div>
            <div>
              <span className="font-semibold text-amber-600">{job.duplicate_leads}</span>
              <span className="text-muted-foreground ml-1">doublons</span>
            </div>
            <div>
              <span className="font-semibold">{job.total_results}</span>
              <span className="text-muted-foreground ml-1">total</span>
            </div>
          </div>
        )}

        {/* Error */}
        {job.status === "failed" && job.error_message && (
          <p className="mt-2 text-xs text-red-500 flex items-start gap-1">
            <AlertCircle className="size-3 mt-0.5 shrink-0" />
            {job.error_message.slice(0, 100)}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

interface JobListProps {
  jobs: ScrapingJob[];
  loading?: boolean;
  onCancel?: (id: string) => void;
}

export function JobList({ jobs, loading, onCancel }: JobListProps) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="card-leadaly border-0 shadow-sm">
            <CardContent className="p-4 flex gap-3">
              <Skeleton className="size-4 rounded" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-2 w-16" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!jobs.length) {
    return (
      <Card className="card-leadaly border-0 shadow-sm">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <RefreshCw className="size-8 text-muted-foreground mb-3" />
          <p className="font-medium mb-1">Aucun job de scraping</p>
          <p className="text-sm text-muted-foreground max-w-xs">
            Lancez votre première campagne LinkedIn pour commencer à trouver des prospects.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {jobs.map((job) => (
        <JobCard key={job.id} job={job} onCancel={onCancel} />
      ))}
    </div>
  );
}

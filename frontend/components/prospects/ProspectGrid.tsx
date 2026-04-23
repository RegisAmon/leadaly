"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProspectCard, type Prospect } from "./ProspectCard";
import { ProspectDetail } from "./ProspectDetail";
import { Skeleton } from "@/components/ui/skeleton";

interface ProspectGridProps {
  prospects: Prospect[];
  loading?: boolean;
  onDelete?: (id: string) => void;
  onSend?: (prospect: Prospect) => void;
}

function SkeletonCard() {
  return (
    <div className="card-leadaly rounded-xl p-4 space-y-3">
      <div className="flex items-start gap-3">
        <Skeleton className="size-4 mt-1" />
        <Skeleton className="size-10 rounded-lg" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-3 w-3/4" />
          <Skeleton className="h-2.5 w-1/2" />
        </div>
        <Skeleton className="size-7 rounded" />
      </div>
      <Skeleton className="h-3 w-full" />
      <div className="flex gap-2">
        <Skeleton className="h-5 w-16" />
        <Skeleton className="h-5 w-20" />
      </div>
      <div className="flex gap-2 pt-1">
        <Skeleton className="h-8 flex-1 rounded-lg" />
        <Skeleton className="h-8 flex-1 rounded-lg" />
      </div>
    </div>
  );
}

export function ProspectGrid({ prospects, loading, onDelete, onSend }: ProspectGridProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [detailProspect, setDetailProspect] = useState<Prospect | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function openDetail(prospect: Prospect) {
    setDetailProspect(prospect);
    setDetailOpen(true);
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (!prospects.length) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="size-14 rounded-full bg-blue-50 flex items-center justify-center mb-4">
          <span className="text-3xl">🎯</span>
        </div>
        <h3 className="font-medium mb-1">Aucun prospect trouvé</h3>
        <p className="text-sm text-muted-foreground max-w-xs">
          Lancez votre première campagne de scraping LinkedIn pour commencer à collecter des prospects.
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Bulk actions bar */}
      {selectedIds.size > 0 && (
        <div className="card-leadaly rounded-xl p-3 flex items-center gap-3">
          <span className="text-sm font-medium">{selectedIds.size} sélectionné(s)</span>
          <div className="flex gap-2 ml-auto">
            <Button variant="outline" size="sm" className="text-xs h-8">
              Exporter CSV
            </Button>
            <Button variant="outline" size="sm" className="text-xs h-8 text-destructive hover:text-destructive" onClick={() => {
              selectedIds.forEach((id) => onDelete?.(id));
              setSelectedIds(new Set());
            }}>
              <Trash2 className="size-3.5 mr-1.5" />
              Supprimer
            </Button>
          </div>
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {prospects.map((prospect) => (
          <ProspectCard
            key={prospect.id}
            prospect={prospect}
            selected={selectedIds.has(prospect.id)}
            onSelect={toggleSelect}
            onDelete={onDelete}
            onDetail={openDetail}
            onSend={onSend}
          />
        ))}
      </div>

      {/* Detail sheet */}
      <ProspectDetail
        prospect={detailProspect}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        onSend={(p) => {
          setDetailOpen(false);
          onSend?.(p);
        }}
      />
    </>
  );
}

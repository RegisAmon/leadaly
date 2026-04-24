"use client";

import { useState } from "react";
import { Send, Loader2, Wand2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { Prospect } from "@/components/prospects/ProspectCard";

interface ComposeEmailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prospect: Prospect | null;
  campaignName?: string;
}

export function ComposeEmailDialog({ open, onOpenChange, prospect, campaignName = "Ma campagne" }: ComposeEmailDialogProps) {
  const [generating, setGenerating] = useState(false);
  const [sending, setSending] = useState(false);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [generated, setGenerated] = useState(false);

  function handleClose() {
    setSubject("");
    setBody("");
    setGenerated(false);
    onOpenChange(false);
  }

  async function handleGenerate() {
    if (!prospect) return;
    setGenerating(true);

    // Simulate AI generation delay
    await new Promise((r) => setTimeout(r, 1200));

    const name = prospect.full_name || [prospect.first_name, prospect.last_name].filter(Boolean).join(" ") || "Bonjour";
    const company = prospect.company_name || "";
    const title = prospect.title || "";

    setSubject(`Conversation à propos de ${campaignName}`);
    setBody(
      `${name},\n\n` +
      `J'ai vu que vous êtes ${title}${company ? ` chez ${company}` : ""} et je voulais vous contacter au sujet de notre solution.\n\n` +
      `Seriez-vous disponible pour un échange de 15 minutes cette semaine ?\n\n` +
      `Cordialement,\n` +
      `[Votre nom]`
    );
    setGenerated(true);
    setGenerating(false);
  }

  async function handleSend() {
    if (!subject.trim() || !body.trim()) return;
    setSending(true);
    await new Promise((r) => setTimeout(r, 800));
    console.log("Send email:", { to: prospect?.email, subject, body });
    setSending(false);
    handleClose();
  }

  const name = prospect
    ? prospect.full_name || [prospect.first_name, prospect.last_name].filter(Boolean).join(" ") || "?"
    : "?";

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="size-5 text-indigo-500" />
            Nouvel email
          </DialogTitle>
          <DialogDescription>
            Envoi à{" "}
            <Badge variant="secondary" className="ml-1">
              {prospect?.email || "—"}{" "}
              {prospect && <span className="text-muted-foreground">({name})</span>}
            </Badge>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="subject">Objet</Label>
            <Input
              id="subject"
              placeholder="Objet du mail..."
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="body">Contenu</Label>
              {!generated && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs h-7 text-indigo-600"
                  onClick={handleGenerate}
                  disabled={generating}
                >
                  {generating ? (
                    <Loader2 className="size-3.5 mr-1 animate-spin" />
                  ) : (
                    <Wand2 className="size-3.5 mr-1" />
                  )}
                  Générer avec IA
                </Button>
              )}
            </div>
            <Textarea
              id="body"
              placeholder="Rédigez votre email..."
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="min-h-[200px] resize-none"
            />
            <p className="text-xs text-muted-foreground">
              {body.split(/\s/).filter(Boolean).length} mots
            </p>
          </div>

          <Separator />

          <div className="rounded-lg bg-muted/30 p-3 text-xs text-muted-foreground">
            <strong>Prospect:</strong> {name}
            {prospect?.title && ` — ${prospect.title}`}
            {prospect?.company_name && ` chez ${prospect.company_name}`}
            {prospect?.industry && ` (${prospect.industry})`}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Annuler
          </Button>
          <Button
            onClick={handleSend}
            disabled={!subject.trim() || !body.trim() || sending}
            className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:opacity-90"
          >
            {sending ? <Loader2 className="size-4 mr-1.5 animate-spin" /> : <Send className="size-4 mr-1.5" />}
            Envoyer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

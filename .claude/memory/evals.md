---
schema: evals.md
description: Évaluations des prompts, workflows, outputs — what worked, what didn't
columns: [id, date, output, méthode, anomalies, action]
---

## Index

| ID | Date | Output | Action |
|----|------|--------|--------|
| EVAL-001 | 2026-04-23 | Système mémoire agent 5 registres | Keep |
| EVAL-002 | 2026-04-23 | Protocole session closing — workflow rituel | Keep |

---

## EVAL-001 — 2026-04-23

**Output :** Système mémoire agent 5 registres (decisions, learnings, blockers, journal, evals) adapté pour contexte multi-projets.

**Méthode :** Pattern découvert dans ~/projects/motionaly-v2/.claude/memory/. Régle : au début de chaque session lire les 5 registres, en fin de session mettre à jour selon ce qui a changé.

**Anomalies :** Aucune — le pattern est stable et reproductible.

**Action :** Keep — Dupliquer sur tous les projets.

---

## EVAL-002 — 2026-04-23

**Output :** Workflow rituel de fermeture de session : vérifier git commit fait, mettre à jour les 5 registres (decisions, learnings, blockers, journal, evals), puis écrire /home/archie/obsidian/memory/hermes-sessions/YYYY-MM-DD.md.

**Méthode :** Système appris de Reggie. Séparer le rituel de fermeture du code project lui-même — la session memory va dans Obsidian vault.

**Anomalies :** None.

**Action :** Keep — À appliquer sur TOUTES les sessions.

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
| EVAL-003 | 2026-04-24 | Test local Leadaly — Backend ✅, Clerk bloque /dashboard (clé vide), sign-in/up marchent après config | Keep |

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

## EVAL-003 — 2026-04-24

**Output :** Test local Leadaly — Backend FastAPI (port 8000) ✅, Frontend Next.js (port 3000) ✅. Clerk redirige vers sign-in tant que `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` vide. Après config : sign-in "Sign in to Leadaly" ✅, sign-up "Create your account" ✅, Development mode visible.

**Méthode :** Lancement servers en background, curl health checks, browser navigation, browser_snapshot pour extraire le DOM.

**Anomalies :** Clerk bloque /dashboard/* sans session. browser_vision ne parvient pas à analyser les screenshots (les fichiers existent mais le tool ne lit pas les images locales). browser_snapshot textuel fonctionne parfaitement.

**Action :** Keep — le workflow de test local est bon. Pour les screenshots visuels, utiliser une autre méthode (envoyer le fichier par un canal qui supporte les images).

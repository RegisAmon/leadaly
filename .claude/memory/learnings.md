---
schema: learnings.md
description: Patterns observés, erreurs fréquentes, bonnes pratiques spécifiques au projet
columns: [id, date, pattern, contexte, application]
---

## Index

| ID | Date | Pattern | Contexte |
|----|------|---------|----------|
| LRN-001 | 2026-04-23 | Système mémoire agent multi-projets | Infrastructure agent |
| LRN-002 | 2026-04-23 | FastAPI async everywhere | Backend Leadaly |
| LRN-003 | 2026-04-23 | Credit system double-check | Billing Leadaly |

---

## LRN-001 — 2026-04-23

**Pattern :** Système mémoire agent multi-projets

**Contexte :** Chaque projet (~/projects/X, ~/workspaces/X) a son propre `.claude/memory/` avec 5 registres. Au début de chaque session : lire les 5 registres. En fin de session : mettre à jour les registres concernés + écrire session entry dans Obsidian vault.

**Application future :** Toujours lire `.claude/memory/` en début de session sur n'importe quel projet. Le registre `blockers.md` est particulièrement important pour ne pas re-rentrer dans des frictions déjà résolues.

---

## LRN-002 — 2026-04-23

**Pattern :** FastAPI async everywhere

**Contexte :** Le backend Leadaly utilise FastAPI avec SQLAlchemy async + asyncpg, httpx.AsyncClient pour les appels API externes, Celery async tasks. Règle : chaque endpoint, service, et tâche Celery doit être `async def`.

**Application future :** Ne jamais mélanger `def` et `async def` dans les routes FastAPI sans bonne raison. Si une fonction appelle une API externe ou une DB, elle doit être async.

---

## LRN-003 — 2026-04-23

**Pattern :** Credit system double-check

**Contexte :** Dans Leadaly, les crédits sont vérifiés ET réservés avant chaque opération de scraping. Le check se fait en DB (source of truth) ET en Redis (cache rapide pour éviter les race conditions). Si un job échoue après réservation, les crédits sont remboursés.

**Application future :** Toujours implémenter le pattern check → reserve → execute → confirm OR rollback. Jamais décrémenter les crédits avant d'avoir confirmé que l'opération est réussie.

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
| LRN-004 | 2026-04-23 | shadcn/base-ui — pas de `asChild`, utiliser `render` prop | Frontend Leadaly |
| LRN-005 | 2026-04-23 | Tailwind v4 = config CSS only, `@theme inline` dans globals.css | Frontend Leadaly |
| LRN-006 | 2026-04-23 | libsql Row.asdict() pas Row.columns | Backend Turso |

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

---

## LRN-004 — 2026-04-23

**Pattern :** shadcn/base-ui — pas de `asChild`

**Contexte :** Ce projet utilise shadcn avec `base-ui` (pas Radix). DropdownMenuTrigger n'accepte pas `asChild`. Il faut passer les classes directement sur le trigger.

**Application :** Pour DropdownMenuTrigger → passer `className` directement sur le composant trigger au lieu de `asChild`. Vérifier `components.json` pour savoir si c'est `base` ou `radix`.

---

## LRN-005 — 2026-04-23

**Pattern :** Tailwind v4 = config CSS only

**Contexte :** Ce projet utilise Tailwind v4 avec config dans globals.css (pas de tailwind.config.js). Les tokens personnalisés sont définis dans `@theme inline {}`. Ajouter des styles custom Leadaly (gradient bg, glassmorphism) directement dans globals.css.

**Application :** Ajouter des tokens Leadaly dans globals.css avec `@theme inline {}`. Ne pas chercher tailwind.config.js. Les classes utilitaires personnalisées (.card-leadaly, .btn-leadaly-gradient) vont aussi dans globals.css.

---

## LRN-006 — 2026-04-23

**Pattern :** libsql Row.asdict() pas Row.columns

**Contexte :** Turso libsql-client retourne des `Row` avec méthode `.asdict()`. `.columns` n'existe pas. `execute()` prend les params en liste (pas de mapping named).

**Application :** `row.asdict()` pour convertir les résultats libsql. `await db.execute(sql, [param1, param2])` — params en liste, pas dict.

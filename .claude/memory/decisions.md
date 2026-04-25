---
schema: decisions.md
description: Registre des décisions Architecturales et produit
columns: [id, date, titre, décision, pourquoi, alternatives, statut]
---

## Index

| ID | Date | Titre | Statut |
|----|------|-------|--------|
| BDR-001 | 2026-04-23 | Stack Leadaly — Next.js 14 + FastAPI + Turso (libSQL) + Redis | Ouvert |
| BDR-002 | 2026-04-23 | Turso取代Supabase comme DB provider | Validé |
| BDR-003 | 2026-04-24 | Pattern Slider + Progress base-ui dans shadcn | Ouvert |

---

## BDR-001 — 2026-04-23

**Titre :** Stack technique — Next.js 14 + FastAPI + Turso (libSQL) + Redis

**Décision :** Leadaly utilise Next.js 14 (App Router) côté frontend et FastAPI (Python async) côté backend, avec **Turso** (libSQL/SQLite distribué async), Redis (Upstash) pour cache + Celery queue, Apify/LinkdAPI pour scraping LinkedIn, Hunter.io pour enrichissement email, Claude Sonnet pour génération email IA, Stripe pour billing crédits, Resend pour emails transactionnels.

**Pourquoi :** Stack validée avec Reggie. Vercel pour frontend, Ubuntu droplet existant + Turso pour backend DB. Choix motivé par : async natif FastAPI parfait pour jobs scraping, Next.js 14 App Router pour SSR/perfs, libsql-client async pour perf DB, Celery+Redis pour queue jobs, Turso pour SQLite distribué managed.

**Alternatives considérées :**
- Next.js standalone (sans backend FastAPI) : rejeté — trop de logique métier async (scraping, enrichissement, Celery) à mettre dans des serverless functions, pas adapté
- Django : rejeté — async possible mais FastAPI plus léger et mieux adapté aux APIs microservices
- Supabase BaaS complet (sans backend FastAPI) : rejeté — scraping LinkedIn et jobs Celery ne rentrent pas dans le modèle serverless

**Statut :** Validé — SESSION 1.2 terminée

---

## BDR-002 — 2026-04-23

**Titre :** Turso取代Supabase comme provider DB

**Décision :** Reggie a fourni https://turso.tech comme provider DB. Turso = libSQL (SQLite distribué), pas PostgreSQL. Utilise `libsql-client` Python async (`create_client()`) avec URL `libsql://database-name.turso.io` + `TURSO_AUTH_TOKEN`. Développement local : `file:local.db` (SQLite).

**Pourquoi :** Choix de Reggie. Turso est plus léger, fonctionne en local comme en cloud avec le même protocole. SQLite natif en développement.

**Implémentation :**
- Package Python : `libsql-client` (async)
- Pas de dialecte SQLAlchemy natif — wrapper Database{} custom dans `app/core/database.py`
- URL format prod: `libsql://[database].turso.io` avec auth token
- Fallback local: `file:local.db`

**Statut :** Validé — SESSION 1.3 (DB schema)

## BDR-003 — 2026-04-24

**Titre :** Pattern Slider + Progress base-ui dans shadcn Leadaly

**Décision :** Les composants shadcn `Slider` et `Progress` wrappent des primitives base-ui. Le `Slider` passe `number | readonly number[]` à `onValueChange` (même pour un seul value). Toujours utiliser `Array.isArray(val) ? val[0] : val`. Pour `Progress`, le wrapper doit convertir `undefined`/`null` en `number | null` avant de passer à `ProgressPrimitive.Root` : `typeof value === 'number' ? value : null`.

**Pourquoi :** TypeScript strict mode dans Next.js 15 refuse les types incompatibles. base-ui utilise des unions plus larges que shadcn.

**Alternatives considérées :**
- `@ts-ignore` : refusé — pollue le typage
- Caster en `any` : refusé — perd la sécurité

**Statut :** Ouvert

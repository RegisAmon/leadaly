---
schema: decisions.md
description: Registre des décisions Architecturales et produit
columns: [id, date, titre, décision, pourquoi, alternatives, statut]
---

## Index

| ID | Date | Titre | Statut |
|----|------|-------|--------|
| BDR-001 | 2026-04-23 | Stack Leadaly — Next.js 14 + FastAPI + PostgreSQL + Redis | Ouvert |

---

## BDR-001 — 2026-04-23

**Titre :** Stack technique — Next.js 14 + FastAPI + PostgreSQL + Redis

**Décision :** Leadaly utilise Next.js 14 (App Router) côté frontend et FastAPI (Python async) côté backend, avec **Supabase** (PostgreSQL async via `postgresql+asyncpg`), Redis (Upstash) pour cache + Celery queue, Apify/LinkdAPI pour scraping LinkedIn, Hunter.io pour enrichissement email, Claude Sonnet pour génération email IA, Stripe pour billing crédits, Resend pour emails transactionnels.

**Pourquoi :** Stack validée avec Reggie. Vercel pour frontend, Ubuntu droplet existant + Supabase pour backend DB. Choix motivé par : async natif FastAPI parfait pour jobs scraping, Next.js 14 App Router pour SSR/perfs, SQLAlchemy async + asyncpg pour perf DB, Celery+Redis pour queue jobs, Supabase pour PostgreSQL managed.

**Alternatives considérées :**
- Next.js standalone (sans backend FastAPI) : rejeté — trop de logique métier async (scraping, enrichissement, Celery) à mettre dans des serverless functions, pas adapté
- Django : rejeté — async possible mais FastAPI plus léger et mieux adapté aux APIs microservices
- Supabase BaaS complet (sans backend FastAPI) : rejeté — scraping LinkedIn et jobs Celery ne rentrent pas dans le modèle serverless

**Statut :** Validé — en cours d'implémentation (SESSION 1.1)

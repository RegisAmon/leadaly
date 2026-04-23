# CLAUDE.md — Leadaly Project Bible
> Lis ce fichier intégralement avant chaque session de code. C'est la source de vérité absolue du projet.

---

## 🎯 Projet

**Nom :** Leadaly  
**Type :** SaaS B2B multi-tenant — génération de leads LinkedIn avec enrichissement IA et outreach email personnalisé  
**Stack :** Next.js 14 (App Router) + FastAPI Python + PostgreSQL + Redis + Apify + Claude API + Stripe + Resend  
**Déploiement :** Vercel (frontend) + Ubuntu droplet existant (backend FastAPI)

---

## 📁 Structure workspace

```
~/workspace/leadaly/
├── CLAUDE.md              ← CE FICHIER — lire en premier
├── SESSIONS.md            ← Roadmap par sessions de code
├── SPEC.md                ← Spec technique complète
├── frontend/              ← Next.js 14 app
│   ├── app/               ← App Router
│   ├── components/
│   └── lib/
└── backend/               ← FastAPI
    ├── app/
    ├── routers/
    ├── services/
    ├── models/
    └── schemas/
```

---

## 🔑 Variables d'environnement

### Frontend (`frontend/.env.local`)
```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
```

### Backend (`backend/.env`)
```
DATABASE_URL=postgresql+asyncpg://user:pass@localhost/leadaly
REDIS_URL=redis://localhost:6379
CLERK_SECRET_KEY=
APIFY_TOKEN=
HUNTER_API_KEY=
LINKDAPI_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_S3_BUCKET=leadaly-exports
RESEND_API_KEY=
ANTHROPIC_API_KEY=
FRONTEND_URL=http://localhost:3000
```

---

## 🏗️ Stack et règles techniques

### Frontend
- **Framework :** Next.js 14 avec App Router (pas Pages Router)
- **Styles :** Tailwind CSS + shadcn/ui
- **Auth :** Clerk (useAuth, SignIn, SignUp)
- **HTTP :** axios avec intercepteur JWT automatique
- **State :** Zustand pour state global (workspace, user), React Query pour server state
- **Mobile :** Responsive first — bottom nav sur mobile, sidebar sur desktop
- **i18n :** next-intl (FR + EN), fichiers dans `messages/`
- **Fonts :** Inter (Google Fonts)

### Backend
- **Framework :** FastAPI + Uvicorn
- **ORM :** SQLAlchemy async + Alembic pour migrations
- **Validation :** Pydantic v2
- **Auth :** Vérification JWT Clerk via JWKS
- **Queue :** Celery + Redis (jobs async scraping/enrichissement)
- **DB :** PostgreSQL async (asyncpg)
- **Cache :** Redis (rate limiting, résultats scraping temporaires)

### Règles de code
- Toujours utiliser `async/await` côté FastAPI
- Types TypeScript stricts, pas de `any`
- Chaque router FastAPI dans son propre fichier
- Middleware auth sur toutes les routes sauf `/health` et `/webhooks`
- Logs structurés (structlog) côté backend
- Pas de secrets en dur dans le code, toujours via `.env`

---

## 🗄️ Schéma base de données

### Tables principales
| Table | Description |
|-------|-------------|
| `workspaces` | Organisation multi-tenant |
| `workspace_members` | Membres + rôles |
| `campaigns` | Campagnes de scraping |
| `leads` | Prospects LinkedIn scrapés |
| `jobs` | Jobs async (scraping, enrichissement) |
| `crm_connections` | Connexions HubSpot/Pipedrive/Notion |
| `credit_transactions` | Historique crédits |

### Champs critiques à ne pas modifier
- `leads.linkedin_url` : clé de déduplication (UNIQUE)
- `leads.score` : calculé automatiquement, ne jamais écraser manuellement
- `jobs.apify_run_id` : lié au webhook Apify retour
- `credit_transactions.type` : enum strict `purchase|usage|refund|bonus`

---

## 🔌 APIs externes — priorités

### Scraping LinkedIn
1. **LinkdAPI** (recommandé) — `https://api.linkdapi.com` — Clé: `LINKDAPI_KEY`
2. **Apify** (fallback) — Actor: `curious_coder/linkedin-sales-navigator-search`

### Enrichissement email
- **Hunter.io** — endpoint `/email-finder` — Clé: `HUNTER_API_KEY`

### Génération email IA
- **Claude Sonnet** via Anthropic API — modèle: `claude-sonnet-4-20250514`
- Prompt system dédié dans `backend/services/ai_service.py`

### CRM
- HubSpot : OAuth 2.0 + Contacts API v3
- Pipedrive : API Key + Persons API
- Notion : Integration token + Pages API

### Billing
- Stripe : Plans crédits (Starter 29€/500cr, Pro 79€/2000cr, Agency 199€/10000cr)

---

## 📐 Design system

### Couleurs
- Primary: `#3B82F6` (blue-500)
- Gradient: `linear-gradient(135deg, #3B82F6, #6366F1)`
- Background: `linear-gradient(135deg, #dbeafe 0%, #ede9fe 50%, #dcfce7 100%)`
- Cards: `rgba(255,255,255,0.88)` + `backdrop-filter: blur(14px)`
- Text primary: `#111`
- Text secondary: `#888`

### Composants
- Cards: `border-radius: 16px`, shadow subtile
- Boutons primary: gradient blue-violet, `border-radius: 10px`
- Bottom nav mobile : fixé en bas, `safe-area-inset-bottom`
- Modal mobile : bottom sheet (s'ouvre depuis le bas)
- Toasts : centrés en bas sur mobile, coin bas-droit sur desktop

### Responsive
- Mobile : `< 768px` → bottom nav, 1 colonne, bottom sheets
- Tablet : `768–1024px` → sidebar, 2 colonnes
- Desktop : `> 1024px` → sidebar, 3 colonnes

---

## 🔒 Sécurité

- CORS configuré pour `FRONTEND_URL` uniquement
- Rate limiting Redis : 100 req/min par workspace pour les endpoints scraping
- Crédits vérifiés avant chaque run (double check DB + cache Redis)
- Données leads chiffrées au repos (emails sensibles)
- Endpoint RGPD obligatoire : `DELETE /api/leads/bulk-delete`

---

## ⚠️ Règles absolues

1. **Ne jamais supprimer de migration Alembic** — toujours créer une nouvelle
2. **Ne jamais modifier `CLAUDE.md` sans validation** du propriétaire du projet
3. **Toujours demander confirmation** avant de modifier la DB en production
4. **Tester chaque endpoint** avec un cas nominal ET un cas d'erreur
5. **Ne pas créer de pages Notion** — utiliser uniquement les fichiers `.md` du workspace
6. **Utiliser uniquement `sequences_json`** pour la sync Redis (pas les Data Types Bubble — sans objet ici mais règle globale)
7. **Chaque session** doit se terminer par un `git commit` avec message conventionnel

---

## 📝 Convention de commits

```
feat(scope): description courte
fix(scope): description
chore(scope): description

Exemples:
feat(auth): add Clerk JWT middleware
feat(campaigns): add Apify scraping endpoint  
fix(leads): fix deduplication by linkedin_url
chore(deps): update FastAPI to 0.110.0
```

---

*Leadaly · CLAUDE.md v1.0 · Avril 2026*

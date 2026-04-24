# Leadaly

> **CRM B2B intelligent** — scraping LinkedIn, enrichissement emails, email AI, et campagnes de prospection. Backend FastAPI + Frontend Next.js 15.

## Stack

| Layer | Tech |
|-------|------|
| Frontend | Next.js 15.5.15, shadcn/ui, Tailwind v4 CSS, base-ui |
| Auth | Clerk (JWT, middleware protection) |
| Backend | FastAPI, Python 3.11+ |
| Database | Turso (libSQL / SQLite distribué) |
| Scrapping | Apify, LinkdAPI |
| Enrichissement | Hunter.io |
| Email AI | Claude (Anthropic REST API) |
| Envoi email | Resend |
| Billing | Stripe |

## Setup local

```bash
# Frontend
cd frontend
cp .env.example .env.local
npm install
npm run dev

# Backend
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# Remplir les clés API (voir .env.example)
uvicorn app.main:app --reload --port 8000
```

## Variables d'environnement

```bash
# .env (backend)
DATABASE_URL=turso://...
TURSO_AUTH_TOKEN=
CLERK_SECRET_KEY=
CLERK_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
HUNTER_API_KEY=
LINKDAPI_KEY=
APIFY_TOKEN=
ANTHROPIC_API_KEY=
RESEND_API_KEY=
FRONTEND_URL=http://localhost:3000
API_BASE_URL=http://localhost:8000
```

## Architecture

```
frontend/          Next.js 15 app
  app/
    (auth)/        Clerk sign-in / sign-up
    dashboard/     Protected routes (middleware)
      page.tsx     Dashboard + charts
      prospects/   Grid + filters + detail Sheet
      campaigns/   List + create + run
      scraping/    Job list + create dialog
      settings/    Billing + integrations + profile
  components/
    prospects/     ProspectCard, Grid, FilterBar, Detail
    campaigns/     CampaignCard, CreateDialog
    scraping/      JobList, CreateJobDialog
    email/         ComposeEmailDialog
    ui/            shadcn components (base-ui)
  lib/api.ts       Axios client avec injectToken

backend/
  app/
    core/
      auth.py      Clerk JWT Bearer (JWKS)
      config.py    Settings from .env
      database.py  libsql-client async wrapper
    routers/
      workspace.py  POST /api/workspace/init
      leads.py     CRUD /leads, /leads/{id}, /leads/bulk
      campaigns.py  CRUD + /campaigns/{id}/run + SSE stream
      jobs.py       CRUD scraping jobs
      webhooks.py   Apify webhook → upsert leads, Stripe webhook
      billing.py    /credits, /checkout, /portal, /plans
    services/
      scraping_service.py    LinkdAPI + Apify actor
      enrichment_service.py  Hunter.io + lead scoring
      email_service.py       Claude REST + Resend
      billing_service.py     Stripe client + credit deduction
    main.py        FastAPI app, CORS, lifespan, routers
  schema.sql       DB schema (workspaces, leads, campaigns, jobs...)
  scripts/init_db.py
```

## Pages

- `/` — Landing (future)
- `/dashboard` — Stats + bar charts + activity feed
- `/dashboard/prospects` — Card grid with filters (tabs, search, industry, score)
- `/dashboard/campaigns` — Campaign list + creation dialog + run
- `/dashboard/scraping` — Job list + create job dialog
- `/dashboard/settings` — Billing plans + integrations + profile tabs

## Routes API

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/workspace/init` | Auto-create workspace on first login |
| GET | `/api/leads` | List leads (filtered by workspace) |
| POST | `/api/leads/bulk` | Upsert leads from scraping |
| GET | `/api/campaigns` | List campaigns |
| POST | `/api/campaigns` | Create campaign |
| POST | `/api/campaigns/{id}/run` | Launch scraping job |
| GET | `/api/campaigns/{id}/stream` | SSE real-time progress |
| GET | `/api/jobs` | List scraping jobs |
| POST | `/api/jobs` | Create + launch scraping job |
| POST | `/api/jobs/{id}/cancel` | Cancel running job |
| POST | `/api/webhooks/scraping/{job_id}` | Apify webhook |
| POST | `/api/webhooks/stripe` | Stripe events |
| GET | `/api/billing/credits` | Credit balance + history |
| POST | `/api/billing/checkout` | Stripe checkout session |
| GET | `/api/billing/plans` | Plan details + pricing |

## Design system

- **Font**: Geist (next/font)
- **Colors**: CSS variables (`--background`, `--foreground`, `--card-leadaly`, etc.)
- **Cards**: `.card-leadaly` class for project-specific card style
- **Gradients**: Blue→Indigo for primary CTAs, Indigo→Purple for campaigns
- **Icons**: Lucide React
- **UI components**: shadcn/ui + base-ui primitives

## Production deployment

- **Frontend**: Vercel (connects to GitHub automatically)
- **Backend**: Vercel Serverless Functions ou Railway/Render
- **DB**: Turso (distributed SQLite, URL provided)
- **Webhook URLs**: Configurer `API_BASE_URL` en prod pour les webhooks Apify/Stripe

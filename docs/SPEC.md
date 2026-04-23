# SPEC — LinkedIn B2B Lead Generation SaaS
> Document de référence pour l'agent IA. Lire intégralement avant de commencer.

---

## 1. Vue d'ensemble du projet

**Nom du projet :** Leadaly (nom provisoire)
**Type :** SaaS B2B multi-tenant, génération de leads LinkedIn
**Objectif :** Permettre à des équipes sales/marketing d'extraire, enrichir et exporter des leads LinkedIn qualifiés, sans compétence technique.

---

## 2. Stack technique cible

| Couche | Technologie | Justification |
|--------|-------------|---------------|
| Frontend | Next.js 14 (App Router) + Tailwind CSS | SSR, routing, performance |
| UI Components | shadcn/ui | Accessible, customisable |
| Backend | FastAPI (Python 3.11+) | Async natif, parfait pour jobs |
| Auth | Clerk | Multi-tenant out of the box |
| Base de données | PostgreSQL (Supabase ou Railway) | Relationnel, JSONB pour leads |
| Cache / Queue | Redis (Upstash) | Rate limiting, job queue |
| Scraping | Apify REST API | Actors LinkedIn prêts à l'emploi |
| Enrichissement email | Hunter.io API | Vérification + recherche email |
| Billing | Stripe (mode crédits) | Flexible, bien documenté |
| Email transactionnel | Resend | Simple, bonne délivrabilité |
| Stockage exports | AWS S3 | Exports CSV signés |
| CRM | HubSpot + Pipedrive + Notion | Webhooks + API natives |
| Déploiement backend | Ubuntu droplet (existant) | Déjà configuré |
| Déploiement frontend | Vercel | Zero-config Next.js |

---

## 3. Schéma de base de données

### Table `workspaces`
```sql
id UUID PRIMARY KEY DEFAULT gen_random_uuid()
name VARCHAR(255) NOT NULL
slug VARCHAR(100) UNIQUE NOT NULL
plan VARCHAR(50) DEFAULT 'starter' -- starter | pro | agency
credits_remaining INT DEFAULT 100
credits_total INT DEFAULT 100
created_at TIMESTAMP DEFAULT NOW()
stripe_customer_id VARCHAR(255)
stripe_subscription_id VARCHAR(255)
```

### Table `workspace_members`
```sql
id UUID PRIMARY KEY DEFAULT gen_random_uuid()
workspace_id UUID REFERENCES workspaces(id)
user_id VARCHAR(255) NOT NULL -- Clerk user ID
role VARCHAR(50) DEFAULT 'member' -- owner | admin | member
created_at TIMESTAMP DEFAULT NOW()
```

### Table `campaigns`
```sql
id UUID PRIMARY KEY DEFAULT gen_random_uuid()
workspace_id UUID REFERENCES workspaces(id)
name VARCHAR(255) NOT NULL
status VARCHAR(50) DEFAULT 'draft' -- draft | running | completed | failed | paused
filters JSONB NOT NULL -- voir structure ci-dessous
leads_count INT DEFAULT 0
credits_used INT DEFAULT 0
apify_run_id VARCHAR(255)
created_at TIMESTAMP DEFAULT NOW()
completed_at TIMESTAMP
```

Structure `filters` (JSONB) :
```json
{
  "keywords": ["VP Sales", "Head of Marketing"],
  "locations": ["France", "Belgium"],
  "industries": ["SaaS", "Fintech"],
  "company_sizes": ["11-50", "51-200"],
  "seniority": ["Director", "VP", "C-Level"],
  "max_results": 500
}
```

### Table `leads`
```sql
id UUID PRIMARY KEY DEFAULT gen_random_uuid()
workspace_id UUID REFERENCES workspaces(id)
campaign_id UUID REFERENCES campaigns(id)
first_name VARCHAR(255)
last_name VARCHAR(255)
full_name VARCHAR(255)
title VARCHAR(255)
company_name VARCHAR(255)
company_size VARCHAR(100)
industry VARCHAR(255)
location VARCHAR(255)
linkedin_url VARCHAR(500) UNIQUE
email VARCHAR(255)
email_status VARCHAR(50) -- valid | invalid | risky | unknown
phone VARCHAR(100)
seniority VARCHAR(100)
raw_data JSONB -- données brutes Apify
score INT DEFAULT 0 -- 0-100
tags TEXT[] DEFAULT '{}'
crm_pushed_at TIMESTAMP
crm_external_id VARCHAR(255)
created_at TIMESTAMP DEFAULT NOW()
```

### Table `jobs`
```sql
id UUID PRIMARY KEY DEFAULT gen_random_uuid()
workspace_id UUID REFERENCES workspaces(id)
campaign_id UUID REFERENCES campaigns(id)
type VARCHAR(50) NOT NULL -- scrape | enrich | export | crm_push
status VARCHAR(50) DEFAULT 'pending' -- pending | running | completed | failed
apify_actor_id VARCHAR(255)
apify_run_id VARCHAR(255)
input JSONB
output JSONB
error_message TEXT
started_at TIMESTAMP
completed_at TIMESTAMP
created_at TIMESTAMP DEFAULT NOW()
```

### Table `crm_connections`
```sql
id UUID PRIMARY KEY DEFAULT gen_random_uuid()
workspace_id UUID REFERENCES workspaces(id)
crm_type VARCHAR(50) NOT NULL -- hubspot | pipedrive | notion | csv
credentials JSONB -- chiffré, stocker access_token etc.
config JSONB -- mapping de champs, notion database_id, etc.
is_active BOOLEAN DEFAULT true
last_sync_at TIMESTAMP
created_at TIMESTAMP DEFAULT NOW()
```

### Table `credit_transactions`
```sql
id UUID PRIMARY KEY DEFAULT gen_random_uuid()
workspace_id UUID REFERENCES workspaces(id)
type VARCHAR(50) NOT NULL -- purchase | usage | refund | bonus
amount INT NOT NULL -- positif = ajout, négatif = consommation
description TEXT
campaign_id UUID REFERENCES campaigns(id)
stripe_payment_intent_id VARCHAR(255)
created_at TIMESTAMP DEFAULT NOW()
```

---

## 4. Endpoints API FastAPI

### Auth (géré par Clerk côté frontend, vérification JWT côté FastAPI)
```
GET  /api/health
POST /api/auth/verify  -- valide le JWT Clerk, retourne workspace info
```

### Workspaces
```
GET  /api/workspace                    -- infos workspace courant
PUT  /api/workspace                    -- update nom, settings
GET  /api/workspace/members            -- liste membres
POST /api/workspace/members/invite     -- inviter par email
```

### Campaigns
```
GET  /api/campaigns                    -- liste campagnes du workspace
POST /api/campaigns                    -- créer une campagne
GET  /api/campaigns/{id}              -- détail + stats
PUT  /api/campaigns/{id}              -- modifier (si draft)
DELETE /api/campaigns/{id}            -- supprimer
POST /api/campaigns/{id}/run          -- lancer le scraping
POST /api/campaigns/{id}/pause        -- mettre en pause
POST /api/campaigns/{id}/stop         -- arrêter
```

### Leads
```
GET  /api/leads                        -- liste leads (filtres: campaign_id, score, email_status, tags)
GET  /api/leads/{id}                  -- détail lead
PUT  /api/leads/{id}                  -- modifier tags, notes
DELETE /api/leads/{id}                -- supprimer (RGPD)
POST /api/leads/enrich                 -- enrichir une sélection
POST /api/leads/export                 -- générer export CSV → S3 → URL signée
POST /api/leads/bulk-delete           -- suppression en masse (RGPD)
```

### CRM
```
GET  /api/crm/connections             -- liste connexions CRM actives
POST /api/crm/connections             -- créer connexion
DELETE /api/crm/connections/{id}      -- supprimer connexion
POST /api/crm/connections/{id}/test   -- tester la connexion
POST /api/crm/push                    -- pousser une sélection de leads vers CRM
GET  /api/crm/push/status/{job_id}   -- statut d'un push CRM
```

### Billing
```
GET  /api/billing/usage               -- crédits restants, historique
POST /api/billing/checkout            -- créer session Stripe
POST /api/billing/portal              -- portail client Stripe
POST /api/billing/webhook             -- webhook Stripe (Stripe → FastAPI)
```

### Webhooks Apify (appelé par Apify quand un run se termine)
```
POST /api/webhooks/apify              -- callback fin de scraping
```

---

## 5. Intégration Apify

### Actors à utiliser
1. **`curious_coder/linkedin-sales-navigator-search`** — scraping Sales Nav
   - Input: `keywords`, `locations`, `industries`, `seniority`
   - Output: liste de profils avec nom, titre, entreprise, LinkedIn URL

2. **`apify/linkedin-company-scraper`** — enrichissement côté entreprise
   - Input: liste de company URLs
   - Output: taille, secteur, description, site web

3. **`bebity/linkedin-profile-scraper`** — profils individuels
   - Input: liste de LinkedIn URLs
   - Output: données complètes du profil

### Appel API Apify (FastAPI)
```python
import httpx

APIFY_TOKEN = os.getenv("APIFY_TOKEN")
ACTOR_ID = "curious_coder/linkedin-sales-navigator-search"

async def run_apify_actor(filters: dict, webhook_url: str):
    payload = {
        "searchQuery": " ".join(filters["keywords"]),
        "location": filters["locations"][0] if filters["locations"] else "",
        "maxResults": filters.get("max_results", 100),
        "proxyConfiguration": {"useApifyProxy": True, "apifyProxyGroups": ["RESIDENTIAL"]},
        "webhooks": [{
            "eventTypes": ["ACTOR.RUN.SUCCEEDED", "ACTOR.RUN.FAILED"],
            "requestUrl": webhook_url
        }]
    }
    async with httpx.AsyncClient() as client:
        resp = await client.post(
            f"https://api.apify.com/v2/acts/{ACTOR_ID}/runs",
            headers={"Authorization": f"Bearer {APIFY_TOKEN}"},
            json=payload
        )
        return resp.json()  # contient runId
```

### Webhook de retour Apify → FastAPI
```python
@app.post("/api/webhooks/apify")
async def apify_webhook(payload: dict, db: AsyncSession = Depends(get_db)):
    run_id = payload["resource"]["id"]
    status = payload["resource"]["status"]
    
    # Trouver le job correspondant
    job = await db.query(Job).filter(Job.apify_run_id == run_id).first()
    
    if status == "SUCCEEDED":
        # Récupérer les résultats depuis Apify Dataset
        results = await fetch_apify_dataset(run_id)
        # Stocker les leads en base
        await process_leads(job.campaign_id, results, db)
        # Lancer enrichissement email
        await enqueue_enrichment(job.campaign_id)
    
    elif status == "FAILED":
        job.status = "failed"
        # Rembourser les crédits
        await refund_credits(job.workspace_id, job.credits_reserved)
```

---

## 6. Enrichissement Hunter.io

```python
HUNTER_API_KEY = os.getenv("HUNTER_API_KEY")

async def enrich_email(first_name: str, last_name: str, company_domain: str) -> dict:
    async with httpx.AsyncClient() as client:
        resp = await client.get(
            "https://api.hunter.io/v2/email-finder",
            params={
                "first_name": first_name,
                "last_name": last_name,
                "domain": company_domain,
                "api_key": HUNTER_API_KEY
            }
        )
        data = resp.json()
        return {
            "email": data.get("data", {}).get("email"),
            "email_status": data.get("data", {}).get("confidence", "unknown")
        }
```

---

## 7. Intégrations CRM

### HubSpot
```python
# OAuth flow + Contacts API
async def push_to_hubspot(lead: Lead, access_token: str):
    contact = {
        "properties": {
            "firstname": lead.first_name,
            "lastname": lead.last_name,
            "email": lead.email,
            "jobtitle": lead.title,
            "company": lead.company_name,
            "linkedin_url": lead.linkedin_url  # propriété custom
        }
    }
    async with httpx.AsyncClient() as client:
        resp = await client.post(
            "https://api.hubapi.com/crm/v3/objects/contacts",
            headers={"Authorization": f"Bearer {access_token}"},
            json=contact
        )
        return resp.json()
```

### Pipedrive
```python
# API Key auth + Persons API
async def push_to_pipedrive(lead: Lead, api_key: str, company_domain: str):
    person = {
        "name": lead.full_name,
        "email": [{"value": lead.email, "primary": True}],
        "job_title": lead.title,
    }
    async with httpx.AsyncClient() as client:
        resp = await client.post(
            f"https://{company_domain}.pipedrive.com/api/v1/persons",
            params={"api_token": api_key},
            json=person
        )
        return resp.json()
```

### Notion
```python
# Integration token + Database API
async def push_to_notion(lead: Lead, token: str, database_id: str):
    page = {
        "parent": {"database_id": database_id},
        "properties": {
            "Name": {"title": [{"text": {"content": lead.full_name}}]},
            "Email": {"email": lead.email},
            "Company": {"rich_text": [{"text": {"content": lead.company_name or ""}}]},
            "Title": {"rich_text": [{"text": {"content": lead.title or ""}}]},
            "LinkedIn": {"url": lead.linkedin_url},
            "Score": {"number": lead.score}
        }
    }
    async with httpx.AsyncClient() as client:
        resp = await client.post(
            "https://api.notion.com/v1/pages",
            headers={
                "Authorization": f"Bearer {token}",
                "Notion-Version": "2022-06-28"
            },
            json=page
        )
        return resp.json()
```

---

## 8. Système de crédits Stripe

### Plans
| Plan | Prix mensuel | Crédits inclus | Prix crédit supp. |
|------|-------------|----------------|-------------------|
| Starter | 29€ | 500 | 0.08€ |
| Pro | 79€ | 2000 | 0.05€ |
| Agency | 199€ | 10000 | 0.03€ |

### Coût par opération
- 1 lead scrappé = 1 crédit
- 1 enrichissement email = 0.5 crédit
- 1 push CRM = 0 crédit (gratuit)
- Export CSV = 0 crédit (gratuit)

### Stripe webhook events à écouter
- `checkout.session.completed` → créditer le workspace
- `invoice.paid` → renouvellement mensuel, reset crédits
- `customer.subscription.deleted` → downgrade vers free

---

## 9. Structure du projet Next.js

```
/app
  /dashboard
    /campaigns
      page.tsx          -- liste campagnes
      /new/page.tsx     -- créer campagne
      /[id]/page.tsx    -- détail campagne + leads
    /leads
      page.tsx          -- leads globaux avec filtres
    /crm
      page.tsx          -- connexions CRM
    /billing
      page.tsx          -- usage + plans
    /settings
      page.tsx          -- workspace settings
  /onboarding
    page.tsx
  layout.tsx
  page.tsx              -- redirect vers /dashboard

/components
  /campaigns
    CampaignCard.tsx
    FiltersBuilder.tsx  -- le search builder UI
    LeadTable.tsx
  /crm
    CRMConnector.tsx
    FieldMapper.tsx
  /billing
    CreditMeter.tsx
    PricingTable.tsx
  /ui                   -- shadcn/ui components

/lib
  api.ts               -- fetch wrapper vers FastAPI
  auth.ts              -- Clerk helpers
  types.ts             -- TypeScript types
```

---

## 10. Structure du projet FastAPI

```
/app
  main.py              -- FastAPI app, CORS, routers
  /routers
    campaigns.py
    leads.py
    crm.py
    billing.py
    webhooks.py
    workspace.py
  /models
    campaign.py        -- SQLAlchemy models
    lead.py
    job.py
    crm.py
    billing.py
  /services
    apify_service.py   -- appels Apify
    hunter_service.py  -- enrichissement email
    crm_service.py     -- push HubSpot / Pipedrive / Notion
    stripe_service.py  -- billing
    scoring_service.py -- calcul score lead
    export_service.py  -- génération CSV → S3
  /schemas
    campaign.py        -- Pydantic schemas
    lead.py
    crm.py
  /core
    config.py          -- env vars
    database.py        -- connexion PostgreSQL async
    redis.py           -- connexion Redis
    auth.py            -- vérification JWT Clerk
    credits.py         -- gestion crédits
  requirements.txt
  Dockerfile
```

---

## 11. Variables d'environnement

### Frontend (.env.local)
```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_API_URL=https://api.votredomaine.com
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
```

### Backend (.env)
```
DATABASE_URL=postgresql+asyncpg://user:pass@host/db
REDIS_URL=redis://...
CLERK_SECRET_KEY=
APIFY_TOKEN=
HUNTER_API_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_S3_BUCKET=
RESEND_API_KEY=
FRONTEND_URL=https://votredomaine.com
```

---

## 12. Scoring des leads

```python
def calculate_score(lead: dict) -> int:
    score = 0
    
    # Email valide = +30 pts
    if lead.get("email_status") == "valid":
        score += 30
    
    # Séniorité
    seniority_scores = {
        "C-Level": 25, "VP": 20, "Director": 15,
        "Manager": 10, "Senior": 5
    }
    score += seniority_scores.get(lead.get("seniority", ""), 0)
    
    # Taille entreprise
    size_scores = {
        "1-10": 5, "11-50": 10, "51-200": 15,
        "201-500": 20, "501-1000": 15, ">1000": 10
    }
    score += size_scores.get(lead.get("company_size", ""), 0)
    
    # LinkedIn URL présente = +10 pts
    if lead.get("linkedin_url"):
        score += 10
    
    # Téléphone présent = +10 pts
    if lead.get("phone"):
        score += 10
    
    return min(score, 100)
```

---

## 13. Conformité RGPD

- Endpoint `DELETE /api/leads/bulk-delete` → suppression physique
- Endpoint `POST /api/workspace/gdpr-export` → export de toutes les données d'un user
- Champ `consent_source` à ajouter en phase 2
- Leads automatiquement supprimés après 12 mois d'inactivité (cron job)
- CGU et Politique de confidentialité à rédiger avant mise en production

---

## 14. Roadmap par phases

### Phase 1 — Foundation (Semaine 1-2)
- [ ] Init projet Next.js 14 + FastAPI
- [ ] Auth Clerk (signup, login, workspace auto-créé)
- [ ] Schéma PostgreSQL + migrations Alembic
- [ ] Dashboard skeleton (sidebar, nav)
- [ ] Page Campaigns (liste vide + bouton créer)
- [ ] Middleware auth FastAPI (vérif JWT Clerk)

### Phase 2 — Scraping Core (Semaine 3-4)
- [ ] FiltersBuilder UI (keywords, location, industry, seniority, size)
- [ ] POST /api/campaigns + POST /api/campaigns/{id}/run
- [ ] Intégration Apify (run actor + webhook retour)
- [ ] Job queue Redis (BullMQ côté Node ou Celery côté Python)
- [ ] LeadTable avec pagination + filtres
- [ ] Statuts campagne temps réel (polling ou SSE)

### Phase 3 — Enrichissement + CRM (Semaine 5-6)
- [ ] Hunter.io email enrichment pipeline
- [ ] Déduplication par linkedin_url + email
- [ ] Scoring automatique des leads
- [ ] Page CRM : connect HubSpot / Pipedrive / Notion
- [ ] Push leads vers CRM (sélection manuelle + auto)
- [ ] Export CSV → S3 → URL de téléchargement

### Phase 4 — Billing + Polish (Semaine 7-8)
- [ ] Stripe plans + checkout
- [ ] CreditMeter dans la sidebar
- [ ] Gestion quota (bloquer run si 0 crédits)
- [ ] Emails Resend (bienvenue, run terminé, crédits bas)
- [ ] Onboarding flow (3 étapes : premier campaign, premier export, CRM connect)
- [ ] Page Settings (membres, dangerzone, RGPD)

---

*Fin du document de spécification.*
*Version 1.0 — Généré le 23 avril 2026*

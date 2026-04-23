# SESSIONS.md — Roadmap de code Leadaly
> Chaque session = 1 bloc de travail autonome pour Hermes. Exécuter dans l'ordre.
> Avant chaque session : lire CLAUDE.md. Après chaque session : `git commit`.

---

## ═══ PHASE 1 — FOUNDATION ═══
> Objectif : projet up, auth, DB, skeleton UI

---

### SESSION 1.1 — Init projet
**Durée estimée :** 30 min  
**Dossier :** `~/workspace/leadaly/`

```bash
# 1. Créer la structure
mkdir -p ~/workspace/leadaly
cd ~/workspace/leadaly
git init
git remote add origin git@github.com:RegisAmon/leadaly.git

# 2. Init Next.js
npx create-next-app@latest frontend \
  --typescript --tailwind --eslint --app \
  --no-src-dir --import-alias "@/*"

# 3. Init FastAPI
mkdir backend && cd backend
python3 -m venv venv
source venv/bin/activate
pip install fastapi uvicorn sqlalchemy asyncpg alembic pydantic redis celery httpx python-jose structlog python-dotenv stripe resend anthropic

# 4. shadcn/ui
cd ../frontend
npx shadcn-ui@latest init
```

**Fichiers à créer :**
- `backend/requirements.txt` (liste des deps)
- `backend/.env` (variables vides avec commentaires)
- `frontend/.env.local` (variables vides)
- `.gitignore` racine (node_modules, venv, .env, __pycache__)
- `README.md` (description Leadaly)

**Commit :** `chore(init): bootstrap Next.js + FastAPI project`

---

### SESSION 1.2 — Auth Clerk + workspace auto-création
**Durée estimée :** 45 min  
**Prérequis :** SESSION 1.1 terminée, clés Clerk disponibles

**Frontend :**
```
npm install @clerk/nextjs
```

Fichiers à créer dans `frontend/` :
- `middleware.ts` — protection routes `/dashboard/*`
- `app/layout.tsx` — `<ClerkProvider>`
- `app/(auth)/sign-in/page.tsx`
- `app/(auth)/sign-up/page.tsx`
- `app/dashboard/layout.tsx` — sidebar + mobile nav
- `lib/api.ts` — axios instance avec `getToken()` Clerk en intercepteur

**Backend :**
- `app/core/auth.py` — vérification JWT Clerk via JWKS
- `app/routers/workspace.py` — `POST /api/workspace/init` (créé automatiquement au 1er login)
- `app/models/workspace.py` — SQLAlchemy models
- `app/core/database.py` — connexion asyncpg

**Comportement :**
1. User s'inscrit via Clerk
2. Premier appel API → middleware crée le workspace automatiquement
3. Workspace slug = prénom-nom en minuscules

**Commit :** `feat(auth): Clerk JWT + auto workspace creation`

---

### SESSION 1.3 — Schéma DB complet + migrations
**Durée estimée :** 30 min

**Fichiers à créer :**
- `backend/app/models/` — un fichier par table (workspace, lead, campaign, job, crm, billing)
- `backend/alembic.ini`
- `backend/alembic/versions/001_initial_schema.py`

**Lancer la migration :**
```bash
cd backend
alembic upgrade head
```

**Vérifier :** toutes les tables créées, contraintes UNIQUE sur `leads.linkedin_url`

**Commit :** `feat(db): complete schema + first Alembic migration`

---

### SESSION 1.4 — Dashboard skeleton UI
**Durée estimée :** 45 min

**Composants à créer dans `frontend/components/` :**
- `layout/Sidebar.tsx` — nav desktop, logo Leadaly, lang toggle FR/EN
- `layout/BottomNav.tsx` — nav mobile (5 icônes)
- `layout/TopBar.tsx` — header mobile avec logo + lang toggle
- `layout/AppLayout.tsx` — wrapper responsive (sidebar desktop / bottom nav mobile)
- `ui/CreditMeter.tsx` — barre crédits restants dans sidebar

**Pages à créer dans `frontend/app/dashboard/` :**
- `page.tsx` — Dashboard avec 4 stats cards + bySector + recentActivity
- `prospects/page.tsx` — skeleton (grille vide)
- `campaigns/page.tsx` — skeleton
- `scraping/page.tsx` — skeleton
- `settings/page.tsx` — skeleton

**Design :** suivre exactement le design system dans CLAUDE.md.  
Background gradient, cards glassmorphism, bottom nav fixé mobile.

**Commit :** `feat(ui): dashboard skeleton + responsive layout`

---

## ═══ PHASE 2 — SCRAPING CORE ═══
> Objectif : scraping LinkedIn fonctionnel end-to-end

---

### SESSION 2.1 — Page Prospects — card grid UI
**Durée estimée :** 60 min

**Composants :**
- `components/prospects/ProspectCard.tsx`
  - Checkbox sélection, bouton suppression
  - Avatar initiales coloré, nom/titre/email
  - Company + location row avec icônes
  - Badge industry + status + score
  - Boutons "Détails" (outline) + "Envoyer" (blue gradient)
- `components/prospects/ProspectGrid.tsx` — 1 col mobile, 2 tablet, 3 desktop
- `components/prospects/ProspectDetail.tsx` — bottom sheet mobile / panel desktop
- `components/prospects/FilterBar.tsx` — tabs Tous/Nouveaux/Contactés + search input

**Page `app/dashboard/prospects/page.tsx` :**
- Fetch `GET /api/leads` avec React Query
- État de chargement (skeleton cards)
- État vide illustré avec CTA vers scraping

**Commit :** `feat(prospects): card grid UI + detail panel`

---

### SESSION 2.2 — FiltersBuilder + création campagne
**Durée estimée :** 60 min

**Composants :**
- `components/scraping/FiltersBuilder.tsx`
  - Multi-select : keywords (tags input), location, industry
  - Select : seniority (C-Level, VP, Director, Manager, Senior)
  - Select : company size (1-10, 11-50, 51-200, 201-500, >500)
  - Slider : max_results (25–500)
  - Preview : "Coût estimé : N crédits" (calculé en temps réel)
  - Sélecteur API : LinkdAPI / Apify (radio cards)
- `components/scraping/CampaignCard.tsx`

**Backend :**
- `app/routers/campaigns.py`
  - `POST /api/campaigns` — créer campagne
  - `GET /api/campaigns` — liste
  - `POST /api/campaigns/{id}/run` — lancer scraping

**Vérifications dans `/run` :**
1. Workspace a assez de crédits
2. Réserver les crédits (status = "pending")
3. Créer un Job en DB
4. Appeler LinkdAPI ou Apify selon config
5. Retourner `{ job_id, run_id }`

**Commit :** `feat(scraping): FiltersBuilder UI + campaign creation endpoint`

---

### SESSION 2.3 — Intégration LinkdAPI + Apify
**Durée estimée :** 60 min

**Backend — `app/services/scraping_service.py` :**

```python
# Interface commune pour les deux APIs
async def run_linkedin_search(filters: dict, api: str, webhook_url: str) -> str:
    if api == "linkdapi":
        return await run_linkdapi_search(filters, webhook_url)
    elif api == "apify":
        return await run_apify_actor(filters, webhook_url)

# LinkdAPI
async def run_linkdapi_search(filters: dict, webhook_url: str) -> str:
    # POST https://api.linkdapi.com/v1/linkedin/search/people
    # Headers: Authorization: Bearer LINKDAPI_KEY
    # Body: { keywords, location, industry, seniority, page_size }
    # Retourne: run_id

# Apify
async def run_apify_actor(filters: dict, webhook_url: str) -> str:
    # POST https://api.apify.com/v2/acts/curious_coder~linkedin-sales-navigator-search/runs
    # Headers: Authorization: Bearer APIFY_TOKEN
    # Body: { searchQuery, location, maxResults, webhooks: [{eventTypes, requestUrl}] }
    # Retourne: runId
```

**Backend — `app/routers/webhooks.py` :**

```python
# POST /api/webhooks/apify
# POST /api/webhooks/linkdapi
# Comportement identique:
# 1. Trouver le Job via run_id
# 2. Récupérer les résultats (dataset API)
# 3. Parser → normaliser → stocker leads
# 4. Décompter crédits (1 par lead)
# 5. Déclencher enrichissement email (Celery task)
# 6. Mettre à jour status job + campaign
```

**Normalisation des leads (champs communs) :**
```python
# linkedin_url, first_name, last_name, title, company_name,
# company_size, industry, location, seniority, raw_data (JSONB)
```

**Commit :** `feat(scraping): LinkdAPI + Apify integration + webhook handlers`

---

### SESSION 2.4 — Job queue Celery + statuts temps réel
**Durée estimée :** 45 min

**Backend :**
- `app/core/celery.py` — config Celery + Redis broker
- `app/tasks/scraping_tasks.py` — task `process_scraping_results`
- `app/tasks/enrichment_tasks.py` — task `enrich_leads_batch`
- Endpoint SSE : `GET /api/campaigns/{id}/stream` — Server-Sent Events pour statut temps réel

**Frontend :**
- `hooks/useCampaignStatus.ts` — EventSource pour SSE
- Indicateur visuel dans ProspectCard (spinner si enrichissement en cours)
- Toast quand campagne terminée

**Commit :** `feat(jobs): Celery queue + SSE real-time campaign status`

---

## ═══ PHASE 3 — ENRICHISSEMENT + EMAIL IA ═══
> Objectif : enrichissement email, scoring, compose IA, Calendly

---

### SESSION 3.1 — Enrichissement Hunter.io + scoring
**Durée estimée :** 45 min

**Backend — `app/services/hunter_service.py` :**
```python
async def find_email(first_name, last_name, domain) -> dict:
    # GET https://api.hunter.io/v2/email-finder
    # Params: first_name, last_name, domain, api_key
    # Retourne: { email, confidence, status }

async def verify_email(email) -> dict:
    # GET https://api.hunter.io/v2/email-verifier
```

**Backend — `app/services/scoring_service.py` :**
```python
def calculate_score(lead: dict) -> int:
    score = 0
    # email valide = +30
    # séniorité: C-Level=25, VP=20, Director=15, Manager=10, Senior=5
    # taille boîte: 51-200=15, 201-500=20, 11-50=10
    # linkedin_url présente = +10
    # téléphone présent = +10
    return min(score, 100)
```

**Frontend :**
- Badge score coloré dans ProspectCard (vert/orange/rouge)
- Filtre par score minimum dans FilterBar

**Commit :** `feat(enrichment): Hunter.io email enrichment + lead scoring`

---

### SESSION 3.2 — Génération email IA (Claude) + modal compose
**Durée estimée :** 60 min

**Backend — `app/services/ai_service.py` :**
```python
async def generate_personalized_email(prospect: dict, lang: str, calendly_url: str = None) -> dict:
    # Appel Claude Sonnet via Anthropic API
    # Prompt: voir SPEC.md section 7
    # Retourne: { subject, body }
    
# Endpoint:
# POST /api/leads/{id}/generate-email
# Body: { lang: "fr"|"en", include_calendly: bool, calendly_url?: str }
# Retourne: { subject, body }
```

**Frontend — `components/email/ComposeModal.tsx` :**
- Bottom sheet sur mobile, modal centré sur desktop
- Sélecteur prospect (si pas de prospect pré-sélectionné)
- Bloc IA avec bouton "✨ Générer avec l'IA" + loader
- Toggle Calendly avec input URL
- Champs objet + corps éditables
- Boutons Annuler + Envoyer (simulé pour l'instant)

**Frontend — `hooks/useGenerateEmail.ts` :**
- React Query mutation vers `POST /api/leads/{id}/generate-email`

**Commit :** `feat(email): AI email generation with Claude + compose modal`

---

### SESSION 3.3 — CRM — HubSpot + Pipedrive + Notion
**Durée estimée :** 60 min

**Backend — `app/routers/crm.py` :**
```
GET  /api/crm/connections
POST /api/crm/connections          # { crm_type, credentials, config }
DELETE /api/crm/connections/{id}
POST /api/crm/connections/{id}/test
POST /api/crm/push                  # { lead_ids, connection_id }
```

**Backend — `app/services/crm_service.py` :**
```python
# HubSpot: POST https://api.hubapi.com/crm/v3/objects/contacts
# Pipedrive: POST https://{domain}.pipedrive.com/api/v1/persons
# Notion: POST https://api.notion.com/v1/pages
# CSV: générer fichier + upload S3 + URL signée
```

**Frontend — `app/dashboard/campaigns/page.tsx` :**
- Onglets : Emails envoyés / Connexions CRM
- Cartes API (LinkdAPI, HubSpot, Pipedrive, Notion)
- Modal connexion CRM (champs selon le type)
- Bouton "Pousser vers CRM" sur sélection de leads

**Commit :** `feat(crm): HubSpot + Pipedrive + Notion integrations`

---

### SESSION 3.4 — Export CSV → S3
**Durée estimée :** 30 min

**Backend — `app/services/export_service.py` :**
```python
async def export_leads_csv(lead_ids: list, workspace_id: str) -> str:
    # 1. Fetch leads from DB
    # 2. Générer CSV avec csv.DictWriter
    # 3. Upload vers S3 (boto3)
    # 4. Générer URL signée (expire 1h)
    # 5. Envoyer email Resend avec lien
    # 6. Retourner presigned_url
```

**Endpoint :** `POST /api/leads/export` → `{ presigned_url, expires_at }`

**Frontend :** Bouton "Exporter CSV" dans la sélection multi-leads, toast avec lien de téléchargement.

**Commit :** `feat(export): CSV export → S3 + presigned URL + email notification`

---

## ═══ PHASE 4 — BILLING + POLISH ═══
> Objectif : Stripe, quota, notifications, onboarding

---

### SESSION 4.1 — Stripe — plans crédits
**Durée estimée :** 60 min

**Plans :**
| Plan | Prix | Crédits | stripe_price_id |
|------|------|---------|-----------------|
| Starter | 29€/mois | 500 | à configurer dans Stripe |
| Pro | 79€/mois | 2000 | à configurer |
| Agency | 199€/mois | 10000 | à configurer |

**Backend :**
- `app/routers/billing.py`
  - `GET /api/billing/usage` — crédits + historique
  - `POST /api/billing/checkout` — créer session Stripe
  - `POST /api/billing/portal` — portail client
  - `POST /api/billing/webhook` — webhook Stripe

**Webhook events à gérer :**
- `checkout.session.completed` → créditer workspace
- `invoice.paid` → renouvellement, reset crédits
- `customer.subscription.deleted` → downgrade

**Frontend — `app/dashboard/settings/billing/page.tsx` :**
- Cards pricing (3 plans)
- CreditMeter dans sidebar (barre + nombre)
- Alerte si crédits < 10%
- Bouton "Gérer l'abonnement" (portail Stripe)

**Commit :** `feat(billing): Stripe credit-based plans + usage dashboard`

---

### SESSION 4.2 — Quota + gestion crédits
**Durée estimée :** 30 min

**Backend — `app/core/credits.py` :**
```python
async def check_and_reserve_credits(workspace_id, amount) -> bool:
    # 1. Vérifier credits_remaining >= amount dans DB
    # 2. Lock Redis pour éviter race condition
    # 3. Si ok: décrémenter DB + insérer credit_transaction
    # 4. Si ko: retourner False (endpoint retourne 402)

async def refund_credits(workspace_id, amount, reason):
    # Rembourser si job échoué
```

**Frontend :**
- Intercepteur axios : si 402 → afficher modal "Crédits insuffisants" avec CTA upgrade
- Preview coût dans FiltersBuilder bloque si crédits insuffisants

**Commit :** `feat(credits): quota check + race condition prevention + refund on failure`

---

### SESSION 4.3 — Emails Resend — transactionnels
**Durée estimée :** 30 min

**Templates à créer dans `backend/app/services/email_templates/` :**

1. `welcome.html` — bienvenue + lien dashboard
2. `campaign_done.html` — "Votre campagne est terminée — N leads extraits"
3. `low_credits.html` — "Il vous reste N crédits — rechargez"
4. `invite_member.html` — invitation membre workspace
5. `export_ready.html` — "Votre export CSV est prêt" + lien S3

**Backend — `app/services/email_service.py` :**
```python
async def send_campaign_done(to, workspace_name, campaign_name, leads_count):
async def send_low_credits_alert(to, workspace_name, credits_remaining):
async def send_export_ready(to, presigned_url, expires_at):
```

**Commit :** `feat(email-notif): Resend transactional emails (5 templates)`

---

### SESSION 4.4 — Onboarding flow + Settings page
**Durée estimée :** 45 min

**Onboarding (`app/dashboard/onboarding/page.tsx`) :**
- 3 étapes :
  1. "Lancez votre première recherche LinkedIn" → bouton vers scraping
  2. "Connectez un CRM pour exporter vos leads" → bouton vers CRM
  3. "Envoyez votre premier email personnalisé" → bouton vers prospects
- Checklist persistante en DB (`workspace.onboarding_step`)
- Disparaît une fois les 3 étapes complétées

**Settings (`app/dashboard/settings/page.tsx`) :**
- Profil workspace (nom, logo upload)
- Membres (liste, invitation, rôles owner/admin/member)
- Lien Calendly par défaut (sauvegardé en workspace settings)
- Danger zone : supprimer tous les leads (RGPD), supprimer workspace
- Langue par défaut (FR/EN)

**Commit :** `feat(onboarding): 3-step flow + complete settings page`

---

### SESSION 4.5 — Tests + déploiement
**Durée estimée :** 60 min

**Backend — tests :**
```bash
pip install pytest pytest-asyncio httpx
# Tests pour:
# - auth middleware (token valide, token invalide, token expiré)
# - credits check (assez, pas assez, remboursement)
# - lead deduplication (même linkedin_url)
# - scoring service (cas nominal, cas limites)
```

**Frontend — build check :**
```bash
npm run build
npm run lint
```

**Déploiement :**
```bash
# Backend (Ubuntu droplet)
cd ~/workspace/leadaly/backend
source venv/bin/activate
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4

# Frontend (Vercel)
cd ~/workspace/leadaly/frontend
vercel --prod
```

**Checklist avant prod :**
- [ ] Variables d'env complètes sur Vercel + droplet
- [ ] Migrations Alembic run en prod
- [ ] Webhook Stripe configuré avec URL prod
- [ ] Webhook Apify/LinkdAPI configuré avec URL prod
- [ ] CORS configuré pour le domaine Vercel
- [ ] Healthcheck endpoint répond

**Commit :** `chore(deploy): tests + production deployment checklist`

---

## 📊 Résumé des sessions

| Session | Phase | Contenu | Durée |
|---------|-------|---------|-------|
| 1.1 | Foundation | Init projet | 30 min |
| 1.2 | Foundation | Auth Clerk + workspace | 45 min |
| 1.3 | Foundation | DB schema + migrations | 30 min |
| 1.4 | Foundation | Dashboard skeleton UI | 45 min |
| 2.1 | Scraping | Prospects card grid | 60 min |
| 2.2 | Scraping | FiltersBuilder + campagne | 60 min |
| 2.3 | Scraping | LinkdAPI + Apify + webhooks | 60 min |
| 2.4 | Scraping | Celery + SSE temps réel | 45 min |
| 3.1 | Enrichissement | Hunter.io + scoring | 45 min |
| 3.2 | Enrichissement | Email IA Claude + compose | 60 min |
| 3.3 | Enrichissement | CRM HubSpot/Pipedrive/Notion | 60 min |
| 3.4 | Enrichissement | Export CSV + S3 | 30 min |
| 4.1 | Billing | Stripe plans crédits | 60 min |
| 4.2 | Billing | Quota + gestion crédits | 30 min |
| 4.3 | Billing | Emails Resend | 30 min |
| 4.4 | Billing | Onboarding + Settings | 45 min |
| 4.5 | Deploy | Tests + déploiement | 60 min |
| **Total** | | | **~10h** |

---

*Leadaly · SESSIONS.md v1.0 · Avril 2026*

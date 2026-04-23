## ═══ AUTH & MONETIZATION — Section à ajouter dans CLAUDE.md ═══

---

## 🔐 Stratégie d'authentification

### Providers (Clerk)
- **Google OAuth** — principal, 1 clic, récupère nom + email + photo
- **Magic Link** — fallback, email Resend valable 15 min, zéro mot de passe

### Flux d'inscription
1. Signup Google / Magic Link
2. Clerk crée le user
3. Webhook Clerk `user.created` → FastAPI crée automatiquement le workspace
4. Workspace slug = `{prénom-nom}` en minuscules + tirets
5. Redirect vers `/onboarding` (3 étapes guidées)

### Sécurité
- JWT vérifié via JWKS Clerk à chaque requête FastAPI
- Rate limiting Redis : 5 tentatives login → lockout 10 min
- Session : 7 jours, refresh silencieux
- Audit log en DB pour toutes les actions sensibles (scraping, export, billing)

---

## 💳 Plans tarifaires

| Plan | Prix mensuel | Prix annuel | Leads/mois | Emails IA |
|------|-------------|-------------|-----------|-----------|
| Free | 0€ | 0€ | 20 | 5 |
| Starter | 39€ | 29€/mois | 300 | 100 |
| Pro | 89€ | 69€/mois | 1500 | 500 |
| Agency | 229€ | 179€/mois | 8000 | Illimité |

### Ce que chaque plan débloque
```
Free:       scraping, 5 emails IA, branding "Powered by Leadaly"
Starter:    enrichissement email, 1 CRM, Calendly, no branding
Pro:        téléphone, tous CRMs, API access, séquences email auto
Agency:     5 workspaces, white-label, support prioritaire, SSO
```

### Logique de quota
- Leads = `workspace.leads_remaining` décrémenté à chaque lead extrait
- Reset le 1er du mois (cron job à minuit UTC)
- Plan annuel : rollover possible (max ×2 du quota mensuel)
- Si `leads_remaining = 0` → endpoint `/api/campaigns/{id}/run` retourne 402
- Intercepteur axios frontend → modal upgrade contextuel

### Stripe IDs à créer
```
STRIPE_PRICE_STARTER_MONTHLY=price_xxx
STRIPE_PRICE_STARTER_ANNUAL=price_xxx
STRIPE_PRICE_PRO_MONTHLY=price_xxx
STRIPE_PRICE_PRO_ANNUAL=price_xxx
STRIPE_PRICE_AGENCY_MONTHLY=price_xxx
STRIPE_PRICE_AGENCY_ANNUAL=price_xxx
```

---

## 📈 Growth levers à implémenter

### Priorité 1 (Phase 1–2)
1. **"Powered by Leadaly"** — signature sur emails plan Free (opt-out sur plan payant)
2. **Referral** — `POST /api/workspace/referral` → génère code unique
   - Invite acceptée = +50 leads/mois pour les deux (max +300)
   - Suivi dans `credit_transactions` type=`referral_bonus`

### Priorité 2 (Phase 3)
3. **Partage LinkedIn** — bouton qui génère un post Claude + lien signup trackable
4. **Affiliate** — 30% commission récurrente 12 mois (table `affiliates` en DB)

---

## 🎯 Upgrade triggers (quand montrer le modal upgrade)

Afficher le modal au BON moment — jamais quand l'user est frustré, toujours quand il a du succès :

```typescript
// Triggers d'upgrade dans le frontend
const UPGRADE_TRIGGERS = [
  'leads_at_90_percent',     // barre de leads à 18/20 (free)
  'email_limit_reached',     // après le 5ème email IA (free)
  'crm_gate_clicked',        // clic sur "Connecter HubSpot" (free)
  'api_access_gate',         // clic sur API tab (Starter)
  'workspace_add_gate',      // essai d'ajout workspace (Pro)
  'after_first_success',     // 1ère campagne terminée avec >10 leads
]
```

### Message du modal selon le trigger
```typescript
// Exemple pour leads_at_90_percent
{
  title: "Vous avez trouvé 18 leads qualifiés !",
  subtitle: "Passez à Starter pour 300 leads/mois — continuez sur cette lancée.",
  cta: "Passer à Starter — 39€/mois",
  secondary: "Ou payer à l'usage (0.15€/lead)"
}
```

---

## 📊 Unit economics (référence)

| Coût | Par unité |
|------|-----------|
| Scraping LinkedIn (LinkdAPI) | $0.01 / lead |
| Enrichissement email (Hunter.io) | $0.005 / email |
| Génération email IA (Claude Sonnet) | ~$0.002 / email |
| Notification email (Resend) | $0.001 / email |
| Infra fixe (Vercel + droplet) | ~30€ / mois |

**Marge brute par plan (si leads utilisés à 100%) :**
- Starter : ~90%
- Pro : ~81%
- Agency : ~61%

**Break-even** : 1 abonné Agency ou 3 abonnés Pro couvrent l'infra fixe.

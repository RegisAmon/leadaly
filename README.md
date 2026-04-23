# Leadaly — Package complet pour Hermes

## Structure

```
leadaly_package/
├── README.md              ← CE FICHIER
├── docs/
│   ├── CLAUDE.md          ← Bible du projet (lire EN PREMIER)
│   ├── SESSIONS.md        ← 17 sessions de code détaillées
│   ├── SPEC.md            ← Spec technique complète (DB, API, services)
│   ├── MONETIZATION.md    ← Auth, plans, Stripe, growth levers
│   └── HERMES_PROMPT.md   ← Prompt exact à coller dans Hermes
└── ui/
    ├── leadaly_ui_mobile.jsx    ← UI de référence (mobile + desktop)
    ├── leadflow_reference.jsx   ← Version précédente avec emails
    └── roadmap.jsx              ← Roadmap interactif visuel
```

## Comment démarrer

1. Copier le dossier `docs/` dans `~/workspace/leadaly/` sous WSL :
   ```bash
   mkdir -p ~/workspace/leadaly
   cp docs/* ~/workspace/leadaly/
   ```

2. Ouvrir `docs/HERMES_PROMPT.md` et copier le prompt

3. Coller dans Hermes avec `[SESSION_ID] = 1.1` pour commencer

## Ordre de lecture des docs

1. CLAUDE.md  →  contexte + règles absolues
2. SPEC.md    →  DB schema + endpoints + services
3. MONETIZATION.md  →  auth + plans + billing
4. SESSIONS.md  →  roadmap session par session
5. HERMES_PROMPT.md  →  le prompt à utiliser

---
*Leadaly · Avril 2026*

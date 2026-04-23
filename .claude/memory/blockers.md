---
schema: blockers.md
description: Frictions, problèmes récurrents et solutions
columns: [id, date, friction, cause, solution, statut]
---

## Index

| ID | Date | Friction | Statut |
|----|------|----------|--------|
| BLK-001 | 2026-04-23 | Projet neuf — pas de code existant, pas de git, pas de DB | Résolu |

---

| BLK-002 | 2026-04-23 | libsql-client Row n'a pas `.columns` — API différente de SQLAlchemy | Résolu |

## BLK-001 — 2026-04-23
...
## BLK-002 — 2026-04-23

**Friction :** `libsql_client.Row` n'a pas l'attribut `.columns` comme prévu.，也没有`.keys()` mais `.asdict()` existe.

**Friction :** Projet Leadaly n'existe pas encore. Aucune structure de code, pas de repo git, pas de PostgreSQL provisionné, pas de variables d'environnement configurées.

**Cause réelle :** État initial — on part de zéro. Documentation EXISTS déjà (CLAUDE.md, SPEC.md, SESSIONS.md dans docs/) mais aucun code implémenté.

**Solution :** Exécuter SESSION 1.1 — bootstrap complet :
- `mkdir -p ~/workspace/leadaly/`
- Initialiser Next.js frontend avec `create-next-app`
- Initialiser FastAPI backend avec venv + deps
- Init git + remote RegisAmon/leadaly (repo public créé via `gh`)
- Installer shadcn/ui

**Statut :** Résolu — SESSION 1.1 terminée

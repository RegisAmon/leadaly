# HERMES — Prompt d'initialisation Leadaly

> Copie-colle ce prompt exact dans Hermes pour démarrer une session de code.
> Remplace `[SESSION_ID]` par la session que tu veux exécuter (ex: `1.1`, `2.3`, etc.)

---

## 🚀 PROMPT À COLLER DANS HERMES

```
Tu es Hermes, mon agent de développement. Voici le contexte du projet Leadaly.

ÉTAPE 1 — Lis ces fichiers dans l'ordre :
1. ~/workspace/leadaly/CLAUDE.md (lire intégralement)
2. ~/workspace/leadaly/SESSIONS.md (lire intégralement)
3. ~/workspace/leadaly/SPEC.md (lire intégralement)

ÉTAPE 2 — Exécute la SESSION [SESSION_ID] décrite dans SESSIONS.md.

Règles d'exécution :
- Lis chaque fichier existant avant de le modifier
- Crée chaque fichier avec son contenu complet (pas de placeholder "// TODO")
- Lance les commandes bash pour vérifier que ça compile/démarre
- Si une dépendance manque, installe-la et note-la dans requirements.txt ou package.json
- En cas d'erreur : diagnostique, corrige, relance
- À la fin : git add -A && git commit -m "[message conventionnel]"
- Dis-moi quand la session est terminée avec un résumé de ce qui a été fait

Important :
- Respecte exactement le design system défini dans CLAUDE.md
- Les types TypeScript doivent être stricts (pas de any)
- FastAPI : tout en async/await
- Mobile-first : tester mentalement le rendu mobile à chaque composant UI
```

---

## 📋 Prompts de session spécifiques

### Pour démarrer la Phase 1 (nouveau projet) :
```
Commence par la SESSION 1.1. Le projet n'existe pas encore, 
crée toute la structure from scratch dans ~/workspace/leadaly/.
```

### Pour reprendre après une interruption :
```
Reprends la SESSION [ID]. Vérifie d'abord l'état actuel du 
projet avec `git log --oneline -10` pour voir ce qui a déjà 
été fait. Ne refais pas ce qui est déjà commité.
```

### Pour débugger une erreur spécifique :
```
Il y a une erreur dans [fichier/endpoint/composant] :
[coller l'erreur]
Corrige-la sans casser le reste. Référence-toi à CLAUDE.md 
pour les conventions.
```

### Pour enchaîner deux sessions :
```
La SESSION [N] est terminée. Passe directement à la SESSION [N+1].
Lis le contenu de SESSION [N+1] dans SESSIONS.md avant de commencer.
```

---

## 📂 Commandes de setup WSL (à exécuter UNE SEULE FOIS)

```bash
# 1. Créer le workspace
mkdir -p ~/workspace/leadaly
cd ~/workspace/leadaly

# 2. Copier les fichiers de doc depuis là où tu les as déposés
cp /mnt/c/Users/[TON_USER]/Downloads/CLAUDE.md ~/workspace/leadaly/
cp /mnt/c/Users/[TON_USER]/Downloads/SESSIONS.md ~/workspace/leadaly/
cp /mnt/c/Users/[TON_USER]/Downloads/SPEC.md ~/workspace/leadaly/

# 3. Vérifier que tout est là
ls -la ~/workspace/leadaly/

# 4. Init git
git init
git add CLAUDE.md SESSIONS.md SPEC.md
git commit -m "chore(docs): add project documentation"

# 5. Lancer Hermes sur la session 1.1
# → coller le prompt ci-dessus dans Hermes
```

---

## 🗂️ Fichiers à déposer dans WSL

Tu dois avoir ces 3 fichiers dans `~/workspace/leadaly/` :

| Fichier | Description | Obligatoire |
|---------|-------------|-------------|
| `CLAUDE.md` | Bible du projet (stack, DB, design, règles) | ✅ Oui |
| `SESSIONS.md` | Roadmap session par session | ✅ Oui |
| `SPEC.md` | Spec technique complète (DB schema, endpoints, services) | ✅ Oui |

> **Note :** Le fichier `leadaly_ui.jsx` est l'UI de référence visuelle.  
> Hermes doit la traduire en composants Next.js/Tailwind, pas l'utiliser directement.

---

## 🔄 Workflow typique d'une journée

```
Matin :
1. Ouvrir WSL
2. cd ~/workspace/leadaly
3. git status (voir où on en est)
4. Coller le prompt de session dans Hermes

Pendant :
- Hermes code → tu valides chaque fichier créé
- Si Hermes bloque : lui donner l'erreur + "corrige sans casser le reste"

Fin de session :
- Vérifier que git commit a été fait
- Tester manuellement l'UI ou l'endpoint
- Passer à la session suivante ou noter la progression
```

---

*Leadaly · HERMES_PROMPT.md v1.0 · Avril 2026*

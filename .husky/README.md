# Git Hooks Configuration

Ce dossier contient les git hooks pour garantir la qualité du code avant chaque commit/push.

## Hooks installés

### `pre-commit` - Avant chaque commit

Vérifie les fichiers staged :

- **ESLint** : Lint et auto-fix
- **Prettier** : Formatage
- **Tests** : Exécute les tests liés aux fichiers modifiés
- **Type-check** : Validation TypeScript

### `commit-msg` - Validation du message de commit

- Longueur minimum (10 caractères)
- Suggestion de conventional commits (feat:, fix:, etc.)

### `pre-push` - Avant chaque push

- **Tests complets** : Tous les tests doivent passer
- **Rust check** : Si fichiers Rust modifiés

## Configuration

### Installation initiale

```bash
# Après npm install, husky s'installe automatiquement via "prepare": "husky"
npm install
```

### Désactiver temporairement

```bash
# Skip tous les hooks
git commit -m "message" --no-verify

# Skip pre-commit seulement
SKIP=pre-commit git commit -m "message"
```

### Lint-staged

La configuration dans `package.json` :

```json
"lint-staged": {
  "*.{vue,ts,tsx}": [
    "eslint --fix",
    "prettier --write"
  ],
  "*.{js,css,md}": [
    "prettier --write"
  ]
}
```

## Workflow recommandé

1. **Développement** : Code normalement
2. **Commit** : Les hooks vérifient automatiquement
   ```bash
   git add .
   git commit -m "feat: add new feature"
   # Hooks exécutés automatiquement
   ```
3. **Push** : Tests complets
   ```bash
   git push
   # Tests complets exécutés
   ```

## Scripts disponibles

```bash
# Quality checks complets
npm run quality       # Lint + type-check + tests
npm run quality:fix   # Lint fix + format

# Par catégorie
npm run lint          # ESLint
npm run lint:fix      # ESLint + fix
npm run format        # Prettier write
npm run format:check  # Prettier check
npm run type-check    # TypeScript
npm run test:ci       # Tests complets

# Rust
npm run rust:quality  # fmt + lint
npm run rust:ci       # fmt check + lint + test
```

## Dépannage

### Hook ne s'exécute pas

```bash
# Vérifier l'installation
npx husky install

# Vérifier les permissions
ls -la .husky/
```

### Trop lent ?

Les hooks peuvent être optimisés :

- `lint-staged` ne vérifie que les fichiers staged
- Les tests ne s'exécutent que si des fichiers de test sont modifiés
- Le type-check est rapide

### Erreur "command not found"

```bash
# Réinstaller les dépendances
rm -rf node_modules package-lock.json
npm install
```

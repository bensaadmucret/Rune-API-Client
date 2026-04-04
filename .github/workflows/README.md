# GitHub Actions Workflows

Ce dossier contient les workflows GitHub Actions pour l'intégration continue du projet Rune API Client.

## Workflows disponibles

### 1. Quality & Tests (`quality.yml`)

**Déclencheurs**: Push/PR sur `main`, `master`, `develop`

**Jobs**:

- **Tests & Lint** (Node 18.x et 20.x)
  - ESLint
  - TypeScript type checking
  - Tests unitaires Vitest
  - Upload du rapport de couverture
- **Build Check**
  - Vérification que le frontend build correctement
- **Tauri Check**
  - Compilation Rust avec `cargo check`
  - Linting Rust avec `cargo clippy`

### 2. Code Quality Checks (`lint.yml`)

**Déclencheurs**: Push/PR sur `main`, `master`, `develop`

**Jobs**:

- **ESLint & Format Check**
  - Vérification ESLint
  - Vérification Prettier
- **TypeScript Type Check**
  - Validation des types TypeScript
  - Validation des types Vue avec `vue-tsc`

### 3. Publish Wiki (`publish-wiki.yml`)

**Déclencheurs**:

- Push sur `main`/`master` modifiant `doc/wiki/**`
- Déclenchement manuel (`workflow_dispatch`)

**Jobs**:

- Publication automatique du wiki GitHub depuis `doc/wiki/`

## Utilisation

### Exécution locale (simulation)

```bash
# Tests
npm test

# Lint
npm run lint

# Type check
npm run type-check

# Build
npm run build
```

### Statut des workflows

Les workflows apparaissent dans :

- Les **Pull Requests** (checks automatiques)
- L'onglet **Actions** du repository
- Les **badges** du README

## Configuration requise

### Secrets

Aucun secret supplémentaire requis. Le workflow `publish-wiki` utilise automatiquement `GITHUB_TOKEN`.

### Permissions

Les workflows nécessitent les permissions:

- `contents: read` - pour checkout le code
- `pull-requests: read` - pour les PR checks
- `actions: write` - pour upload artifacts (coverage)
- `pages: write` - pour le wiki (si applicable)

## Dépannage

### Tests qui échouent

```bash
# Exécuter les tests localement
npm test -- --run --reporter=verbose

# Avec couverture
npm run test:coverage
```

### Lint qui échoue

```bash
# Auto-corriger ESLint
npm run lint:fix

# Auto-corriger Prettier
npm run format
```

### Type errors

```bash
# Vérifier les types
npx vue-tsc --noEmit
```

## Badges à ajouter dans le README

```markdown
![Tests](https://github.com/bensaadmucret/Rune-API-Client/actions/workflows/quality.yml/badge.svg)
![Lint](https://github.com/bensaadmucret/Rune-API-Client/actions/workflows/lint.yml/badge.svg)
```

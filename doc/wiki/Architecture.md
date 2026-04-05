# Architecture

## Vue d'ensemble

Rune API Client est une application desktop construite avec :

- **Tauri** : Framework Rust pour applications desktop
- **Vue.js 3** : Frontend réactif
- **Pinia** : State management
- **SQLite** : Stockage local via Tauri
- **Tailwind CSS** : Styling

## Architecture des couches

```
┌─────────────────────────────────────────┐
│           UI Layer (Vue.js)             │
│  ┌──────────┐ ┌──────────┐ ┌─────────┐ │
│  │Components│ │  Stores  │ │  i18n   │ │
│  └──────────┘ └──────────┘ └─────────┘ │
├─────────────────────────────────────────┤
│         Tauri Bridge (IPC)              │
├─────────────────────────────────────────┤
│         Backend Layer (Rust)            │
│  ┌──────────┐ ┌──────────┐ ┌─────────┐ │
│  │Commands  │ │  SQLite  │ │  HTTP   │ │
│  └──────────┘ └──────────┘ └─────────┘ │
└─────────────────────────────────────────┘
```

## Composants clés

### Frontend (`src/`)

| Composant                     | Rôle                               |
| ----------------------------- | ---------------------------------- |
| `HeaderAutocomplete.vue`      | Autocomplétion des noms de headers |
| `HeaderValueAutocomplete.vue` | Autocomplétion des valeurs         |
| `HeaderPresetManager.vue`     | Gestion des presets                |
| `RequestTabs.vue`             | Onglets Headers/Body/Params/Auth   |
| `request.ts` (store)          | État de la requête courante        |
| `headerPresets.ts` (store)    | CRUD des presets                   |

### Backend (`src-tauri/src/`)

| Module    | Rôle                                         |
| --------- | -------------------------------------------- |
| `main.rs` | Point d'entrée Tauri                         |
| Commands  | Exposition des fonctions Rust au frontend    |
| SQLite    | Persistance collections, historique, presets |

## Flux de données

### 1. Envoi d'une requête

```
User → RequestTabs → request store → Tauri command → HTTP client → API
                                       ↓
                                  SQLite (historique)
```

### 2. Gestion des presets

```
User → HeaderPresetManager → headerPresets store → Tauri → SQLite
```

### 3. Autocomplétion

```
User input → HeaderAutocomplete → Filtre local (52 headers) → Dropdown
```

## Base de données SQLite

### Tables principales

```sql
-- Collections et folders
- collections
- folders

-- Requêtes sauvegardées
- requests

-- Historique
- history

-- Presets d'en-têtes
- header_presets

-- Environnements
- environments
```

## Gestion d'état (Pinia)

### Store `request`

```typescript
interface RequestState {
  currentRequest: {
    method: HttpMethod;
    url: string;
    headers: HttpHeader[];
    body: string;
    bodyType: 'none' | 'raw' | 'formData' | 'urlEncoded';
    // ...
  };
}
```

### Store `headerPresets`

```typescript
interface HeaderPresetState {
  presets: HeaderPreset[];
  builtinPresets: HeaderPreset[]; // JSON API, Auth Bearer...
  customPresets: HeaderPreset[]; // Créés par l'utilisateur
}
```

## Internationalisation

- **Fichier** : `src/i18n/index.ts`
- **Langues** : EN, FR
- **Structure** : Noms composés (ex: `headerPresetManager.title`)

## Tests

| Type            | Outil          | Localisation             |
| --------------- | -------------- | ------------------------ |
| Unit tests      | Vitest         | `tests/unit/`            |
| Component tests | Vue Test Utils | `tests/unit/components/` |

## Sécurité

- **CSP** : Politique explicite configurée dans `src-tauri/tauri.conf.json` (plus de valeur `null`)
- **IPC** : Communication sécurisée frontend ↔ backend
- **SQL Injection** : Prévention via requêtes paramétrées Rust
- **Secrets d'environnement** : Stockés chiffrés au repos dans SQLite, déchiffrés à la lecture

## Extension future

Points d'extension prévus :

- Plugins (système de plugins Rust)
- Webhooks
- Environments dynamiques
- Team sync (cloud)

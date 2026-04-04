# Guide de démarrage

## Prérequis

- **Node.js** 18+
- **Rust** (pour compiler Tauri)
- **npm** ou **yarn**

## Installation

### 1. Cloner le repository

```bash
git clone https://github.com/bensaadmucret/Rune-API-Client.git
cd "Rune API Client"
```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Lancer en développement

```bash
# Lance le frontend + backend Rust
npm run tauri dev
```

### 4. Build de production

```bash
# Build pour votre OS
npm run tauri build
```

## Structure du projet

```
Rune API Client/
├── src/                    # Frontend Vue.js
│   ├── components/         # Composants Vue
│   │   └── request/       # Composants onglet Request
│   ├── stores/            # Pinia stores
│   │   ├── request.ts     # Store requête courante
│   │   └── headerPresets.ts # Store presets
│   └── i18n/              # Internationalisation
├── src-tauri/             # Backend Rust (Tauri)
│   └── src/               # Commandes Rust, DB SQLite
├── tests/                 # Tests unitaires
│   └── unit/              # Tests Vitest
├── doc/                   # Documentation
└── .notes/                # Notes de développement
```

## Premiers pas

### 1. Créer une requête

1. Saisissez l'URL (ex: `https://api.example.com/users`)
2. Choisissez la méthode HTTP (GET, POST, etc.)
3. Ajoutez des headers via l'onglet **Headers**
4. Cliquez sur **Send**

### 2. Utiliser l'autocomplétion

1. Dans un champ "Header", tapez "cont"
2. Sélectionnez "Content-Type"
3. Les valeurs courantes apparaissent automatiquement

### 3. Sauvegarder un preset

1. Configurez vos headers habituels
2. Cliquez **Manage Presets** → **New Preset**
3. Nommez et sauvegardez

## Raccourcis clavier

| Raccourci      | Action                |
| -------------- | --------------------- |
| `Ctrl + Enter` | Envoyer la requête    |
| `Tab`          | Autocompléter header  |
| `Alt + P`      | Ouvrir Presets        |
| `Alt + B`      | Toggle Bulk Edit      |
| `Escape`       | Fermer dropdown/modal |

## Support

- Documentation : `/doc/` ou [Wiki GitHub](https://github.com/bensaadmucret/Rune-API-Client/wiki)
- Issues : [GitHub Issues](https://github.com/bensaadmucret/Rune-API-Client/issues)

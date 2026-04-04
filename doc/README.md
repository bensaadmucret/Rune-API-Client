# Rune API Client - Documentation

## Table des matières

- [Fonctionnalités Headers](#fonctionnalités-headers)
  - [UC-001: Autocomplétion des Headers](./features/UC001-Header-Autocomplete.md)
  - [UC-002: Header Presets](./features/UC002-Header-Presets.md)
  - [UC-003: Headers Auto-générés](./features/UC003-Auto-Generated-Headers.md)
  - [UC-004: Override des Headers Auto](./features/UC004-Override-Headers.md)
  - [UC-005: Bulk Edit des Headers](./features/UC005-Bulk-Edit.md)
  - [UC-006: Description des Headers](./features/UC006-Header-Description.md)
- [Guide de démarrage rapide](#guide-de-démarrage-rapide)
- [Architecture](./architecture.md)

---

## Guide de démarrage rapide

### Prérequis

- Node.js 18+
- Rust (pour Tauri)
- npm ou yarn

### Installation

```bash
# Cloner le repository
git clone <repository-url>
cd "Rune API Client"

# Installer les dépendances
npm install

# Lancer en mode développement
npm run tauri dev
```

### Structure du projet

```
Rune API Client/
├── src/                    # Frontend Vue.js
│   ├── components/         # Composants Vue
│   ├── stores/            # Pinia stores
│   └── i18n/              # Internationalisation
├── src-tauri/             # Backend Rust (Tauri)
├── tests/                 # Tests unitaires
├── doc/                   # Documentation (ce dossier)
└── .notes/                # Notes de développement
```

---

## Fonctionnalités Headers

### Vue d'ensemble

L'onglet **Headers** de Rune API Client offre 6 fonctionnalités principales pour gérer les en-têtes HTTP de vos requêtes :

| ID     | Fonctionnalité | Description                                                   | Priorité |
| ------ | -------------- | ------------------------------------------------------------- | -------- |
| UC-001 | Autocomplétion | Suggestions intelligentes pour les noms et valeurs de headers | P1       |
| UC-002 | Header Presets | Ensembles de headers réutilisables                            | P1       |
| UC-003 | Headers Auto   | Visualisation des headers auto-générés                        | P2       |
| UC-004 | Override Auto  | Remplacer un header auto par un manuel                        | P2       |
| UC-005 | Bulk Edit      | Édition rapide en format texte/curl                           | P3       |
| UC-006 | Description    | Documentation par header                                      | P4       |

### Navigation rapide

- **Autocomplétion** : Commencez à taper dans un champ "Key" pour voir les suggestions
- **Presets** : Cliquez sur "Presets" pour appliquer un ensemble de headers
- **Headers Auto** : Cliquez sur "Show" dans la section "Auto-generated Headers"
- **Bulk Edit** : Activez le mode "Bulk Edit" pour copier/coller depuis curl

---

## Support

Pour toute question ou problème :

- Consulter la documentation détaillée dans `/doc/features/`
- Vérifier les tests unitaires dans `/tests/unit/components/request/`
- Ouvrir une issue sur GitHub

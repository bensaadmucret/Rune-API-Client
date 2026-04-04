# Rune API Client - Documentation

Bienvenue dans la documentation de **Rune API Client**, un client API moderne inspiré de Postman, développé avec Tauri et Vue.js.

## Fonctionnalités Headers

| ID                                      | Fonctionnalité             | Description                                                        | Priorité |
| --------------------------------------- | -------------------------- | ------------------------------------------------------------------ | -------- |
| [UC-001](UC-001-Autocompletion-Headers) | Autocomplétion des Headers | Suggestions intelligentes pour les noms et valeurs d'en-têtes HTTP | P1       |
| [UC-002](UC-002-Header-Presets)         | Header Presets             | Ensembles de headers réutilisables sauvegardés                     | P1       |
| [UC-003](UC-003-Headers-Auto-Generes)   | Headers Auto-générés       | Visualisation des headers ajoutés automatiquement                  | P2       |
| [UC-004](UC-004-Override-Headers)       | Override des Headers Auto  | Remplacer un header auto par un manuel personnalisé                | P2       |
| [UC-005](UC-005-Bulk-Edit)              | Bulk Edit des Headers      | Édition rapide en format texte/curl                                | P3       |
| [UC-006](UC-006-Description-Headers)    | Description des Headers    | Documentation par header pour le travail d'équipe                  | P4       |

## Table des matières

- [Guide de démarrage rapide](Guide-de-demarrage)
- [Architecture du projet](Architecture)
- [Fonctionnalités Headers](_Sidebar)

## Aperçu des fonctionnalités

### UC-001: Autocomplétion

Commencez à taper dans un champ "Key" pour voir les suggestions de 52 headers HTTP standards. Appuyez sur Tab pour autocompléter.

### UC-002: Header Presets

Sauvegardez des ensembles de headers fréquemment utilisés et appliquez-les en un clic via le dropdown "Presets".

### UC-003: Headers Auto-générés

Visualisez les headers ajoutés automatiquement par l'application (Content-Type, Content-Length, Authorization, etc.).

### UC-004: Override

Remplacez un header auto-généré par un header manuel. Les headers auto overridés sont grisés avec indicateur "overridden".

### UC-005: Bulk Edit

Copiez/collez une liste de headers depuis curl ou un autre outil. Supporte le format `Key: Value` et `curl -H`.

### UC-006: Descriptions

Documentez chaque header avec une description optionnelle. Affichage via tooltip et icône ℹ️.

---

**Dernière mise à jour** : Avril 2026

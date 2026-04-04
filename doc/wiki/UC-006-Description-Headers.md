# UC-006: Description des Headers

## Vue d'ensemble

Documentez l'utilisation de chaque header pour le travail en équipe.

## Comment ajouter

1. Trouvez le header à documenter
2. Cliquez sur l'icône **document** 📄
3. Champ description apparaît sous le header
4. Saisissez votre description
5. Sauvegarde automatique

## Indicateurs

### Icône ℹ️

- Apparaît quand une description existe
- **Tooltip** au survol affiche la description

### Champ description

- Collapsible (se replie/déplie)
- Texte grisé, police plus petite
- Placeholder : "Description..."

## Exemples

### Bonnes pratiques

```
Content-Type: application/json
→ "Format JSON attendu par l'API v2"

Authorization: Bearer {{token}}
→ "Token JWT récupéré depuis /auth/login"

X-API-Key: sk_live_xxx
→ "Clé API de production - NE PAS COMMITTER"
```

### Documentation d'équipe

```
X-Debug-Level: verbose
→ "Activé uniquement pour déboguer l'upload"

X-Cache-Control: no-cache
→ "Forcer le refresh pour les données temps réel"
```

## Persistance

- Sauvegardées avec la requête dans SQLite
- Exportées dans les collections
- Partagées via export/import

## Affichage tooltip

```
┌─────────────────────────────────┐
│  Content-Type: application/json │
│  ─────────────────────────────  │
│  Format JSON attendu par l'API  │
└─────────────────────────────────┘
```

## Fichiers techniques

- `src/components/request/RequestTabs.vue`
- `header.description` - Stockage
- `header.showDescription` - État UI

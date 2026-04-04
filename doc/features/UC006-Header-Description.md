# UC-006: Description des Headers

## Vue d'ensemble

Les **Descriptions de Headers** permettent de documenter l'utilisation de chaque en-tête. Utile pour le travail en équipe et la maintenance à long terme.

## Comment ajouter une description

1. Dans l'onglet **Headers**, trouvez le header à documenter
2. Cliquez sur l'icône **document** 📄 à droite du header
3. Un **champ de description** apparaît sous le header
4. Saisissez votre description
5. La description est **sauvegardée automatiquement**

![Ajout description](./assets/uc006-add-description.gif)

## Indicateurs visuels

### Icône d'information

Quand un header a une description :

- **Icône ℹ️ bleue** apparaît à côté du header
- **Tooltip** au survol affiche la description

![Info icon](./assets/uc006-info-icon.png)

### Champ description

- **Collapsible** : Se replie/déplie avec l'icône document
- **Style** : Texte grisé, police plus petite
- **Placeholder** : "Description..."

## Exemples de descriptions

### Bonnes pratiques

```
Content-Type: application/json
→ "Format JSON attendu par l'API v2"

Authorization: Bearer {{token}}
→ "Token JWT récupéré depuis /auth/login"

X-API-Key: sk_live_xxx
→ "Clé API de production - NE PAS COMMITTER"

X-Request-ID: {{$guid}}
→ "UUID pour tracing distribué (correlation ID)"
```

### Documentation d'équipe

```
X-Debug-Level: verbose
→ "Activé uniquement pour déboguer l'upload (Max: 3 requêtes/jour)"

X-Cache-Control: no-cache
→ "Forcer le refresh pour les données temps réel du dashboard"
```

## Persistance

Les descriptions sont :

- **Sauvegardées** avec la requête dans SQLite
- **Exportées** dans les collections
- **Partagées** avec l'équipe via export/import

## Affichage en tooltip

Au survol du header (ou de l'icône ℹ️) :

```
┌─────────────────────────────────┐
│  Content-Type: application/json │
│  ─────────────────────────────  │
│  Format JSON attendu par l'API  │
└─────────────────────────────────┘
```

## Fichiers techniques

- **Composant** : `src/components/request/RequestTabs.vue`
  - `header.description` - Champ texte
  - `header.showDescription` - État collapsible
  - Icône ℹ️ conditionnelle

## Tests

- **Fichier de test** : `tests/unit/components/request/UC006_HeaderDescription.test.ts`
- Couverture : ajout description, affichage icône, tooltip, persistance

## Cas d'usage

| Scénario         | Description suggérée                         |
| ---------------- | -------------------------------------------- |
| Token temporaire | "Expire après 1h, ne pas cacher"             |
| Header déprécié  | "⚠️ Déprécié, utiliser X-New-Header"         |
| Header interne   | "Usage interne uniquement, pas pour clients" |
| Rate limiting    | "Max 100 req/min, backoff après 429"         |

---

## Voir aussi

- [UC-002: Header Presets](./UC002-Header-Presets.md) - Documenter les presets

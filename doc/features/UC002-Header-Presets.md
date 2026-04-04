# UC-002: Header Presets

## Vue d'ensemble

Les **Header Presets** permettent de sauvegarder et réutiliser des ensembles d'en-têtes HTTP fréquemment utilisés. Cela évite de re-saisir les mêmes headers à chaque requête.

## Comment utiliser

### Appliquer un preset existant

1. Dans l'onglet **Headers**, cliquez sur le bouton **"Presets"**
2. Une **dropdown** s'ouvre avec les presets disponibles
3. Les presets sont organisés en deux catégories :
   - **Built-in** : Presets intégrés (JSON API, Auth Bearer, Form Data)
   - **Custom** : Vos presets personnalisés
4. **Cliquez** sur un preset pour l'appliquer

![Appliquer preset](./assets/uc002-apply-preset.gif)

### Créer un nouveau preset

1. Cliquez sur **"Manage Presets"**
2. Dans le modal, cliquez sur **"New Preset"**
3. Remplissez le formulaire :
   - **Nom** du preset (ex: "API interne")
   - **Description** (optionnel)
   - **Headers** à inclure
4. Cliquez sur **"Create"**

### Gérer vos presets

Dans le modal "Manage Presets" :

- **Éditer** : Crayon 🖉 pour modifier
- **Supprimer** : Poubelle 🗑️ pour supprimer
- **Appliquer** : Bouton "Apply" pour utiliser immédiatement

## Presets intégrés (Built-in)

| Preset          | Headers inclus                                             | Cas d'usage          |
| --------------- | ---------------------------------------------------------- | -------------------- |
| **JSON API**    | Content-Type: application/json<br>Accept: application/json | APIs REST JSON       |
| **Auth Bearer** | Authorization: Bearer {{token}}                            | Authentification JWT |
| **Form Data**   | Content-Type: multipart/form-data                          | Upload de fichiers   |

## Exemples de presets personnalisés

### Exemple 1: API GraphQL

```
Content-Type: application/json
Accept: application/json
X-Requested-With: XMLHttpRequest
```

### Exemple 2: Microservice interne

```
X-API-Key: {{apiKey}}
X-Request-ID: {{$guid}}
X-Correlation-ID: {{correlationId}}
```

### Exemple 3: Développement CORS

```
Origin: http://localhost:3000
Access-Control-Request-Method: POST
Access-Control-Request-Headers: X-Custom-Header
```

## Stockage

- Les presets sont stockés dans **SQLite** (`table header_presets`)
- Persistance entre les sessions
- Synchronisés avec Tauri backend

## Comportement

Quand vous appliquez un preset :

- Les headers du preset **s'ajoutent** à la liste existante
- **Pas de remplacement** des headers actuels
- Les headers **désactivés** dans le preset restent désactivés

## Raccourcis

| Action                   | Raccourci       |
| ------------------------ | --------------- |
| Ouvrir presets           | Alt + P         |
| Appliquer dernier preset | Alt + Shift + P |

## Fichiers techniques

- **Composant** : `src/components/request/HeaderPresetManager.vue`
- **Store** : `src/stores/headerPresets.ts`
- **Tests** : `tests/unit/components/request/HeaderPresetManager.test.ts`

## Cas d'erreur

| Problème             | Solution                                              |
| -------------------- | ----------------------------------------------------- |
| Preset non visible   | Vérifiez qu'il est bien sauvegardé (icône Custom)     |
| Headers en double    | Supprimez manuellement les doublons après application |
| Erreur de sauvegarde | Vérifiez le nom (requis) et les headers validés       |

---

## Voir aussi

- [UC-001: Autocomplétion](./UC001-Header-Autocomplete.md) - Complète les presets avec l'autocomplétion

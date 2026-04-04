# UC-002: Header Presets

## Vue d'ensemble

Les **Header Presets** permettent de sauvegarder et réutiliser des ensembles d'en-têtes HTTP fréquemment utilisés.

## Comment utiliser

### Appliquer un preset

1. Dans l'onglet **Headers**, cliquez sur **"Presets"**
2. Choisissez dans la dropdown :
   - **Built-in** : Presets intégrés
   - **Custom** : Vos presets personnalisés
3. Cliquez pour appliquer

### Créer un preset

1. Cliquez sur **"Manage Presets"**
2. Cliquez sur **"New Preset"**
3. Remplissez :
   - **Nom** (ex: "API interne")
   - **Description** (optionnel)
   - **Headers** à inclure
4. Cliquez **"Create"**

## Presets intégrés

| Preset          | Headers                                                    | Usage                |
| --------------- | ---------------------------------------------------------- | -------------------- |
| **JSON API**    | Content-Type: application/json<br>Accept: application/json | APIs REST JSON       |
| **Auth Bearer** | Authorization: Bearer {{token}}                            | Authentification JWT |
| **Form Data**   | Content-Type: multipart/form-data                          | Upload fichiers      |

## Gérer vos presets

Dans le modal "Manage Presets" :

- 🖉 **Éditer** - Modifier un preset
- 🗑️ **Supprimer** - Supprimer un preset
- **Apply** - Utiliser immédiatement

## Stockage

- Stockés dans **SQLite** (`table header_presets`)
- Persistance entre sessions
- Synchronisés via Tauri backend

## Comportement

- Les headers du preset **s'ajoutent** à la liste existante
- **Pas de remplacement** des headers actuels
- Headers désactivés restent désactivés

## Exemples personnalisés

### API GraphQL

```
Content-Type: application/json
Accept: application/json
X-Requested-With: XMLHttpRequest
```

### Microservice interne

```
X-API-Key: {{apiKey}}
X-Request-ID: {{$guid}}
```

## Fichiers techniques

- `src/components/request/HeaderPresetManager.vue`
- `src/stores/headerPresets.ts`

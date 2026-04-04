# UC-005: Bulk Edit des Headers

## Vue d'ensemble

Le **Bulk Edit** permet d'éditer rapidement une liste d'en-têtes en format texte. Idéal pour copier/coller depuis curl, Postman, ou un autre outil.

## Comment utiliser

### Activer le mode Bulk Edit

1. Dans l'onglet **Headers**, cliquez sur **"Bulk Edit"**
2. L'interface passe en mode **textarea**
3. Le texte actuel des headers est automatiquement généré

![Mode bulk edit](./assets/uc005-bulk-edit.gif)

### Formats supportés

#### Format standard

```
Content-Type: application/json
Authorization: Bearer token123
X-Custom-Header: value
```

#### Format sans espace après le :

```
Content-Type:application/json
Authorization:Bearer token123
```

#### Format espace (sans :)

```
Content-Type application/json
Authorization Bearer token123
```

#### Format curl (import)

```bash
curl -X POST https://api.example.com \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer token123" \
  -d '{"key":"value"}'
```

### Headers désactivés

Pour désactiver un header (sans le supprimer), ajoutez `#` en début de ligne :

```
Content-Type: application/json
# Authorization: Bearer old_token
X-API-Key: secret123
```

→ Le header `Authorization` sera désactivé

### Descriptions inline

Vous pouvez ajouter des descriptions avec `#` à la fin :

```
Content-Type: application/json # Format attendu par l'API
Authorization: Bearer token # Token JWT de l'utilisateur
```

## Copier vers le presse-papiers

1. En mode Bulk Edit, cliquez sur **"Copy"**
2. Le format bulk est copié
3. Collez où vous voulez (documentation, chat, etc.)

## Appliquer les changements

1. Modifiez le texte dans le textarea
2. Cliquez sur **"Apply"**
3. Les headers sont parsés et appliqués
4. Retour automatique au mode table

## Parser intelligent

Le parser gère automatiquement :

- ✓ `Key: Value`
- ✓ `Key:Value`
- ✓ `Key Value`
- ✓ Lignes commentées (`#`)
- ✓ Format curl `-H "Key: Value"`
- ✓ Descriptions inline (`# description`)

## Exemples d'utilisation

### Exemple 1: Copier depuis curl

```bash
# Copiez une commande curl
curl https://api.github.com \
  -H "Accept: application/vnd.github+json" \
  -H "Authorization: Bearer ghp_xxx" \
  -H "X-GitHub-Api-Version: 2022-11-28"

# Collez dans Bulk Edit
# Le parser extrait automatiquement les -H
```

### Exemple 2: Documentation rapide

```
# Créez un template pour votre équipe
Content-Type: application/json # Toujours JSON
X-API-Key: {{apiKey}} # Remplacer par votre clé
X-Request-ID: {{$guid}} # Généré automatiquement
# X-Debug: true # Décommenter pour debug
```

## Fichiers techniques

- **Logique Bulk Edit** : `src/components/request/RequestTabs.vue`
  - `toggleBulkEdit()` - Bascule entre modes
  - `parseBulkHeaders()` - Parse le texte
  - `generateBulkText()` - Génère le texte depuis les headers
  - `copyBulkToClipboard()` - Copie

## Raccourcis

| Action                | Raccourci               |
| --------------------- | ----------------------- |
| Toggle Bulk Edit      | Alt + B                 |
| Copier (en mode bulk) | Ctrl + C puis clic Copy |
| Appliquer             | Alt + Enter             |

## Cas d'erreur

| Problème           | Solution                                       |
| ------------------ | ---------------------------------------------- |
| Format non reconnu | Utilisez `Key: Value` standard                 |
| Headers vides      | Le parser ignore les lignes sans `:` ou espace |
| Perte de données   | Cliquez "Apply" avant de quitter le mode bulk  |

---

## Voir aussi

- [UC-002: Header Presets](./UC002-Header-Presets.md) - Pour des templates réutilisables

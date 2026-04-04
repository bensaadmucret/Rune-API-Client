# UC-005: Bulk Edit des Headers

## Vue d'ensemble

Éditez rapidement une liste d'en-têtes en format texte. Idéal pour copier/coller depuis curl.

## Comment utiliser

1. Dans l'onglet Headers, cliquez sur **"Bulk Edit"**
2. L'interface passe en mode textarea
3. Modifiez le texte
4. Cliquez **"Apply"**

## Formats supportés

### Standard

```
Content-Type: application/json
Authorization: Bearer token123
X-Custom: value
```

### Sans espace

```
Content-Type:application/json
Authorization:Bearer token123
```

### Format curl

```bash
curl -X POST https://api.example.com \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer token123"
```

## Headers désactivés

Ajoutez `#` en début de ligne :

```
Content-Type: application/json
# Authorization: Bearer old_token
X-API-Key: secret123
```

→ `Authorization` sera désactivé

## Descriptions inline

```
Content-Type: application/json # Format attendu par l'API
Authorization: Bearer token # Token JWT
```

## Copier vers presse-papiers

1. Mode Bulk Edit → cliquez **"Copy"**
2. Format bulk copié
3. Collez où vous voulez

## Parser intelligent

Gère automatiquement :

- ✓ `Key: Value`
- ✓ `Key:Value`
- ✓ `Key Value`
- ✓ Lignes `#` commentées
- ✓ Format curl `-H`
- ✓ Descriptions inline

## Raccourcis

| Action           | Raccourci   |
| ---------------- | ----------- |
| Toggle Bulk Edit | Alt + B     |
| Appliquer        | Alt + Enter |

## Fichiers techniques

- `src/components/request/RequestTabs.vue`
- `parseBulkHeaders()` - Parsing
- `generateBulkText()` - Génération

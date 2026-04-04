# UC-004: Override des Headers Auto

## Vue d'ensemble

Remplacez un header auto-généré par un header manuel personnalisé pour les cas avancés.

## Logique d'override

```
Si header MANUEL existe avec même clé qu'un AUTO
→ Le MANUEL prend le dessus
→ L'AUTO est marqué "overridden"
```

## Exemple concret

1. Body JSON → Auto: `Content-Type: application/json`
2. Ajoutez manuellement : `Content-Type: application/vnd.api+json`
3. Résultat :
   - ✅ Envoyé : `application/vnd.api+json`
   - ❌ Auto ignoré : barré + badge "overridden"

## Indicateurs visuels

### Header auto overridé

- Opacité 40%
- Texte **barré**
- Badge **"overridden"** orange
- Background jaune

### Header manuel (override)

- Badge **"override"** orange
- Bouton **"Restore Auto"** ↻

## Restaurer un header auto

1. Trouvez le header manuel avec badge "override"
2. Cliquez sur **"Restore Auto"**
3. Le header manuel est supprimé
4. L'auto redevient actif

## Règles de priorité

### Règle 1 : Manuel > Auto

Un header manuel actif override toujours l'auto correspondant.

### Règle 2 : Dernier gagne

Si plusieurs headers manuels ont la même clé → le dernier est envoyé (standard HTTP).

## Cas d'usage

| Scénario            | Solution                                       |
| ------------------- | ---------------------------------------------- |
| API versionnée      | Override `Accept: application/vnd.api.v2+json` |
| Content-Type custom | `Content-Type: application/hal+json`           |
| Auth alternatif     | Remplacer Bearer par token spécifique          |

## Fichiers techniques

- `src/components/request/RequestTabs.vue`
- `isHeaderOverridden()` - Détection
- `restoreAutoHeader()` - Restauration

# UC-004: Override des Headers Auto

## Vue d'ensemble

L'**Override des Headers Auto** permet de remplacer un header auto-généré par un header manuel personnalisé. C'est utile pour les cas avancés où vous avez besoin de contrôler exactement ce qui est envoyé.

## Comment ça marche

### Logique d'override

```
Si vous ajoutez manuellement un header qui existe en AUTO
→ Le header MANUEL prend le dessus
→ Le header AUTO est marqué "overridden"
```

### Exemple concret

1. Vous avez un body JSON → Auto: `Content-Type: application/json`
2. Vous ajoutez manuellement : `Content-Type: application/vnd.api+json`
3. Résultat :
   - ✅ Envoyé : `Content-Type: application/vnd.api+json`
   - ❌ Auto ignoré : `Content-Type: application/json` (barré)

## Indicateurs visuels

### Sur le header auto

Quand un header auto est overridé :

- **Opacité réduite** (40%)
- **Texte barré** (`line-through`)
- **Badge "overridden"** en orange
- **Background jaune** (#fef3c7)

![Header auto overridé](./assets/uc004-auto-overridden.png)

### Sur le header manuel

Le header manuel qui override affiche :

- **Badge "override"** orange
- **Bouton "Restore Auto"** ↻ pour restaurer

![Header manuel override](./assets/uc004-manual-override.png)

## Restaurer un header auto

Pour revenir au comportement automatique :

1. Trouvez le header manuel avec badge "override"
2. Cliquez sur le bouton **"Restore Auto"** (icône ↻)
3. Le header manuel est supprimé
4. Le header auto redevient actif

### Cas d'usage

- **Test de version d'API** : Override `Accept: application/vnd.api.v2+json`
- **Content-Type custom** : `Content-Type: application/hal+json`
- **Auth alternatif** : Remplacer Bearer par un token spécifique

## Règles de priorité

### Règle 1 : Manuel > Auto

Un header manuel actif override toujours le header auto correspondant.

### Règle 2 : Dernier manuel gagne

Si plusieurs headers manuels ont la même clé → le dernier de la liste est envoyé (standard HTTP).

### Exemple règle 2

```
Headers manuels:
1. Content-Type: application/json (enabled)
2. Content-Type: text/html (enabled)

→ Envoyé: Content-Type: text/html
```

## Fichiers techniques

- **Logique override** : `src/components/request/RequestTabs.vue`
  - `isHeaderOverridden()` - Détecte si un auto est overridé
  - `isManualHeaderOverriding()` - Détecte si un manuel override
  - `restoreAutoHeader()` - Restaure le comportement auto

## Tests

- **Fichier de test** : `tests/unit/components/request/UC004_OverrideHeaders.test.ts`
- Couverture : logique d'override, indicateurs visuels, restauration

## Cas d'erreur

| Problème                   | Solution                                                           |
| -------------------------- | ------------------------------------------------------------------ |
| Override ne fonctionne pas | Vérifiez que le header manuel est **enabled**                      |
| Restauration impossible    | Le bouton "Restore Auto" doit être visible sur le header manuel    |
| Conflit de casse           | L'override est insensible à la casse (content-type = Content-Type) |

---

## Voir aussi

- [UC-003: Headers Auto-générés](./UC003-Auto-Generated-Headers.md) - Comprendre les headers auto

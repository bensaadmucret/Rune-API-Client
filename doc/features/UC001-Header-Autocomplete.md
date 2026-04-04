# UC-001: Autocomplétion des Headers

## Vue d'ensemble

L'autocomplétion des headers permet de saisir rapidement les noms et valeurs d'en-têtes HTTP courants via des suggestions intelligentes.

## Comment utiliser

### Autocomplétion du nom de header (Key)

1. **Cliquez** dans le champ "Header" ou commencez à taper
2. Une **dropdown** apparaît avec les suggestions
3. **Tapez** quelques lettres (ex: "cont") pour filtrer
4. Utilisez les **flèches** ↑↓ pour naviguer
5. Appuyez sur **Tab** ou **Enter** pour sélectionner

![Demo autocomplétion](./assets/uc001-key-autocomplete.gif)

### Autocomplétion de la valeur (Value)

1. **Sélectionnez** d'abord un header (ex: Content-Type)
2. **Cliquez** dans le champ "Value"
3. Les **valeurs courantes** s'affichent (ex: application/json, text/html)
4. **Sélectionnez** la valeur désirée

### Headers supportés

| Header          | Valeurs suggérées                                                      |
| --------------- | ---------------------------------------------------------------------- |
| Content-Type    | application/json, application/xml, text/html, multipart/form-data, ... |
| Authorization   | Bearer {{token}}, Basic {{credentials}}, Token {{token}}               |
| Accept          | application/json, application/xml, text/html, _/_                      |
| Cache-Control   | no-cache, no-store, max-age=3600, ...                                  |
| Accept-Encoding | gzip, deflate, br, identity                                            |

**Liste complète** : 52 headers HTTP standards sont disponibles.

## Raccourcis clavier

| Touche    | Action                        |
| --------- | ----------------------------- |
| `Tab`     | Sélectionner la suggestion    |
| `Enter`   | Sélectionner la suggestion    |
| `Escape`  | Fermer le dropdown            |
| `↑` / `↓` | Naviguer dans les suggestions |

## Exemples d'utilisation

### Exemple 1: Content-Type JSON

```
1. Tapez "cont" dans Key
2. Sélectionnez "Content-Type"
3. La valeur "application/json" est suggérée automatiquement
4. Confirmez avec Tab
```

### Exemple 2: Authorization Bearer

```
1. Tapez "auth" dans Key
2. Sélectionnez "Authorization"
3. Les options Bearer, Basic, Token s'affichent
4. Choisissez "Bearer {{token}}"
```

## Filtre intelligent

Le système filtre les suggestions :

- **Insensible à la casse** : "CONT" trouve "Content-Type"
- **Recherche partielle** : "type" trouve "Content-Type", "Accept-Type", etc.
- **Limité à 10 résultats** pour rester lisible

## Fichiers techniques

- **Composant Key** : `src/components/request/HeaderAutocomplete.vue`
- **Composant Value** : `src/components/request/HeaderValueAutocomplete.vue`
- **Tests** : `tests/unit/components/request/HeaderAutocomplete.test.ts`

## Cas d'erreur

| Problème                  | Solution                                       |
| ------------------------- | ---------------------------------------------- |
| Dropdown ne s'affiche pas | Cliquez dans le champ ou commencez à taper     |
| Suggestion non trouvée    | Vérifiez l'orthographe ou ajoutez manuellement |

---

## Prochaines étapes

- [UC-002: Header Presets](./UC002-Header-Presets.md) - Sauvegardez des ensembles de headers

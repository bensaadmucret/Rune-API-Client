# UC-001: Autocomplétion des Headers

## Vue d'ensemble

L'autocomplétion des headers permet de saisir rapidement les noms et valeurs d'en-têtes HTTP courants via des suggestions intelligentes.

## Comment utiliser

### Autocomplétion du nom (Key)

1. Cliquez dans le champ "Header" ou commencez à taper
2. Une dropdown apparaît avec les suggestions
3. Tapez quelques lettres (ex: "cont") pour filtrer
4. Utilisez les flèches ↑↓ pour naviguer
5. Appuyez sur **Tab** ou **Enter** pour sélectionner

### Autocomplétion de la valeur (Value)

1. Sélectionnez d'abord un header (ex: Content-Type)
2. Cliquez dans le champ "Value"
3. Les valeurs courantes s'affichent
4. Sélectionnez la valeur désirée

## Headers supportés (52 standards)

| Header          | Valeurs suggérées                                                 |
| --------------- | ----------------------------------------------------------------- |
| Content-Type    | application/json, application/xml, text/html, multipart/form-data |
| Authorization   | Bearer {{token}}, Basic {{credentials}}                           |
| Accept          | application/json, application/xml, text/html, _/_                 |
| Cache-Control   | no-cache, no-store, max-age=3600                                  |
| Accept-Encoding | gzip, deflate, br                                                 |

## Raccourcis clavier

| Touche    | Action                        |
| --------- | ----------------------------- |
| `Tab`     | Sélectionner la suggestion    |
| `Enter`   | Sélectionner la suggestion    |
| `Escape`  | Fermer le dropdown            |
| `↑` / `↓` | Naviguer dans les suggestions |

## Exemples

### Content-Type JSON

```
1. Tapez "cont" dans Key
2. Sélectionnez "Content-Type"
3. La valeur "application/json" est suggérée
4. Confirmez avec Tab
```

### Authorization Bearer

```
1. Tapez "auth" dans Key
2. Sélectionnez "Authorization"
3. Choisissez "Bearer {{token}}"
```

## Filtre intelligent

- **Insensible à la casse** : "CONT" trouve "Content-Type"
- **Recherche partielle** : "type" trouve "Content-Type", "Accept-Type"
- **Limité à 10 résultats**

## Fichiers techniques

- `src/components/request/HeaderAutocomplete.vue`
- `src/components/request/HeaderValueAutocomplete.vue`

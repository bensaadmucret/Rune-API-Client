# Guide d'activation du Wiki GitHub

## Activer le Wiki sur GitHub

1. Allez sur votre repository : `https://github.com/bensaadmucret/Rune-API-Client`
2. Cliquez sur **Settings** (paramètres)
3. Descendez jusqu'à **Features** section
4. Cochez **Wikis** pour activer la fonctionnalité

## Méthode 1 : Copier manuellement (recommandée)

Une fois le wiki activé :

1. Cliquez sur l'onglet **Wiki** dans votre repository
2. Cliquez sur **"Create the first page"**
3. Créez les pages suivantes en copiant le contenu des fichiers dans `/doc/wiki/` :
   - `Home` (contenu de `wiki/Home.md`)
   - `UC-001-Autocompletion-Headers` (contenu de `wiki/UC-001.md`)
   - `UC-002-Header-Presets` (contenu de `wiki/UC-002.md`)
   - etc.

## Méthode 2 : Git (avancée)

```bash
# Cloner le wiki comme un repository séparé
git clone https://github.com/bensaadmucret/Rune-API-Client.wiki.git

# Copier les fichiers de documentation
cp -r doc/wiki/* Rune-API-Client.wiki/

# Commit et push
cd Rune-API-Client.wiki
git add .
git commit -m "Ajout de la documentation complète"
git push origin master
```

## Structure du Wiki proposée

```
Wiki/
├── Home.md                     # Page d'accueil
├── _Sidebar.md                 # Barre latérale de navigation
├── UC-001-Autocompletion-Headers.md
├── UC-002-Header-Presets.md
├── UC-003-Headers-Auto-Generes.md
├── UC-004-Override-Headers.md
├── UC-005-Bulk-Edit.md
├── UC-006-Description-Headers.md
├── Guide-de-demarrage.md
└── Architecture.md
```

## Notes

- Les fichiers dans `/doc/` peuvent aussi servir de documentation locale
- Les images/screenshots doivent être hébergées sur GitHub ou dans le wiki

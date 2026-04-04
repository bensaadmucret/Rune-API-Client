#!/bin/bash
# Script d'automatisation pour publier la documentation sur le Wiki GitHub
# Usage: ./publish-wiki.sh [token_github]

set -e

REPO_URL="https://github.com/bensaadmucret/Rune-API-Client.wiki.git"
WIKI_DIR=".wiki-temp"
DOC_SOURCE="doc/wiki"

# Couleurs pour les messages
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Publication du Wiki GitHub...${NC}"

# Vérifier que le dossier source existe
if [ ! -d "$DOC_SOURCE" ]; then
    echo -e "${RED}❌ Dossier $DOC_SOURCE non trouvé${NC}"
    echo "Assurez-vous d'être à la racine du projet"
    exit 1
fi

# Nettoyer le dossier temporaire s'il existe
if [ -d "$WIKI_DIR" ]; then
    echo -e "${YELLOW}🧹 Nettoyage du dossier temporaire...${NC}"
    rm -rf "$WIKI_DIR"
fi

# Cloner le wiki
echo -e "${BLUE}📦 Clonage du wiki...${NC}"
if [ -n "$1" ]; then
    # Avec token
    REPO_URL_WITH_TOKEN="https://$1@github.com/bensaadmucret/Rune-API-Client.wiki.git"
    git clone "$REPO_URL_WITH_TOKEN" "$WIKI_DIR"
else
    git clone "$REPO_URL" "$WIKI_DIR"
fi

# Copier les fichiers
echo -e "${BLUE}📋 Copie des fichiers de documentation...${NC}"
cp "$DOC_SOURCE"/*.md "$WIKI_DIR/"

# Aller dans le dossier wiki
cd "$WIKI_DIR"

# Configurer git si ce n'est pas déjà fait
git config user.email "$(git config --global user.email 2>/dev/null || echo 'wiki@rune-api-client.local')"
git config user.name "$(git config --global user.name 2>/dev/null || echo 'Wiki Bot')"

# Ajouter, commit et push
echo -e "${BLUE}📤 Publication...${NC}"
git add -A
git commit -m "Mise à jour de la documentation - $(date '+%Y-%m-%d %H:%M:%S')" || echo -e "${YELLOW}⚠️  Pas de changements à committer${NC}"
git push origin master

# Revenir à la racine et nettoyer
cd ..
rm -rf "$WIKI_DIR"

echo -e "${GREEN}✅ Wiki publié avec succès !${NC}"
echo -e "${BLUE}🌐 URL: https://github.com/bensaadmucret/Rune-API-Client/wiki${NC}"

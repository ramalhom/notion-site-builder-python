#!/bin/bash

# Script de build de l'image Docker pour Notion Site Builder
# Usage: ./build-image.sh [version]

set -e

# Couleurs pour les messages
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuration
IMAGE_NAME="notion-site-builder"
VERSION=${1:-latest}

echo -e "${BLUE}🐳 Build de l'image Docker${NC}"
echo -e "${BLUE}================================${NC}"

# Vérifier que le fichier .env existe
if [ ! -f .env ]; then
    echo -e "${RED}❌ Erreur: Le fichier .env n'existe pas${NC}"
    echo "Créez un fichier .env avec vos variables Supabase"
    exit 1
fi

# Charger les variables d'environnement
source .env

# Vérifier que les variables sont définies
if [ -z "$VITE_SUPABASE_URL" ] || [ -z "$VITE_SUPABASE_PUBLISHABLE_KEY" ] || [ -z "$VITE_SUPABASE_PROJECT_ID" ]; then
    echo -e "${RED}❌ Erreur: Variables Supabase manquantes dans .env${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Variables d'environnement chargées${NC}"
echo ""

# Build de l'image
echo -e "${BLUE}📦 Construction de l'image...${NC}"
docker build \
  --build-arg VITE_SUPABASE_URL="$VITE_SUPABASE_URL" \
  --build-arg VITE_SUPABASE_PUBLISHABLE_KEY="$VITE_SUPABASE_PUBLISHABLE_KEY" \
  --build-arg VITE_SUPABASE_PROJECT_ID="$VITE_SUPABASE_PROJECT_ID" \
  -t ${IMAGE_NAME}:${VERSION} \
  -t ${IMAGE_NAME}:latest \
  .

echo ""
echo -e "${GREEN}✅ Image construite avec succès!${NC}"
echo ""

# Afficher les informations de l'image
echo -e "${BLUE}📊 Informations de l'image:${NC}"
docker images ${IMAGE_NAME}:${VERSION}

echo ""
echo -e "${GREEN}🎉 Build terminé!${NC}"
echo ""
echo -e "${BLUE}Prochaines étapes:${NC}"
echo "  1. Tester localement:"
echo "     docker run -d -p 3000:80 --name notion-test ${IMAGE_NAME}:${VERSION}"
echo ""
echo "  2. Sauvegarder en fichier:"
echo "     docker save -o ${IMAGE_NAME}-${VERSION}.tar ${IMAGE_NAME}:${VERSION}"
echo ""
echo "  3. Publier sur Docker Hub:"
echo "     docker tag ${IMAGE_NAME}:${VERSION} votre-username/${IMAGE_NAME}:${VERSION}"
echo "     docker push votre-username/${IMAGE_NAME}:${VERSION}"
echo ""

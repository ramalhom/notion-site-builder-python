#!/bin/bash

# Script de déploiement pour Notion Site Builder
# Usage: ./deploy.sh [registry] [version]
# Exemples:
#   ./deploy.sh dockerhub latest
#   ./deploy.sh ghcr v1.0.0
#   ./deploy.sh file latest

set -e

# Couleurs
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Configuration
IMAGE_NAME="notion-site-builder"
REGISTRY=${1:-file}
VERSION=${2:-latest}

echo -e "${BLUE}🚀 Déploiement de l'image Docker${NC}"
echo -e "${BLUE}================================${NC}"
echo ""

# Vérifier que l'image existe
if ! docker images ${IMAGE_NAME}:${VERSION} | grep -q ${IMAGE_NAME}; then
    echo -e "${RED}❌ Erreur: L'image ${IMAGE_NAME}:${VERSION} n'existe pas${NC}"
    echo "Exécutez d'abord: ./build-image.sh ${VERSION}"
    exit 1
fi

case $REGISTRY in
  dockerhub)
    echo -e "${BLUE}📤 Publication sur Docker Hub${NC}"
    echo ""
    
    # Demander le nom d'utilisateur Docker Hub
    read -p "Nom d'utilisateur Docker Hub: " DOCKER_USERNAME
    
    # Se connecter à Docker Hub
    echo -e "${YELLOW}🔐 Connexion à Docker Hub...${NC}"
    docker login
    
    # Tagger l'image
    echo -e "${BLUE}🏷️  Tagging de l'image...${NC}"
    docker tag ${IMAGE_NAME}:${VERSION} ${DOCKER_USERNAME}/${IMAGE_NAME}:${VERSION}
    docker tag ${IMAGE_NAME}:${VERSION} ${DOCKER_USERNAME}/${IMAGE_NAME}:latest
    
    # Publier
    echo -e "${BLUE}📤 Publication...${NC}"
    docker push ${DOCKER_USERNAME}/${IMAGE_NAME}:${VERSION}
    docker push ${DOCKER_USERNAME}/${IMAGE_NAME}:latest
    
    echo ""
    echo -e "${GREEN}✅ Image publiée sur Docker Hub!${NC}"
    echo ""
    echo -e "${BLUE}Pour déployer sur un serveur:${NC}"
    echo "  docker pull ${DOCKER_USERNAME}/${IMAGE_NAME}:${VERSION}"
    echo "  docker run -d -p 80:80 --name notion-app ${DOCKER_USERNAME}/${IMAGE_NAME}:${VERSION}"
    ;;
    
  ghcr)
    echo -e "${BLUE}📤 Publication sur GitHub Container Registry${NC}"
    echo ""
    
    # Demander les informations GitHub
    read -p "Nom d'utilisateur GitHub: " GITHUB_USERNAME
    read -sp "Token GitHub (avec permissions packages): " GITHUB_TOKEN
    echo ""
    
    # Se connecter à GHCR
    echo -e "${YELLOW}🔐 Connexion à GitHub Container Registry...${NC}"
    echo $GITHUB_TOKEN | docker login ghcr.io -u $GITHUB_USERNAME --password-stdin
    
    # Tagger l'image
    echo -e "${BLUE}🏷️  Tagging de l'image...${NC}"
    docker tag ${IMAGE_NAME}:${VERSION} ghcr.io/${GITHUB_USERNAME}/${IMAGE_NAME}:${VERSION}
    docker tag ${IMAGE_NAME}:${VERSION} ghcr.io/${GITHUB_USERNAME}/${IMAGE_NAME}:latest
    
    # Publier
    echo -e "${BLUE}📤 Publication...${NC}"
    docker push ghcr.io/${GITHUB_USERNAME}/${IMAGE_NAME}:${VERSION}
    docker push ghcr.io/${GITHUB_USERNAME}/${IMAGE_NAME}:latest
    
    echo ""
    echo -e "${GREEN}✅ Image publiée sur GitHub Container Registry!${NC}"
    echo ""
    echo -e "${BLUE}Pour déployer sur un serveur:${NC}"
    echo "  docker pull ghcr.io/${GITHUB_USERNAME}/${IMAGE_NAME}:${VERSION}"
    echo "  docker run -d -p 80:80 --name notion-app ghcr.io/${GITHUB_USERNAME}/${IMAGE_NAME}:${VERSION}"
    ;;
    
  file)
    echo -e "${BLUE}💾 Sauvegarde en fichier .tar${NC}"
    echo ""
    
    FILENAME="${IMAGE_NAME}-${VERSION}.tar"
    
    echo -e "${BLUE}📦 Export de l'image...${NC}"
    docker save -o ${FILENAME} ${IMAGE_NAME}:${VERSION}
    
    # Afficher la taille du fichier
    SIZE=$(du -h ${FILENAME} | cut -f1)
    
    echo ""
    echo -e "${GREEN}✅ Image sauvegardée!${NC}"
    echo ""
    echo -e "${BLUE}Fichier créé:${NC} ${FILENAME} (${SIZE})"
    echo ""
    echo -e "${BLUE}Pour déployer sur un serveur:${NC}"
    echo "  1. Transférer le fichier:"
    echo "     scp ${FILENAME} user@serveur:/tmp/"
    echo ""
    echo "  2. Sur le serveur:"
    echo "     docker load -i /tmp/${FILENAME}"
    echo "     docker run -d -p 80:80 --name notion-app ${IMAGE_NAME}:${VERSION}"
    ;;
    
  *)
    echo -e "${RED}❌ Registry inconnu: ${REGISTRY}${NC}"
    echo ""
    echo "Registries disponibles:"
    echo "  dockerhub - Docker Hub (public)"
    echo "  ghcr      - GitHub Container Registry"
    echo "  file      - Fichier .tar (transfert manuel)"
    exit 1
    ;;
esac

echo ""

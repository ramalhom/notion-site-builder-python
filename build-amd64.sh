#!/bin/bash

# Script de build multi-plateforme (AMD64) pour Jelastic
# Usage: ./build-amd64.sh [username] [version]

set -e

DOCKER_USERNAME=${1:-ramalhom}
VERSION=${2:-latest}
IMAGE_NAME="notion-site-builder"

echo "🐳 Build de l'image Docker pour AMD64 (Jelastic)"
echo "==============================================="

# Vérifier buildx
if ! docker buildx version > /dev/null 2>&1; then
    echo "❌ Erreur: Docker Buildx n'est pas installé ou activé."
    exit 1
fi

# Créer un builder si nécessaire
if ! docker buildx ls | grep -q "multiarch"; then
    echo "🏗️  Création d'un builder multi-plateforme..."
    docker buildx create --name multiarch --use
fi

# Build et Push direct (buildx push est plus facile pour le multi-arch)
echo "📦 Construction et publication vers ${DOCKER_USERNAME}/${IMAGE_NAME}:${VERSION} (platform: linux/amd64)..."

# Charger les variables d'environnement pour le build
if [ -f .env ]; then
    source .env
else
    echo "⚠️  Attention: Fichier .env manquant."
fi

docker buildx build \
  --platform linux/amd64 \
  --provenance=false \
  --sbom=false \
  --build-arg VITE_SUPABASE_URL="$VITE_SUPABASE_URL" \
  --build-arg VITE_SUPABASE_PUBLISHABLE_KEY="$VITE_SUPABASE_PUBLISHABLE_KEY" \
  --build-arg VITE_SUPABASE_PROJECT_ID="$VITE_SUPABASE_PROJECT_ID" \
  -t ${DOCKER_USERNAME}/${IMAGE_NAME}:${VERSION} \
  -t ${DOCKER_USERNAME}/${IMAGE_NAME}:latest \
  --push \
  .

echo ""
echo "✅ Image publiée avec succès pour AMD64!"
echo "🚀 Vous pouvez maintenant l'utiliser dans Jelastic avec l'URL complète:"
echo "   docker.io/${DOCKER_USERNAME}/${IMAGE_NAME}:latest"

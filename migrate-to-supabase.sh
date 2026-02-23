#!/bin/bash

# Script de migration vers votre propre instance Supabase
# Usage: ./migrate-to-supabase.sh

set -e

# Couleurs
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}🔄 Migration vers votre instance Supabase${NC}"
echo -e "${BLUE}==========================================${NC}"
echo ""

# Vérifier que Supabase CLI est installé
if ! command -v supabase &> /dev/null; then
    echo -e "${RED}❌ Supabase CLI n'est pas installé${NC}"
    echo ""
    echo "Installation:"
    echo "  macOS: brew install supabase/tap/supabase"
    echo "  Autres: npm install -g supabase"
    exit 1
fi

echo -e "${GREEN}✅ Supabase CLI détecté${NC}"
echo ""

# Demander les informations du nouveau projet
echo -e "${BLUE}📝 Informations du nouveau projet Supabase${NC}"
echo ""
read -p "Project ID (ex: abcdefghijklmnop): " NEW_PROJECT_ID
read -p "Project URL (ex: https://xxxxx.supabase.co): " NEW_URL
read -p "Anon/Public Key: " NEW_ANON_KEY

echo ""
echo -e "${YELLOW}⚠️  Vérifiez ces informations:${NC}"
echo "  Project ID: ${NEW_PROJECT_ID}"
echo "  URL: ${NEW_URL}"
echo ""
read -p "Continuer? (y/n) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Migration annulée"
    exit 1
fi

# Backup de l'ancien .env
if [ -f .env ]; then
    echo -e "${BLUE}💾 Sauvegarde de l'ancien .env...${NC}"
    cp .env .env.backup.$(date +%Y%m%d_%H%M%S)
    echo -e "${GREEN}✅ Backup créé${NC}"
fi

# Mettre à jour .env
echo -e "${BLUE}📝 Mise à jour du fichier .env...${NC}"
cat > .env << EOF
VITE_SUPABASE_PROJECT_ID=${NEW_PROJECT_ID}
VITE_SUPABASE_URL=${NEW_URL}
VITE_SUPABASE_PUBLISHABLE_KEY=${NEW_ANON_KEY}
EOF

echo -e "${GREEN}✅ Fichier .env mis à jour${NC}"

# Mettre à jour config.toml
echo -e "${BLUE}📝 Mise à jour du fichier config.toml...${NC}"
cat > supabase/config.toml << EOF
project_id = "${NEW_PROJECT_ID}"
EOF

echo -e "${GREEN}✅ Fichier config.toml mis à jour${NC}"

# Lier le projet
echo ""
echo -e "${BLUE}🔗 Liaison au nouveau projet Supabase...${NC}"
supabase link --project-ref ${NEW_PROJECT_ID}

# Appliquer les migrations
echo ""
echo -e "${BLUE}📊 Application des migrations SQL...${NC}"
supabase db push

echo ""
echo -e "${GREEN}✅ Migrations appliquées avec succès!${NC}"

# Résumé
echo ""
echo -e "${GREEN}🎉 Migration de la configuration terminée!${NC}"
echo ""
echo -e "${BLUE}Prochaines étapes:${NC}"
echo ""
echo "1. ${YELLOW}Migrer les données${NC}"
echo "   - Exportez les données de votre ancien projet"
echo "   - Importez-les via l'interface Supabase ou SQL"
echo ""
echo "2. ${YELLOW}Migrer les images du storage${NC}"
echo "   - Téléchargez les images du bucket 'site-assets'"
echo "   - Uploadez-les dans le nouveau projet"
echo ""
echo "3. ${YELLOW}Créer un utilisateur admin${NC}"
echo "   - Allez dans Authentication > Users"
echo "   - Créez un nouvel utilisateur"
echo ""
echo "4. ${YELLOW}Tester l'application${NC}"
echo "   - npm run dev"
echo "   - Testez la connexion et les fonctionnalités"
echo ""
echo "5. ${YELLOW}Rebuild l'image Docker${NC}"
echo "   - ./build-image.sh"
echo ""
echo -e "${BLUE}Documentation complète:${NC} Consultez MIGRATION.md"
echo ""

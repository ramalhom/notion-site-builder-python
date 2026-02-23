# 🐳 Docker - Notion Site Builder

Guide complet pour démarrer l'application avec Docker.

## 📋 Prérequis

- Docker 20.10+
- Docker Compose 2.0+
- Compte Supabase avec projet configuré

## 🚀 Démarrage rapide

### 1. Configuration des variables d'environnement

Créez un fichier `.env` à la racine du projet :

```bash
cp .env.example .env
```

Éditez le fichier `.env` avec vos clés Supabase :

```env
VITE_SUPABASE_PROJECT_ID=votre-project-id
VITE_SUPABASE_URL=https://votre-project-id.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=votre-publishable-key
```

### 2. Mode Développement (avec hot-reload)

```bash
# Démarrer l'application en mode développement
docker-compose -f docker-compose.dev.yml up

# Ou en arrière-plan
docker-compose -f docker-compose.dev.yml up -d
```

L'application sera accessible sur : **http://localhost:5173**

### 3. Mode Production

```bash
# Build et démarrage
docker-compose up --build

# Ou en arrière-plan
docker-compose up -d --build
```

L'application sera accessible sur : **http://localhost:3000**

## 📁 Structure des fichiers Docker

```
notion-site-builder/
├── Dockerfile                    # Dockerfile multi-stage (Node.js + Nginx)
├── docker-compose.yml            # Configuration production
├── docker-compose.dev.yml        # Configuration développement
├── .dockerignore                 # Fichiers exclus du build
├── .env.example                  # Template des variables d'environnement
├── .env                          # Vos variables (à créer, non versionné)
└── nginx/
    └── nginx.conf                # Configuration Nginx pour SPA
```

## 🛠️ Commandes utiles

### Développement

```bash
# Démarrer
docker-compose -f docker-compose.dev.yml up

# Arrêter
docker-compose -f docker-compose.dev.yml down

# Voir les logs
docker-compose -f docker-compose.dev.yml logs -f

# Reconstruire
docker-compose -f docker-compose.dev.yml up --build
```

### Production

```bash
# Démarrer
docker-compose up -d

# Arrêter
docker-compose down

# Voir les logs
docker-compose logs -f frontend

# Reconstruire
docker-compose up -d --build

# Redémarrer
docker-compose restart frontend
```

### Maintenance

```bash
# Voir les conteneurs en cours
docker ps

# Voir l'utilisation des ressources
docker stats

# Nettoyer les images inutilisées
docker system prune -a

# Voir l'utilisation disque
docker system df

# Inspecter le conteneur
docker inspect notion-site-builder-frontend
```

## 🔍 Vérification de l'installation

### Health Check

Le conteneur inclut un health check automatique. Vérifiez son statut :

```bash
docker ps
```

La colonne `STATUS` doit afficher `healthy` après ~40 secondes.

### Test manuel

```bash
# Test de l'endpoint
curl http://localhost:3000

# Doit retourner le HTML de l'application
```

## 🐛 Dépannage

### Le conteneur ne démarre pas

```bash
# Vérifier les logs
docker-compose logs frontend

# Vérifier les variables d'environnement
docker-compose config
```

### Erreur de connexion à Supabase

1. Vérifiez que vos clés dans `.env` sont correctes
2. Vérifiez que votre projet Supabase est actif
3. Reconstruisez l'image : `docker-compose up --build`

### Port déjà utilisé

Si le port 3000 ou 5173 est déjà utilisé :

```bash
# Modifier le port dans docker-compose.yml
ports:
  - "80:80"  # Au lieu de 3000:80
```

### Problème de cache

```bash
# Reconstruire sans cache
docker-compose build --no-cache

# Supprimer tous les conteneurs et volumes
docker-compose down -v
```

## 📊 Performance

### Taille de l'image

```bash
# Voir la taille de l'image
docker images | grep notion-site-builder
```

**Taille attendue** : ~40-50 Mo (grâce au multi-stage build)

### Utilisation mémoire

```bash
# Voir l'utilisation mémoire
docker stats notion-site-builder-frontend
```

**Utilisation attendue** : ~20-50 Mo

## 🔐 Sécurité

### Variables d'environnement

- ✅ Le fichier `.env` est dans `.gitignore` (ne sera pas versionné)
- ✅ Utilisez `.env.example` comme template
- ⚠️ Ne commitez JAMAIS vos clés Supabase

### Headers de sécurité

Le fichier `nginx/nginx.conf` inclut des headers de sécurité :

- `X-Frame-Options: SAMEORIGIN`
- `X-Content-Type-Options: nosniff`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`

## 🚀 Déploiement en production

### Sur un serveur

```bash
# 1. Cloner le projet
git clone <votre-repo>
cd notion-site-builder

# 2. Créer le fichier .env
nano .env

# 3. Démarrer en production
docker-compose up -d --build

# 4. Vérifier le statut
docker-compose ps
```

### Avec un reverse proxy (Nginx/Traefik)

Ajoutez un label dans `docker-compose.yml` :

```yaml
labels:
  - "traefik.enable=true"
  - "traefik.http.routers.notion.rule=Host(`votre-domaine.com`)"
```

## 📚 Ressources

- [Documentation Docker](https://docs.docker.com/)
- [Documentation Docker Compose](https://docs.docker.com/compose/)
- [Documentation Supabase](https://supabase.com/docs)
- [Cahier des charges complet](./cahier-des-charges-docker.md)

## ⚙️ Configuration avancée

### Personnaliser Nginx

Éditez `nginx/nginx.conf` pour :
- Modifier le niveau de compression gzip
- Ajouter des règles de cache personnalisées
- Configurer des redirections

### Variables d'environnement supplémentaires

Ajoutez dans `.env` :

```env
# Optionnel
NODE_ENV=production
PORT=3000
```

## 📝 Notes

- **Mode dev** : Les modifications du code sont automatiquement rechargées (hot-reload)
- **Mode prod** : L'application est buildée et servie par Nginx (optimisé)
- **Supabase** : Utilise le service cloud (pas de conteneur local)

---

**Besoin d'aide ?** Consultez le [cahier des charges complet](./cahier-des-charges-docker.md) pour plus de détails.

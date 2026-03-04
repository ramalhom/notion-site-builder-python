# 🚀 Guide de Déploiement - Notion Site Builder

Ce guide vous explique comment créer et déployer l'image Docker de votre application.

---

## 📦 Méthode rapide (Scripts automatisés)

### 1. Build de l'image

```bash
./build-image.sh
```

Ce script va :
- ✅ Vérifier vos variables d'environnement
- ✅ Construire l'image Docker optimisée
- ✅ Afficher les informations de l'image

### 2. Déploiement

#### Option A : Sauvegarder en fichier (transfert manuel)

```bash
./deploy.sh file latest
```

Cela crée un fichier `notion-site-builder-latest.tar` que vous pouvez transférer sur votre serveur.

#### Option B : Publier sur Docker Hub

```bash
./deploy.sh dockerhub latest
```

Vous devrez fournir votre nom d'utilisateur Docker Hub.

#### Option C : Publier sur GitHub Container Registry

```bash
./deploy.sh ghcr latest
```

Vous devrez fournir votre nom d'utilisateur GitHub et un token.

---

## 🔧 Méthode manuelle

### Étape 1 : Build de l'image

```bash
# Charger les variables d'environnement
source .env

# Build de l'image
docker build \
  --build-arg VITE_SUPABASE_URL="$VITE_SUPABASE_URL" \
  --build-arg VITE_SUPABASE_PUBLISHABLE_KEY="$VITE_SUPABASE_PUBLISHABLE_KEY" \
  --build-arg VITE_SUPABASE_PROJECT_ID="$VITE_SUPABASE_PROJECT_ID" \
  -t notion-site-builder:latest \
  .
```

### Étape 2 : Tester localement

```bash
# Lancer le conteneur
docker run -d -p 3000:80 --name notion-test notion-site-builder:latest

# Vérifier que ça fonctionne
curl http://localhost:3000

# Voir les logs
docker logs notion-test

# Arrêter et supprimer
docker stop notion-test
docker rm notion-test
```

### Étape 3 : Déployer

#### Option A : Fichier .tar

```bash
# Exporter l'image
docker save -o notion-site-builder.tar notion-site-builder:latest

# Transférer sur le serveur
scp notion-site-builder.tar user@serveur:/tmp/

# Sur le serveur
ssh user@serveur
docker load -i /tmp/notion-site-builder.tar
docker run -d -p 80:80 --restart unless-stopped --name notion-app notion-site-builder:latest
```

#### Option B : Docker Hub

```bash
# Se connecter
docker login

# Tagger l'image
docker tag notion-site-builder:latest votre-username/notion-site-builder:latest

# Publier
docker push votre-username/notion-site-builder:latest

# Sur le serveur
docker pull votre-username/notion-site-builder:latest
docker run -d -p 80:80 --restart unless-stopped --name notion-app votre-username/notion-site-builder:latest
```

#### Option C : GitHub Container Registry

```bash
# Se connecter (créez un token avec permissions packages)
echo $GITHUB_TOKEN | docker login ghcr.io -u USERNAME --password-stdin

# Tagger l'image
docker tag notion-site-builder:latest ghcr.io/votre-username/notion-site-builder:latest

# Publier
docker push ghcr.io/votre-username/notion-site-builder:latest

# Sur le serveur
docker pull ghcr.io/votre-username/notion-site-builder:latest
docker run -d -p 80:80 --restart unless-stopped --name notion-app ghcr.io/votre-username/notion-site-builder:latest
```

---

## 🌐 Déploiement sur différentes plateformes

### AWS EC2

```bash
# 1. Se connecter à l'instance
ssh -i votre-cle.pem ec2-user@votre-ip

# 2. Installer Docker (si nécessaire)
sudo yum update -y
sudo yum install docker -y
sudo service docker start
sudo usermod -a -G docker ec2-user

# 3. Déployer l'application
docker pull votre-username/notion-site-builder:latest
docker run -d -p 80:80 --restart unless-stopped --name notion-app votre-username/notion-site-builder:latest

# 4. Configurer le pare-feu
# Ouvrir le port 80 dans le Security Group AWS
```

### DigitalOcean Droplet

```bash
# 1. Se connecter au droplet
ssh root@votre-ip

# 2. Installer Docker (si nécessaire)
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# 3. Déployer l'application
docker pull votre-username/notion-site-builder:latest
docker run -d -p 80:80 --restart unless-stopped --name notion-app votre-username/notion-site-builder:latest
```

### Google Cloud Run

```bash
# 1. Tagger l'image pour GCR
docker tag notion-site-builder:latest gcr.io/VOTRE-PROJECT-ID/notion-site-builder:latest

# 2. Publier sur Google Container Registry
docker push gcr.io/VOTRE-PROJECT-ID/notion-site-builder:latest

# 3. Déployer sur Cloud Run
gcloud run deploy notion-site-builder \
  --image gcr.io/VOTRE-PROJECT-ID/notion-site-builder:latest \
  --platform managed \
  --region europe-west1 \
  --allow-unauthenticated \
  --port 80
```

### Heroku (avec Container Registry)

```bash
# 1. Se connecter à Heroku
heroku login
heroku container:login

# 2. Créer l'application
heroku create votre-app-name

# 3. Pousser l'image
heroku container:push web -a votre-app-name

# 4. Déployer
heroku container:release web -a votre-app-name
```

### Virtuozzo Application Platform (Jelastic)

Virtuozzo (anciennement Jelastic) permet de déployer via Docker ou directement via Git.

#### Option A : Déploiement via Docker (Recommandé)

1. **Créer l'environnement** :
   - Cliquez sur **Nouveau Environnement**.
   - Allez dans l'onglet **Docker**.
   - Cliquez sur **Sélectionner une image** et cherchez `docker.io/votre-username/notion-site-builder:latest`.
   - **Important** : Assurez-vous que l'image est bien au format `amd64` (voir section Dépannage).
2. **Configurer les variables d'environnement** :
   - Dans les paramètres du nœud Docker, allez dans **Variables d'environnement**.
   - Ajoutez :
     - `VITE_SUPABASE_URL`
     - `VITE_SUPABASE_PUBLISHABLE_KEY`
     - `VITE_SUPABASE_PROJECT_ID`
3. **Port** : L'application écoute sur le port `80`. Virtuozzo gère automatiquement le routing.
4. **CMD / Entry Point** (si demandé) :
   - **Point d'entrée** : (Laissez vide)
   - **Exécuter la commande** : `/opt/jelastic-python311/bin/python3 -m uvicorn app.main:app --host 0.0.0.0 --port 80`

#### Option B : Déploiement via Git

1. **Créer l'environnement** :
   - Choisissez un nœud **Python 3.11**.
2. **Ajouter le projet** :
   - Cliquez sur **Déployer à partir de Git/SVN**.
   - Renseignez l'URL de votre dépôt.
3. **Configuration** :
   - Jelastic utilisera le `requirements.txt` pour installer les dépendances.
   - Configurez les variables d'environnement dans les paramètres du nœud.
3. **Configuration** :
   - Jelastic utilisera le `requirements.txt` pour installer les dépendances.
   - Configurez les variables d'environnement dans les paramètres du nœud.
   - **Point d'entrée** : (Laissez vide)
   - **Exécuter la commande** : `/opt/jelastic-python311/bin/python3 -m uvicorn app.main:app --host 0.0.0.0 --port 80`

---


## 🔄 Mise à jour de l'application

### Sur le serveur

```bash
# 1. Arrêter le conteneur actuel
docker stop notion-app
docker rm notion-app

# 2. Récupérer la nouvelle version
docker pull votre-username/notion-site-builder:latest

# 3. Redémarrer avec la nouvelle version
docker run -d -p 80:80 --restart unless-stopped --name notion-app votre-username/notion-site-builder:latest

# 4. Nettoyer les anciennes images
docker image prune -a
```

### Script de mise à jour automatique

Créez un fichier `update.sh` sur le serveur :

```bash
#!/bin/bash
docker pull votre-username/notion-site-builder:latest
docker stop notion-app
docker rm notion-app
docker run -d -p 80:80 --restart unless-stopped --name notion-app votre-username/notion-site-builder:latest
docker image prune -af
echo "✅ Application mise à jour!"
```

---

## 🔍 Vérification et monitoring

### Vérifier que l'application fonctionne

```bash
# Vérifier le statut du conteneur
docker ps

# Vérifier les logs
docker logs notion-app

# Vérifier les logs en temps réel
docker logs -f notion-app

# Tester l'endpoint
curl http://localhost
```

### Monitoring des ressources

```bash
# Voir l'utilisation des ressources
docker stats notion-app

# Inspecter le conteneur
docker inspect notion-app
```

---

## 🔐 Sécurité en production

### 3. Utiliser Docker Compose pour la Production (SSL Automatique)

Pour un déploiement avec SSL automatique via Traefik et Let's Encrypt, utilisez le fichier dédié :

```bash
# 1. Créez un fichier .env.prod avec vos variables :
# DOMAIN=votre-domaine.com
# ACME_EMAIL=votre@email.com
# VITE_SUPABASE_URL=...
# VITE_SUPABASE_PUBLISHABLE_KEY=...
# VITE_SUPABASE_PROJECT_ID=...

# 2. Lancez la stack
docker-compose -f docker-compose.prod.yml --env-file .env.prod up -d
```

Ce fichier va :
- Lancer **Traefik** comme reverse proxy.
- Gérer automatiquement le certificat **SSL Let's Encrypt**.
- Rediriger le trafic HTTP vers HTTPS.

---

### 2. Limiter les ressources

```bash
docker run -d \
  -p 80:80 \
  --restart unless-stopped \
  --memory="512m" \
  --cpus="1.0" \
  --name notion-app \
  votre-username/notion-site-builder:latest
```

---

## 📊 Informations sur l'image

### Taille de l'image

```bash
docker images notion-site-builder
```

**Taille attendue** : ~40-50 Mo (grâce au multi-stage build)

### Layers de l'image

```bash
docker history notion-site-builder:latest
```

3. **Plateforme / Architecture** : Si vous construisez l'image sur un Mac (ARM/M1/M2), l'image sera incompatible avec Jelastic (AMD64). Cela peut se traduire par une erreur "image introuvable" ou un crash immédiat.
   - Utilisez le script de build pour AMD64 : `./build-amd64.sh`
4. **URL complète** : Essayez d'utiliser le nom complet du registre : `docker.io/votre-username/notion-site-builder:latest`.
6. **Docker Engine (Alternative recommandée)** : Si l'image refuse toujours de se déployer en tant que "Conteneur Personnalisé" (erreur de modèle d'OS), utilisez un nœud **Docker Engine** :
   - Dans le Marketplace Jelastic, installez **Docker Engine**.
   - Cela crée une instance avec un vrai moteur Docker à l'intérieur.
   - Connectez-vous en SSH à cette instance et lancez votre app normalement :
     ```bash
     docker run -d -p 80:80 \
       -e VITE_SUPABASE_URL="..." \
       -e VITE_SUPABASE_PUBLISHABLE_KEY="..." \
       -e VITE_SUPABASE_PROJECT_ID="..." \
       --name notion-app docker.io/votre-username/notion-site-builder:latest
     ```
   - C'est la méthode la plus robuste car elle ne dépend pas de la virtualisation système de Jelastic.

#### Build optimisé pour Jelastic (AMD64)
J'ai ajouté un script pour faciliter la création d'images compatibles :
```bash
./build-amd64.sh ramalhom latest
```
Ce script utilise `docker buildx` pour garantir que l'image est générée pour l'architecture `linux/amd64` utilisée par Virtuozzo.

## ❓ Dépannage

### L'image est trop volumineuse

```bash
# Reconstruire sans cache
docker build --no-cache -t notion-site-builder:latest .

# Nettoyer les images intermédiaires
docker image prune -a
```

### Le conteneur ne démarre pas

```bash
# Voir les logs
docker logs notion-app

# Inspecter le conteneur
docker inspect notion-app

# Vérifier le health check
docker inspect --format='{{.State.Health.Status}}' notion-app
```

  - Point d'entrée : `python3 -m uvicorn app.main:app --host 0.0.0.0 --port 80`.

### `uvicorn: command not found` sur Jelastic

Si vous obtenez cette erreur dans les logs Jelastic lors du déploiement via Git :

1. **Utilisez le chemin absolu de Python** : Sur Jelastic, `python3` peut pointer vers une version différente de celle où vos packages sont installés. Utilisez le chemin complet identifié dans votre traceback :
   - Commande : `/opt/jelastic-python311/bin/python3 -m uvicorn app.main:app --host 0.0.0.0 --port 80`
2. **Trouver le bon chemin** : Si l'erreur persiste, tapez cette commande en SSH pour trouver le chemin exact de votre binaire Python :
   ```bash
   which python3
   # ou
   find /opt/jelastic-python* -name python3
   ```
3. **Vérifiez l'installation** : Connectez-vous en SSH à votre instance et vérifiez si les dépendances sont installées :
   ```bash
   pip3 list | grep uvicorn
   ```
3. **Forcer l'installation** : Si uvicorn n'est pas présent, lancez manuellement l'installation depuis la racine de votre projet :
   ```bash
   pip3 install -r requirements.txt
   ```
4. **Vérifiez le dossier de travail** : Assurez-vous que la commande est lancée depuis `/var/www/webroot/ROOT` (ou le dossier où se trouve votre code).
5. **Dossiers manquants (Erreur StaticFiles)** : Si vous avez une erreur `RuntimeError: Directory 'app/static' does not exist`, c'est parce que Git n'envoie pas les dossiers vides. Créez-le manuellement en SSH :
   ```bash
   mkdir -p /var/www/webroot/ROOT/app/static
   ```

### Déboguer le démarrage sur Jelastic

Si vous voyez uniquement des logs comme `Stopping httpd` / `Starting httpd` :

Les logs que vous regardez sont probablement les **logs système (syslog)** qui indiquent simplement que le service Apache de Jelastic a redémarré. Pour voir les erreurs de votre commande Uvicorn :

1. **Cherchez le fichier `run.log`** : 
   - Dans le tableau de bord Jelastic, allez dans l'onglet **Logs**.
   - Cherchez un fichier nommé `run.log`, `node.log` ou `stdout`. C'est là que Uvicorn écrit ses erreurs.
2. **Tester manuellement via SSH (Recommandé)** :
   - Connectez-vous en SSH à votre nœud.
   - Allez dans le répertoire racine : `cd /var/www/webroot/ROOT`.
   - Lancez la commande manuellement pour voir l'erreur en direct :
     ```bash
     python3 -m uvicorn app.main:app --host 0.0.0.0 --port 80
     ```
   - Si une dépendance manque ou s'il y a une erreur de syntaxe, elle s'affichera immédiatement ici.
3. **Le port 80** : Sur un nœud natif Jelastic, le port 80 est souvent déjà pris par Apache. Si vous voulez utiliser Uvicorn, vous devrez peut-être utiliser un autre port interne (ex: 8080) ou passer sur un environnement **Docker** (Option A) qui est plus adapté pour FastAPI.

---

## 🧪 Guide de Tests Manuels

### 1. Test Local (Docker)
Avant de déployer, vérifiez que l'image fonctionne sur votre machine :

```bash
# Lancer le conteneur avec vos variables .env
docker run -d \
  -p 3000:80 \
  --env-file .env \
  --name notion-test \
  ramalhom/notion-site-builder:latest

# Vérifier si l'app répond
curl http://localhost:3000

# Voir les logs en direct pour détecter des erreurs
docker logs -f notion-test
```

### 2. Test SSL / Production (Traefik)
Si vous utilisez `docker-compose.prod.yml`, vérifiez que Traefik gère bien le SSL :

```bash
# Voir les logs de Traefik pour les certificats Let's Encrypt
docker logs traefik

# Vérifier la configuration des routes (si vous avez accès au port 8080 en SSH)
curl http://localhost:8080/api/rawdata
```

### 3. Test sur Jelastic (SSH)
Pour vérifier que l'environnement Jelastic est correct sans passer par l'interface :

```bash
# Vérifier la présence des fichiers
ls -la /var/www/webroot/ROOT

# Tester la connexion à Supabase depuis le conteneur
docker exec -it notion-site-builder-app env | grep VITE_SUPABASE

# Tester manuellement la commande de démarrage (voir section Dépannage)
```

---

## 📚 Ressources

- [Documentation Docker](https://docs.docker.com/)
- [Docker Hub](https://hub.docker.com/)
- [GitHub Container Registry](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry)
- [Guide Docker complet](./DOCKER.md)
- [Cahier des charges](./cahier-des-charges-docker.md)

---

**Besoin d'aide ?** Consultez les logs avec `docker logs notion-app` ou ouvrez une issue sur GitHub.

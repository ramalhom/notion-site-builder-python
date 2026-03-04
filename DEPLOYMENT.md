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
   - Cliquez sur **Sélectionner une image** et cherchez `votre-username/notion-site-builder:latest` (ou utilisez une image publique).
2. **Configurer les variables d'environnement** :
   - Dans les paramètres du nœud Docker, allez dans **Variables d'environnement**.
   - Ajoutez :
     - `VITE_SUPABASE_URL`
     - `VITE_SUPABASE_PUBLISHABLE_KEY`
     - `VITE_SUPABASE_PROJECT_ID`
3. **Port** : L'application écoute sur le port `80`. Virtuozzo gère automatiquement le routing.
4. **CMD / Entry Point** (si demandé) :
   - **Point d'entrée** : (Laissez vide)
   - **Exécuter la commande** : `python3 -m uvicorn app.main:app --host 0.0.0.0 --port 80`

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
   - **Exécuter la commande** : `python3 -m uvicorn app.main:app --host 0.0.0.0 --port 80`

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

### 1. Utiliser HTTPS avec Let's Encrypt

Utilisez un reverse proxy comme Nginx ou Traefik :

```yaml
# docker-compose.yml avec Traefik
version: '3.8'

services:
  traefik:
    image: traefik:v2.10
    command:
      - "--providers.docker=true"
      - "--entrypoints.web.address=:80"
      - "--entrypoints.websecure.address=:443"
      - "--certificatesresolvers.letsencrypt.acme.email=votre@email.com"
      - "--certificatesresolvers.letsencrypt.acme.storage=/letsencrypt/acme.json"
      - "--certificatesresolvers.letsencrypt.acme.httpchallenge.entrypoint=web"
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
      - ./letsencrypt:/letsencrypt

  app:
    image: votre-username/notion-site-builder:latest
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.app.rule=Host(`votre-domaine.com`)"
      - "traefik.http.routers.app.entrypoints=websecure"
      - "traefik.http.routers.app.tls.certresolver=letsencrypt"
```

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

---

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

1. **Utilisez le module python** : Remplacez `uvicorn` par `python3 -m uvicorn` dans votre commande de démarrage. Cela garantit que le binaire est cherché dans le bon environnement Python.
2. **Vérifiez l'installation** : Connectez-vous en SSH à votre instance et vérifiez si les dépendances sont installées :
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

## 📚 Ressources

- [Documentation Docker](https://docs.docker.com/)
- [Docker Hub](https://hub.docker.com/)
- [GitHub Container Registry](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry)
- [Guide Docker complet](./DOCKER.md)
- [Cahier des charges](./cahier-des-charges-docker.md)

---

**Besoin d'aide ?** Consultez les logs avec `docker logs notion-app` ou ouvrez une issue sur GitHub.

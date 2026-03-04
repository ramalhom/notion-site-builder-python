# 🚀 Guide de Déploiement - Notion Site Builder

Ce guide vous explique comment créer, publier et déployer votre application Notion Site Builder.

---

## 🏗️ 1. Construction et Publication (Build & Push)

Le moyen le plus simple est d'utiliser les scripts automatisés pour garantir la compatibilité (notamment pour les serveurs AMD64/Virtuozzo).

### Build pour Jelastic/AMD64 (Recommandé)
Si vous êtes sur Mac (M1/M2/M3), utilisez ce script pour générer une image compatible avec les serveurs standards :
```bash
./build-amd64.sh ramalhom latest
```

### Publication sur Docker Hub
```bash
# Se connecter (une seule fois)
docker login

# Pousser l'image
docker push ramalhom/notion-site-builder:latest
```

---

## 🌐 2. Déploiement en Production (SSL Automatique)

C'est la méthode recommandée pour avoir HTTPS fonctionnel immédiatement avec **Caddy**.

### Pré-requis sur le serveur
- Docker et Docker Compose installés.
- Les ports **80** et **443** ouverts.
- Votre domaine pointant vers l'IP du serveur (Record A).

### Installation
1. Copiez les fichiers `docker-compose.prod.yml`, `Caddyfile` et votre `.env` sur le serveur.
2. Configurez votre `.env` :
   ```env
   DOMAIN=votre-domaine.ch
   ACME_EMAIL=votre-email@exemple.com
   ```
3. Lancez l'application :
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

---

## 🛠️ 3. Gestion et Mise à jour

### Mettre à jour l'application
Quand vous publiez une nouvelle image sur Docker Hub, lancez ceci sur le serveur :
```bash
docker-compose -f docker-compose.prod.yml pull
docker-compose -f docker-compose.prod.yml up -d
docker image prune -f
```

### Voir les logs
```bash
# Logs de l'application
docker logs -f notion-site-builder-prod

# Logs de Caddy (pour le SSL)
docker logs -f caddy
```

---

## ❓ Dépannage

### Base de données persistante
La base de données est stockée dans le dossier `./database` sur votre serveur. Elle survit aux redémarrages et aux mises à jour.

### SSL / HTTPS ne fonctionne pas
1. Vérifiez que votre domaine pointe bien sur l'IP du serveur (utilisez `ping votre-domaine.ch`).
2. Vérifiez les logs de Caddy : `docker logs caddy`.
3. Assurez-vous d'avoir bien mis votre email dans le `.env` pour Let's Encrypt.

### Architecture incompatible
Si vous voyez une erreur "Exec format error", c'est que l'image n'est pas en AMD64. Recommencez le build avec `./build-amd64.sh`.

---

**Besoin d'aide ?** Consultez les logs ou contactez l'administrateur.

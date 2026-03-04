# 🚀 Notion Site Builder (Python)

Transformez vos pages Notion en un site web élégant et performant avec une interface d'administration complète.

## 🌟 Qu'est-ce que c'est ?

Notion Site Builder est une application full-stack (FastAPI + React) qui permet de :
- **Publier vos pages Notion** sous forme de site web avec votre propre domaine.
- **Gérer un menu de navigation** personnalisé (ordonnancement, emojis, liens externes).
- **Personnaliser l'apparence** (nom du site, logo via emoji ou URL).
- **Interface Admin** : Un tableau de bord sécurisé pour tout configurer sans toucher au code.

## ✨ Fonctionnalités Clés

- 🔐 **Sécurité** : Authentification Robuste avec JWT et hachage BCrypt.
- 📁 **Menu Dynamique** : Créez des menus multiniveaux, gérez l'ordre et l'affichage.
- 🎨 **Logo Flexible** : Utilisez un emoji ou une image via URL pour votre identité visuelle.
- 🚀 **Déploiement Docker** : Image optimisée (< 50Mo) et prête pour la production.
- 🛡️ **SSL Automatique** : Intégration Caddy pour des certificats Let's Encrypt sans effort.
- 💾 **Persistance** : Base de données SQLite persistante via volumes Docker.

## 📦 Déploiement Rapide

Le déploiement est optimisé pour utiliser **Docker Hub** et **Caddy**.

### 1. Préparation
Assurez-vous d'avoir un fichier `.env` avec votre configuration domaine :
```env
DOMAIN=votre-domaine.ch
ACME_EMAIL=admin@votre-domaine.ch
```

### 2. Lancement
Utilisez Docker Compose pour lancer la stack complète avec SSL automatique :
```bash
docker-compose -f docker-compose.prod.yml up -d
```

### 3. Premier accès
Rendez-vous sur `https://votre-domaine.ch/setup` pour créer votre compte administrateur.

---

## 📖 Documentation Complète

Pour plus de détails techniques et les instructions étape par étape :
- [**Guide de Déploiement détaillé**](./DEPLOYMENT.md) : Build AMD64, publication Docker Hub, et dépannage.
- [**Documentation Docker**](./DOCKER.md) : Structure technique des containers.

---

*Développé avec ❤️ pour simplifier la publication de contenu Notion.*

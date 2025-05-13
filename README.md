# 🧠 Reddit-Clone – Plateforme Communautaire Moderne

Application web inspirée de Reddit, permettant la création et la gestion de communautés, la publication de contenus, l’interaction sociale (commentaires, votes), et la gestion des utilisateurs.

---

## 🚀 Fonctionnalités

- 🔐 Authentification (inscription, connexion via JWT)
- 🧑‍🤝‍🧑 Gestion de communautés (création, adhésion, navigation)
- 📝 Création et affichage de posts (texte, images, vidéos, fichiers, audio)
- 💬 Système de commentaires imbriqués (threaded)
- ⬆️⬇️ Upvotes / Downvotes sur posts et commentaires
- 👥 Profils utilisateurs avec statistiques
- ⚖️ Modération des communautés (modérateurs, règles)
- 🧭 Navigation dynamique (communautés, posts, profils)
- 📱 UI responsive avec une expérience utilisateur fluide

---

## 🛠 Technologies

### ⚛️ Frontend

- **Next.js** (React 19, TypeScript)
- **TailwindCSS**, Heroicons, Lucide, React Icons
- **React Hook Form** & **Zod** (validation)
- **Axios** / fetch natif (API)
- **React Hot Toast** (notifications)

### 🧩 Backend

- **Strapi v5** (Node.js, TypeScript)
- **PostgreSQL** (via package `pg`)
- **Plugin Users & Permissions** pour gestion des utilisateurs
- **API REST sécurisée** générée automatiquement
- **JWT** pour l'authentification
- **Upload de médias** (images, vidéos, etc.)
- **Gestion des rôles & permissions**

---

## 📁 Structure du Projet

```bash
├── frontend/
│   ├── components/
│   │   ├── post/                 # PostCard, PostDetail, PostForm
│   │   ├── community/            # CommunityMenu, CommunityForm, etc.
│   │   ├── comments/             # CommentThread, CommentForm
│   │   ├── auth/                 # AuthModal, LoginForm, RegisterForm
│   │   └── profile/              # Profil utilisateur
│   ├── pages/                    # Pages dynamiques Next.js
│   └── public/                   # Fichiers statiques (avatars, logos)
│
├── backend/
│   ├── src/
│   │   ├── api/                  # Collections (posts, communautés, etc.)
│   │   ├── config/               # CORS, plugins, base de données
│   │   └── extensions/           # Custom routes/controllers (si nécessaire)
│   └── uploads/                  # Fichiers et médias
│
└── README.md                     # Ce fichier
```

---

## ⚙️ Installation

### 1. Cloner le projet

```bash
git clone https://github.com/ton-utilisateur/reddit-clone.git
cd reddit-clone
```

### 🧑‍💻 Lancement du Frontend

```bash
cd frontend
npm install
npm run dev
```
👉 L'application frontend sera disponible sur : http://localhost:3000

### 🛠 Configuration & Lancement du Backend

**Prérequis**  
PostgreSQL installé et base de données créée

**Étapes**

```bash
cd backend
npm install
npm run develop
```
👉 L’administration Strapi sera accessible ici : http://localhost:1337/admin

---

## ✅ Utilisation de l'application

### 🔐 Authentification

- Connexion / inscription via une modal dédiée
- Stockage du token JWT dans le localStorage
- Requêtes sécurisées avec en-tête Authorization

### 🎯 Fonctionnalités principales

- Créer et rejoindre des communautés
- Publier des posts (texte ou médias)
- Réagir via commentaires imbriqués
- Voter positivement ou négativement
- Consulter et modifier son profil
- Rôles utilisateurs : utilisateur, modérateur, admin

---

## 📦 Scripts Utiles

### Frontend

```bash
npm run dev       # Démarre le serveur de développement
npm run build     # Build production
npm run start     # Lance l'app en production
```

### Backend

```bash
npm run develop   # Lancer Strapi en mode développement
npm run build     # Compiler l’administration Strapi
npm run start     # Lancer Strapi en production
```

---

## 🧱 Base de Données – Collections principales

- **users** : Utilisateurs (via plugin Users & Permissions)
- **posts** : Contenus liés à une communauté et un auteur
- **communities** : Espaces communautaires thématiques
- **comments** : Réponses threadées aux posts
- **votes** : Upvotes / downvotes liés aux users et aux contenus

---

## 🔒 Prérequis Techniques

- Node.js ≥ 18
- PostgreSQL (8+ recommandé)
- npm ≥ 8
- Strapi CLI installé

---

## 🎯 Objectif

Créer une plateforme communautaire moderne, inspirée de Reddit, avec une architecture headless et une interface réactive, centrée sur l’interaction sociale, la liberté de publication et la personnalisation des communautés.

---

## 🤝 Contributions

Les pull requests sont bienvenues !  
Forkez le projet, proposez des fonctionnalités ou signalez des bugs.
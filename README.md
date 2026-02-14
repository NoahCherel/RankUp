# RankUp - Application Mobile Padel

## 📱 À propos

RankUp est une marketplace mobile (iOS/Android) de "Coaching-Action" dédiée au Padel. L'application met en relation des joueurs amateurs avec des joueurs expérimentés agissant comme "Mentors".

## 🚀 Démarrage rapide

### Prérequis

- Node.js 20+
- npm ou yarn
- Expo CLI (`npm install -g expo-cli`)
- Un projet Firebase configuré

### Installation

```bash
# Cloner le repository
git clone https://github.com/your-repo/rankup.git
cd rankup/app

# Installer les dépendances
npm install

# Configurer l'environnement
cp .env.example .env
# Éditer .env avec vos clés Firebase
```

### Lancement

```bash
# Mode développement (Web)
npm start -- --web

# Mode développement (iOS/Android)
npm start

# Puis scanner le QR code avec Expo Go
```

## 🏗️ Architecture

```
src/
├── components/         # Composants réutilisables
│   └── ui/            # Button, TextInput, LoadingSpinner
├── config/            # Configuration (Firebase)
├── navigation/        # React Navigation
├── screens/           # Écrans de l'application
├── theme/             # Design System (couleurs, spacing)
├── types/             # TypeScript types
└── utils/             # Utilitaires (validation, formatters)
```

## 🎨 Design System

- **Background**: `#0F172A` (Dark Slate)
- **Primary**: `#EAB308` (Yellow - Couleur balle Padel)
- **Secondary**: `#38BDF8` (Sky Blue - Profils vérifiés)

## 🔧 Technologies

- **Frontend**: React Native + Expo
- **Backend**: Firebase (Auth, Firestore, Storage)
- **Paiement**: Stripe Connect
- **Navigation**: React Navigation

## 📋 User Stories (MVP)

- [x] US #1 - Infrastructure & Authentification
- [x] US #2 - Profil Utilisateur Unifié
- [x] US #3 - Marketplace & Filtres
- [x] US #4 - Intégration Stripe
- [ ] US #5 - Workflow Réservation
- [ ] US #6 - Messagerie & Avis
- [ ] US #7 - Finitions & Demo

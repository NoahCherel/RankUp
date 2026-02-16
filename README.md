# RankUp — Marketplace Padel Coaching

> Application mobile & web de "Coaching-Action" dédiée au Padel.  
> Mise en relation de joueurs amateurs avec des Mentors expérimentés.

---

## Stack technique

| Couche       | Technologie                                          |
| ------------ | ---------------------------------------------------- |
| Frontend     | React Native 0.81 · Expo SDK 54 · TypeScript         |
| Backend      | Firebase (Auth, Firestore, Storage, Cloud Functions)  |
| Paiement     | Stripe Connect Express (15 % commission plateforme)   |
| Navigation   | React Navigation (NativeStack)                       |
| Plateformes  | iOS · Android · Web (responsive 480 px centré)        |

---

## Architecture projet

```
RankUp/
├── app/                          # Application Expo
│   ├── App.tsx                   # Point d'entrée, AuthStateListener
│   ├── src/
│   │   ├── components/
│   │   │   ├── booking/          # CourtSelector, ReviewModal
│   │   │   ├── marketplace/      # MentorCard, FilterBar, FilterModal, SearchBar
│   │   │   ├── payment/          # PaymentModal (.native / .web)
│   │   │   ├── profile/          # AvatarPicker, MentorToggle, PadelSelectors, NationalitySelector
│   │   │   └── ui/               # Button, TextInput, BottomTabBar, WebLayout, LoadingSpinner, DateTimePicker
│   │   ├── config/firebase.ts    # Initialisation Firebase
│   │   ├── navigation/           # AppNavigator (Auth → Onboarding → Main)
│   │   ├── screens/              # 14 écrans (Auth, Home, Marketplace, Booking, Chat, Profile…)
│   │   ├── services/             # userService, bookingService, messagingService, reviewService, paymentService
│   │   ├── theme/                # Design tokens (couleurs, spacing, border radius)
│   │   ├── types/                # TypeScript interfaces (UserProfile, Booking, Conversation, Review…)
│   │   └── utils/                # validation.ts, formatters.ts, seedData.ts
│   └── package.json
├── functions/                    # Cloud Functions (europe-west1)
│   └── src/index.ts              # createStripeConnectedAccount, createPaymentIntent, onBooking triggers
├── firestore.rules               # Règles de sécurité Firestore
├── storage.rules                 # Règles de sécurité Storage
├── firebase.json                 # Configuration Firebase
└── Docs/                         # Documentation projet (specs, design, plan de dev)
```

---

## Setup local

### Prérequis

- **Node.js** ≥ 20
- **npm** ≥ 10
- Projet Firebase créé (Blaze plan pour Cloud Functions)
- Compte Stripe (clés test)

### Installation

```bash
# 1. Cloner le repository
git clone https://github.com/NoahCherel/RankUp.git
cd RankUp/app

# 2. Installer les dépendances app
npm install

# 3. Installer les dépendances Cloud Functions
cd ../functions && npm install && cd ../app

# 4. Lancer en mode web
npx expo start --web

# 5. Lancer sur mobile (scanner QR avec Expo Go)
npx expo start
```

### Déployer les Cloud Functions

```bash
cd functions
npm run build
firebase deploy --only functions
```

### Déployer les règles de sécurité

```bash
firebase deploy --only firestore:rules
firebase deploy --only storage
```

---

## Variables d'environnement

Créer `app/.env` avec :

```env
# Firebase
FIREBASE_API_KEY=your-api-key
FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_STORAGE_BUCKET=your-project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=123456789
FIREBASE_APP_ID=1:123456789:web:abcdef

# Stripe
STRIPE_PUBLISHABLE_KEY=pk_test_...
```

> **Note :** Les clés sont actuellement en dur dans `config/firebase.ts` pour le MVP.  
> En production, migrer vers `expo-constants` + variables d'environnement.

---

## Structure Firestore

| Collection                         | Description                                           |
| ---------------------------------- | ----------------------------------------------------- |
| `users/{userId}`                   | Profil unifié (joueur + mentor si `isMentor: true`)   |
| `bookings/{bookingId}`             | Réservation (studentId, mentorId, date, status, prix) |
| `conversations/{conversationId}`   | En-tête conversation (participants[], lastMessage)     |
| `conversations/{id}/messages/{id}` | Messages individuels (senderId, text, createdAt)       |
| `reviews/{reviewId}`               | Avis post-session (bookingId, rating 1-5, comment)     |

---

## Design System — "Night Padel Aesthetic"

| Token          | Valeur      | Usage                        |
| -------------- | ----------- | ---------------------------- |
| `background`   | `#0F172A`   | Fond principal (Slate 900)   |
| `surface`      | `#1E293B`   | Cartes, modales (Slate 800)  |
| `primary`      | `#EAB308`   | Boutons, accents (Yellow)    |
| `secondary`    | `#38BDF8`   | Badges vérifiés (Sky 400)    |
| `text`         | `#F8FAFC`   | Texte principal (Slate 50)   |
| `textSecondary`| `#94A3B8`   | Texte secondaire (Slate 400) |
| `error`        | `#EF4444`   | Erreurs (Red 500)            |
| `success`      | `#22C55E`   | Succès (Green 500)           |

---

## Tests

```bash
cd app
npx jest --config jest.config.js
```

Les tests couvrent :

- Validation (email, password, profil, formulaires)
- Formatters (prix, dates, initiales, étoiles)
- Logique métier filtres (ranking, prix, ligue)
- Logique annulation booking (règle 48 h)
- Commission Stripe (15 %)
- Seed data (compteurs)

---

## Seed Data (démo)

Le bouton **"Charger données démo"** sur le HomeScreen injecte dans Firestore :

- 5 mentors avec profils complets
- 3 utilisateurs
- 6 réservations (pending / confirmed / completed)
- 4 conversations avec messages réalistes
- 8 avis

---

## User Stories — État final

| US   | Titre                         | Statut | Notes                                        |
| ---- | ----------------------------- | ------ | -------------------------------------------- |
| US 1 | Infrastructure & Auth         | ✅     | Email/password complet · Social login stub   |
| US 2 | Profil Utilisateur Unifié     | ✅     | Photo, nationalité, ligue, classement, switch mentor |
| US 3 | Marketplace & Filtres         | ✅     | Recherche nom, filtres ranking/prix/ligue    |
| US 4 | Intégration Stripe            | ✅     | Connect Express + PaymentIntent · Commission 15 % |
| US 5 | Workflow Réservation          | ✅     | Création → confirmation/rejet → complétion   |
| US 6 | Messagerie & Avis             | ✅     | Chat temps réel · Notation 1-5 étoiles       |
| US 7 | Finitions & Demo              | ✅     | Tests, seed data, règles sécurité, README    |

---

## Limites connues (MVP)

- **Push notifications** : FCM token non enregistré côté client (dead code)
- **Stripe webhooks** : non implémentés (confirmation manuelle uniquement)
- **Social login** (Google/Apple) : stubs présents, non connectés
- **Refund Stripe** : non implémenté sur annulation
- **Config Firebase** : clés en dur (acceptable pour MVP académique)

---

## Auteur

**Noah Cherel** — Projet académique  
Repository : [github.com/NoahCherel/RankUp](https://github.com/NoahCherel/RankUp)

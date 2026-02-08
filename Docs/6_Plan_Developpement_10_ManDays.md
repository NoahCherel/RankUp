# Plan de Développement RankUp - MVP Académique

**Projet :** RankUp (2 crédits HUB)
**Développeur :** 1 personne
**Durée totale :** 10 man-days
**Conversion :** 1 man-day ≈ 7 heures de travail effectif

---

## US #1 - Infrastructure & Authentification
**Estimation : 1.5 man-days**
**Labels :** `setup`, `auth`, `size:L`

**Description :**
Mise en place de l'environnement technique et du système d'authentification.

**Tâches :**
- [ ] Init projet Expo + React Native + dépendances
- [ ] Configuration Firebase (Auth, Firestore, Storage)
- [ ] Fichier `.env` et arborescence projet
- [ ] Écrans Login/Signup (Email + Social)
- [ ] Navigation de base

**Livrable :** Utilisateur peut créer un compte et se connecter.

---

## US #2 - Profil Utilisateur Unifié
**Estimation : 1 man-day**
**Labels :** `frontend`, `firestore`, `size:M`

**Description :**
Création et édition du profil avec concept de compte unifié.

**Tâches :**
- [ ] Onboarding (Nom, Prénom, Classement)
- [ ] Upload photo de profil
- [ ] Toggle "Mode Mentor" + champ Tarif
- [ ] Stockage Firestore

**Livrable :** Profil complet modifiable.

---

## US #3 - Marketplace & Filtres
**Estimation : 1.5 man-days**
**Labels :** `frontend`, `firestore`, `size:L`

**Description :**
Liste des mentors avec recherche et filtres.

**Tâches :**
- [ ] Requête Firestore (Mode Mentor = true)
- [ ] Composant Card + Design System
- [ ] Filtres (Classement, Ville, Prix, Type)
- [ ] Vue détaillée profil

**Livrable :** Recherche et consultation des mentors.

---

## US #4 - Intégration Stripe
**Estimation : 2 man-days**
**Labels :** `backend`, `stripe`, `size:XL`

**Description :**
Système de paiement sécurisé.

**Tâches :**
- [ ] Config Stripe Dashboard
- [ ] Payment Sheet (React Native)
- [ ] Connect Express (Mentor)
- [ ] Cloud Function : commission 15%
- [ ] Tests sandbox

**Livrable :** Paiement fonctionnel.

---

## US #5 - Workflow Réservation
**Estimation : 1.5 man-days**
**Labels :** `backend`, `frontend`, `size:L`

**Description :**
Demande et validation de session.

**Tâches :**
- [ ] Écran réservation (date, type, lieu)
- [ ] Booking Firestore (statut pending)
- [ ] Notifications Push
- [ ] Accept/Refus par Mentor

**Livrable :** Flux de réservation complet.

---

## US #6 - Messagerie & Avis
**Estimation : 1.5 man-days**
**Labels :** `frontend`, `firestore`, `size:L`

**Description :**
Chat post-réservation et système de notation.

**Tâches :**
- [ ] Collection messages + interface chat
- [ ] Temps réel (onSnapshot)
- [ ] Modal notation (⭐ 1-5)
- [ ] Historique réservations

**Livrable :** Communication et feedback.

---

## US #7 - Finitions & Demo
**Estimation : 1 man-day**
**Labels :** `qa`, `docs`, `size:M`

**Description :**
Stabilisation et préparation soutenance.

**Tâches :**
- [ ] Tests E2E
- [ ] Corrections bugs
- [ ] Seed données test
- [ ] README + slides demo

**Livrable :** Application stable et démontrable.

---

# 📊 Récapitulatif

| US | Description | Man-Days |
|----|-------------|----------|
| #1 | Infrastructure & Auth | 1.5 |
| #2 | Profil Unifié | 1 |
| #3 | Marketplace & Filtres | 1.5 |
| #4 | Intégration Stripe | 2 |
| #5 | Workflow Réservation | 1.5 |
| #6 | Messagerie & Avis | 1.5 |
| #7 | Finitions & Demo | 1 |
| **TOTAL** | **7 US** | **10 man-days** |

---

# 🏷️ Labels GitHub

| Label | Estimation |
|-------|------------|
| `size:M` | 1 man-day |
| `size:L` | 1.5 man-days |
| `size:XL` | 2 man-days |

---

# 📋 Colonnes GitHub Projects

1. **Backlog** → 2. **To Do** → 3. **In Progress** → 4. **Review** → 5. **Done**

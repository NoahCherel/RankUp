# Slides de Soutenance — RankUp

> Structure des slides pour la démo de soutenance.  
> Temps estimé : 15–20 minutes.

---

## Slide 1 — Titre

- **RankUp** — Marketplace de Coaching Padel
- Noah Cherel
- Date de soutenance
- Logo / Visuel padel

---

## Slide 2 — Le Problème

- Le padel est le sport à la croissance la plus rapide en Europe
- Les joueurs amateurs veulent progresser mais n'ont pas accès à du coaching abordable
- Les joueurs expérimentés pourraient monétiser leur expertise
- Pas de plateforme dédiée au coaching "pair-à-pair" en padel

---

## Slide 3 — La Solution : RankUp

- Marketplace mobile mettant en relation **amateurs** et **mentors** expérimentés
- Modèle "Coaching-Action" : sessions de jeu avec conseils en temps réel
- Tout intégré : profils, réservation, paiement, messagerie, avis
- Commission de 15 % sur chaque session

---

## Slide 4 — Démo Live

### Parcours 1 : Inscription → Profil
1. Créer un compte (email/password)
2. Compléter le profil (photo, nationalité, ligue, classement)
3. Activer le mode mentor (prix, description)

### Parcours 2 : Marketplace → Réservation
4. Explorer la marketplace (recherche, filtres)
5. Voir le détail d'un mentor
6. Réserver une session (date, terrain, paiement Stripe)

### Parcours 3 : Post-booking
7. Messagerie temps réel entre élève et mentor
8. Confirmer/compléter la session
9. Laisser un avis (1-5 étoiles)

---

## Slide 5 — Architecture Technique

```
┌──────────────┐    ┌───────────────────┐    ┌──────────────┐
│  Expo App    │◄──►│  Firebase          │◄──►│  Stripe      │
│  (RN + TS)   │    │  Auth / Firestore  │    │  Connect     │
│  iOS/Android │    │  Storage / FCF     │    │  Express     │
│  Web         │    └───────────────────┘    └──────────────┘
└──────────────┘
```

- **Frontend** : React Native 0.81 + Expo SDK 54 + TypeScript
- **Backend** : Firebase (Auth, Firestore, Storage, Cloud Functions)
- **Paiement** : Stripe Connect Express (15 % commission)
- **Multi-plateforme** : iOS, Android, Web (responsive 480px)

---

## Slide 6 — Choix Techniques

| Décision                        | Justification                                      |
| ------------------------------- | -------------------------------------------------- |
| Expo (pas bare RN)              | Itération rapide, OTA updates, web support         |
| Firebase (pas custom backend)   | Serverless, realtime, auth intégré, gratuit MVP    |
| Stripe Connect (pas PayPal)     | Standard marketplace, KYC automatique, EU support  |
| TypeScript (pas JS)             | Typage fort, refactoring sûr, documentation code   |
| Platform-split files (.native)  | Stripe SDK différent web vs mobile                 |

---

## Slide 7 — Structure des données

```
Firestore
├── users/{userId}              # Profil unifié joueur + mentor
├── bookings/{bookingId}        # Réservation (status workflow)
├── conversations/{convId}      # En-tête conversation
│   └── messages/{msgId}        # Messages individuels
└── reviews/{reviewId}          # Avis post-session
```

- Règles de sécurité Firestore déployées
- Chaque utilisateur ne peut accéder qu'à ses données
- Messages protégés par liste de participants

---

## Slide 8 — User Stories & Couverture

| US | Titre                    | Statut | Détails clés                              |
|----|--------------------------|--------|-------------------------------------------|
| 1  | Infrastructure & Auth    | ✅     | Firebase Auth email · Structure projet     |
| 2  | Profil Unifié            | ✅     | Photo, ligue, classement, switch mentor    |
| 3  | Marketplace & Filtres    | ✅     | Recherche, filtre ranking/prix/ligue       |
| 4  | Stripe                   | ✅     | Connect Express, PaymentIntent, 15 %       |
| 5  | Workflow Réservation     | ✅     | pending → confirmed → completed           |
| 6  | Messagerie & Avis        | ✅     | Chat realtime, notation 1-5 étoiles        |
| 7  | Finitions & Demo         | ✅     | Tests E2E, seed data, sécurité, README     |

---

## Slide 9 — Qualité & Tests

- **61 console statements** supprimés (code propre)
- **Tests unitaires** : validation, formatters, filtres, commissions
- **Seed data** : 5 mentors, 3 users, 6 bookings, 4 conversations, 8 reviews
- **Règles de sécurité** Firestore & Storage configurées
- **Web responsive** : layout centré 480px, hover states, accessibilité
- **Bug fixes** : filtre ranking (logique inversée), IDs ligue (mismatch corrigé)

---

## Slide 10 — Limites & Évolutions

### Limites MVP
- Push notifications (FCM token non enregistré)
- Webhooks Stripe (confirmation manuelle)
- Social login (stubs Google/Apple non connectés)
- Pas de refund automatique sur annulation

### Évolutions futures
- Système de matching IA (recommandation de mentors)
- Calendrier de disponibilités mentor
- Géolocalisation des terrains (Google Maps)
- Programme de fidélité / gamification
- Notifications push FCM complètes
- Panel admin pour modération

---

## Slide 11 — Conclusion

- MVP fonctionnel couvrant **7 User Stories**
- Application **multi-plateforme** (iOS, Android, Web)
- Architecture **scalable** (Firebase serverless)
- Paiement **sécurisé** (Stripe Connect)
- Prêt pour une **phase beta** avec vrais utilisateurs

---

## Slide 12 — Questions

Merci pour votre attention !

- Repository : [github.com/NoahCherel/RankUp](https://github.com/NoahCherel/RankUp)
- Stack : Expo · Firebase · Stripe · TypeScript

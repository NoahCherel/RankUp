# Document de Spécifications Fonctionnelles & Techniques : RankUp

**Version :** 1.0
**Date :** 21/12/2025
**Statut :** MVP (Minimum Viable Product)

---

## 1. Vision du Produit
**RankUp** est une place de marché mobile (iOS/Android) permettant à tout joueur de Padel de réserver un partenaire mieux classé ("Boost") pour un tournoi, ou un coach/sparring partner pour progresser.
L'objectif est de démocratiser l'accès à la compétition et au progrès, tout en offrant aux bons joueurs une source de revenus sécurisée via une infrastructure de confiance.

---

## 2. Stratégie de Rétention (Anti-Contournement)
*Réponse spécifique à la problématique : "Pourquoi rester sur l'app après la 1ère rencontre ?"*

Pour qu'un utilisateur reste, la valeur perçue de la plateforme doit être supérieure à l'économie de la commission (15%).

### A. Pour le "Pro" (Celui qui se fait payer) : La Réputation
Le vrai capital d'un Pro, c'est sa crédibilité.
*   **Avis Certifiés & Note :** Seuls les matchs payés via RankUp permettent au client de laisser un avis. Un profil avec "50 matchs, 4.9/5" peut facturer plus cher qu'un profil vide. Passer en direct, c'est perdre l'opportunité de construire cette vitrine.
*   **Badge "Fiabilité" :** Un indicateur automatique (ex: "100% Honoré") pour les Pros qui n'annulent jamais. C'est un argument de vente massif pour rassurer les clients.
*   **Simplification Administrative :** L'appli génère un récapitulatif annuel des revenus pour ses déclarations.

### B. Pour le Client (Celui qui paie) : L'Escrow & Le Suivi
*   **Sécurité des Fonds (Escrow) :** L'argent est bloqué sur un compte de séquestre (Stripe) et n'est versé au Pro qu'une fois la prestation réalisée. Si le Pro ne vient pas (No-Show), le client est remboursé en un clic. En direct, l'acompte liquide est perdu.
*   **Historique de Progression (V1.5) :** Chaque match booké sur RankUp alimente un historique d'activité. L'utilisateur peut **déclarer manuellement** son résultat ("Vainqueur P250") pour son suivi personnel (gamification declarative).
*   **Fidélité (Loyalty) :** "Le 10ème match sans commission".

---

## 3. Parcours Utilisateurs (User Flows)

### 3.1. Onboarding
1.  **Splash Screen** (Logo RankUp).
2.  **Auth :** Connexion Google / Apple / Email.
    *   Nom, Prénom, Nationalité, Âge.
    *   Ligue, Comité, Club (Optionnel).
    *   Niveau estimé ou Classement officiel (ex: 500, P250).
    *   Photo (Obligatoire).
    *   **Mode Pro (Activation) :** Upload justificatif (Licence/Ten'Up + ID) + Tarif.

### 3.2. Flow Réservation (Client)
1.  **Recherche :** Filtre par Localisation, Date, Niveau min du partenaire.
2.  **Sélection :** Vue liste des profils validés avec Prix, Note, Badge "Vérifié".
3.  **Détail Profil :** Bio, Stats, Avis, Dispos.
4.  **Demande de Booking :** Choix du créneau + Type (Tournoi ou Coaching).
5.  **Paiement (Pre-Auth) :** Carte bancaire via Stripe. L'argent est "réservé" mais non débité (ou débité et séquestré).
6.  **Attente Validation :** Le Pro a 24h pour accepter.

### 3.3. Flow Mission (Pro)
1.  **Notification :** "Nouvelle demande de match avec Julien (Niveau 8)."
2.  **Acceptation/Refus :** Le Pro valide la demande.
3.  **Chat Débloqué :** Une fois validé, le chat s'ouvre pour régler les détails (Lieu exact, qui inscrit l'équipe au tournoi, etc.).
4.  **Jour J :** Match.
5.  **Clôture :** Le lendemain, demande de confirmation "Le match a-t-il eu lieu ?".
6.  **Paiement :** Virement du montant net (Prix - Commission) sur le compte Stripe Connect du Pro sous 3-7 jours.

---

## 4. Fonctionnalités MVP (Périmètre Semaine 1-3)

### Core Features
*   [x] **Authentification :** Firebase Auth.
*   [x] **Profil Utilisateur :** (Photo, Bio, Classement, Tarif).
*   [x] **Marketplace :** Liste des joueurs avec filtres basiques.
*   [x] **Vérification (Back-office) :** Interface admin simple pour valider manuellement les documents des Pros et attribuer le badge "Checked".
*   [x] **Paiement :** Stripe Payment Sheet (Mobile) + Stripe Connect (Onboarding Express pour les Pros).
*   [x] **Messagerie :** Chat basique (Texte) actif uniquement après paiement.
*   [x] **Système d'Avis :** Note (1-5 étoiles) + Commentaire post-match.

### Exclus (Reporter à V2)
*   [ ] Scraping automatique FFT / Résultats officiels (Pas d'API disponible).
*   [ ] Gestion native des tableaux de tournois (Trop variable).
*   [ ] Assurance Annulation (Besoin de volume pour négocier avec un assureur).

---

## 5. Architecture Technique

### Stack
*   **Mobile :** React Native avec **Expo** (Gestion simplifiée des builds iOS/Android).
    *   *Pourquoi ?* Vitesse de dév, mises à jour "Over-the-air" (OTA).
*   **Backend :** **Firebase** (Serverless).
    *   **Firestore :** Base de données NoSQL (Flexible pour les profils).
    *   **Cloud Functions :** Logique métier sensible (Calcul commission, déclenchement paiement Stripe, notifications).
    *   **Storage :** Hébergement des photos de profil/justificatifs.
*   **Paiement :** **Stripe**.

### Modèle de Données (Firestore Simplifié)

**`users`**
```json
{
  "uid": "user123",
  "displayName": "Noah C.",
  "age": 28,
  "nationality": "FR",
  "league": "PACA",
  "committee": "Alpes-Maritimes",
  "roles": ["player", "pro"], // Peut être les deux
  "globalRanking": 500,
  "bestRanking": 450,
  "points": 1250,
  "isVerified": true, // Validé par Admin
  "pricePerMatch": 50,
  "stripeAccountId": "acct_...",
  "fcmToken": "token_pour_notifs",
  "rating": 4.8,
  "reviewCount": 12
}
```

**`bookings`**
```json
{
  "id": "book_xyz",
  "clientId": "user_abc", // Le payeur
  "proId": "user_123",    // Le bénéficiaire
  "status": "pending",    // pending, confirmed, completed, cancelled, disputed
  "amountTotal": 50,
  "appFee": 7.5,
  "date": "2025-12-25T14:00:00Z",
  "tournamentName": "P250 Antibes", // Optionnel
  "stripePaymentIntentId": "pi_..."
}
```

---

## 6. Politique d'Annulation (Règles Métier)
*   **Annulation Client > 48h :** Remboursement 100%.
*   **Annulation Client < 48h :** Remboursement 50% (Le Pro garde une indemnité).
*   **Annulation Pro :** Remboursement Intégral Client + "Strike" sur le profil du Pro.
*   **3 Strikes :** Suspension du compte Pro.

---

## 7. Roadmap de Développement (3 Semaines)

*   **Semaine 1 : Architecture & User**
    *   [ ] Init Expo + Firebase.
    *   [ ] Auth Screens (Login/Signup).
    *   [ ] Profile Screen (Edit/View) + Upload Photo.
*   **Semaine 2 : Marketplace & Booking**
    *   [ ] Home Screen (Feed des Pros).
    *   [ ] Detail Screen.
    *   [ ] Intégration Stripe (Paiement Client).
*   **Semaine 3 : Pro Flow & Polish**
    *   [ ] Stripe Connect (Paiement Pro).
    *   [ ] Gestion des réservations (Accept/Refus).
    *   [ ] Chat minimale.
    *   [ ] Soumission Stores (Apple/Google).

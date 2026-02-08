# Analyse du Projet d'Application Padel (RankUp / PadelUp)

Basée sur la transcription de vos échanges.

## 1. Synthèse du Concept
**Promesse :** Une plateforme (Marketplace) connectant des joueurs amateurs (Clients) à des joueurs bien classés (Partenaires/Pros).
**Offres :**
1.  **"Boost" en Tournoi :** Le client paie pour faire équipe avec un fort joueur en tournoi officiel, profitant de son classement pour entrer dans des tableaux plus élevés et glaner des points.
2.  **Coaching / Sparring :** Le client paie pour une séance d'entraînement ou un match d'exercice.
**Cible :** Marché français (démarrage PACA), joueurs classés (top 200-3000 comme prestataires).
**Tech :** Mobile First (React Native), Backend Firebase, Paiement Stripe.

## 2. Points Forts
*   **Problème Réel & Validé :** Le "marché gris" (paiement en cash de partenaires forts) existe déjà. L'appli apporte structure, visibilité et sécurité à une pratique informelle.
*   **Double Proposition de Valeur :**
    *   *Pour le Pro :* Revenus complémentaires, remplissage de l'agenda, sécurité de paiement (fini les lapins ou les impayés).
    *   *Pour l'Amateur :* Accès à des tournois inaccessibles seul, progression accélérée, plaisir de jouer avec un "top player".
*   **Timing :** Le Padel est en pleine explosion en France.
*   **MVP Réaliste :** Techniquement, une marketplace de services (réservation + paiement) est tout à fait faisable en 3 semaines avec une stack Agile (Expo/Firebase).

## 3. Zones d'Ombres & Risques (À Discuter)

### A. Vérification des Classements (Crucial)
*   **Le problème :** Si je paie pour un "Top 200", je veux être sûr qu'il est Top 200.
*   **La question :** Comment vérifie-t-on le classement ?
    *   *Manuel ?* (Upload d'une capture d'écran de la licence FFT ?)
    *   *Automatique ?* (Existe-t-il une API publique ou un scraping possible du site de la FFT ?)
*   **Recommandation MVP :** Validation manuelle des "Pros" au début pour garantir la qualité.

### B. Logistique des Tournois
*   **Le problème :** L'appli gère la rencontre et le paiement, mais l'inscription au tournoi se fait en dehors (Juge-Arbitre, Ten'Up, etc.).
*   **Risque :** Le duo est formé sur l'appli, mais le tournoi est complet ou l'inscription est ratée.
*   **Solution proposée :** L'appli sert uniquement à "booker" le partenaire. L'inscription au tournoi reste la responsabilité du binôme (souvent gérée par le Pro qui a ses entrées). Il faut des clauses de remboursement claires si l'inscription au tournoi échoue.

### C. Gestion des Annulations (No-Show)
*   **Le problème :** Un joueur (Client ou Pro) annule à la dernière minute.
*   **Risque :** Si c'est le Pro qui annule la veille d'un tournoi, le Client est furieux (il a peut-être posé sa journée).
*   **Solution :** Politique d'annulation stricte. Pénalités financières pour le Pro qui annule sans force majeure ?

### D. Contournement (Disintermédiation)
*   **Le risque :** Après une première mise en relation via l'appli (et 15% de com), les joueurs s'échangent leurs numéros et passent en direct pour les fois suivantes.
*   **Parade :** C'est inévitable à long terme, mais on peut le limiter en offrant de la valeur ajoutée dans l'appli (historique des perfs, assurance blessure, facilité de paiement, gamification/badge "Coach Vérifié").

### E. Statut Légal des "Pros"
*   **Point de vigilance :** Les joueurs recevant de l'argent doivent pouvoir facturer ou déclarer ces revenus. L'application agit comme intermédiaire de paiement (comme Uber ou Airbnb). Il faudra être clair dans les CGU que le Pro est responsable de ses déclarations fiscales.

## 4. Prochaines Étapes
Si vous êtes en phase avec cette analyse, je peux passer à la rédaction du **Document de Spécifications** (Implementation Plan) qui détaillera :
1.  Les parcours utilisateurs (User Flows) précis.
2.  La liste des fonctionnalités MVP vs V2.
3.  Le modèle de données final.
4.  L'architecture technique.

Qu'en pensez-vous ? Souhaitez-vous approfondir un de ces points avant que je rédige le plan ?

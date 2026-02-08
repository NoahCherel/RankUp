RankUp : Le "Uber" du Padel
Document de Synthèse & Vision Projet Date : 21/12/2025 Version : 1.2 (Master - Solopreneur Edition)

1. Executive Summary
RankUp est la première application mobile dédiée à la mise en relation sécurisée entre joueurs de padel pour le coaching en situation réelle et l'expérience compétitive. Elle répond à un besoin critique du marché : comment progresser et apprendre aux côtés d'un partenaire expérimenté ? En structurant un "marché gris" existant, RankUp apporte confiance, cadre et pédagogie.

2. Le Problème & La Solution
Le Problème
Pour l'Amateur (Client) : Difficile de s'inscrire à des gros tournois (P100, P250, P500) sans un coéquipier bien classé. La progression est bloquée.
Pour le Bon Joueur (Partenaire/Pro) : Difficulté à monétiser son talent en dehors des cours officiels. Risque d'impayés (lapins) lors des arrangements informels.
Opacité : Pas de visibilité sur qui est disponible, à quel prix, et quel niveau réel.
La Solution RankUp
Une Marketplace mobile (iOS/Android) qui positionne le service comme du "Coaching Partagé" ou du "Sparring" :

Centralise l'offre : Liste des joueurs partenaires classés par niveau, tarif et localisation.
Sécurise la transaction : Paiement bloqué (Escrow).
Encadre la pratique : Positionnement éthique ("Jouer avec un Mentor").
3. Fonctionnalités Clés (MVP)
3.1 Profils Unifiés
Il n'y a pas de compte "Pro" vs "Client". Chaque utilisateur est un joueur (Unified Account) qui peut :

Réserver (Acheter) : Payer un partenaire pour un tournoi ou une séance.
Se Vendre (Vendre) : Activer le "Mode Pro" en uploadant ses justificatifs (Licence FFT) pour recevoir des demandes.
Exemple : Un joueur Top 500 peut vendre ses services à un débutant le samedi, et acheter les services d'un Top 50 le dimanche.
3.2 Marketplace & Recherche
Filtres : Localisation (Ville + Rayon), Date, Niveau (ex: "Cherche partenaire Top 200 min").
Transparence : Affichage clair du tarif (ex: 50€/match) et des notes/avis.
Réservation : Demande de créneau -> Validation par le Pro (24h) -> Paiement séquestré.
3.3 Certification & Sécurité
Certifie les profils : Vérification d'identité et de niveau.
Smart Hack MVP : Utilisation d'une IA (Vision API) pour analyser automatiquement les captures d'écran Ten'Up et certifier le classement sans intervention humaine lourde.
Suivi Déclaratif : L'application ne se connecte pas à la FFT (pas d'API). L'utilisateur déclare ses résultats ("Vainqueur P250").
Disclaimer : "Les performances affichées constituent un historique personnel déclaratif et non une validation officielle FFT."
4. Business Model & Rétention
Modèle Économique
Commission : 15% (estimé) sur chaque transaction, prélevée côté client ou partagée.
Évolution (V2) : Introduction d’un Abonnement Pro (ex: 29€/mois) avec commission réduite (5%) ou plafonnée pour fidéliser les "Top Performers" et éviter le contournement.
Flux Financier : Le client paie 50€ -> RankUp garde 7.50€ -> Le Pro reçoit 42.50€.
Stratégie Anti-Contournement (Pourquoi rester ?)
La question critique : "Pourquoi ne pas passer en direct après le premier match ?"

Réputation (Le CV Sportif) : Un Pro a besoin d'avis certifiés ("5 étoiles, ponctuel, pédagogue") pour justifier son tarif. Seuls les matchs payés sur l'app génèrent des avis.
Sécurité (Escrow) : En direct, le client risque de payer un acompte à un inconnu qui ne vient pas. Sur RankUp, si le Pro ne vient pas ("No-Show"), le client est remboursé instantanément.
Fidélité : Programme de points ou gratuité au 10ème match pour encourager l'usage répété.
5. Architecture Technique
Mobile : React Native (Expo) pour lancer iOS + Android simultanément.
Backend : Firebase (Auth, Firestore, Storage, Functions).
Paiement : Stripe Connect.
6. Risques & Mitigations (Stratégique)
Positionnement Moral & Fédéral
Risque : Être perçu comme une plateforme de "Pay-to-Win" (Achat de points).
Mitigation : Wording strict. On ne vend jamais de "points" ou de "classement". On vend de l'Expérience, du Mentorat et du Coaching en match officiel.
Pivot : Si blocage fédéral, l'app pivote instantanément en "Marketplace de Sparring 100% Coaching" hors tournoi.
Juridique & Responsabilité
Clause de non-responsabilité : RankUp est un intermédiaire technique. RankUp n'est pas organisateur de tournois et ne garantit aucun résultat sportif.
Responsabilité Civile : Case à cocher obligatoire à l'inscription : "Je certifie disposer d'une licence FFT en cours et décharge RankUp de toute responsabilité en cas de blessure."
Clause Anti-Corruption : Interdiction explicite dans les CGU de tout arrangement sur le score. Le Mentor doit jouer à son maximum.
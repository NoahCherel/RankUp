RankUp est une marketplace mobile (iOS/Android) de "Coaching-Action" dédiée au Padel. L'application met en relation des joueurs amateurs souhaitant progresser en compétition avec des joueurs expérimentés (haut de classement) agissant comme "Mentors" ou "Sparring-Partners"

Contrairement aux cours traditionnels sur simulateur ou panier, RankUp se concentre sur l'apprentissage en situation réelle : le Mentor est rémunéré pour disputer un match de tournoi ou d'entraînement aux côtés de l'utilisateur. La plateforme sécurise la transaction via un système de séquestre (Escrow) et structure le marché informel du "partenariat de haut niveau" en offrant un cadre de confiance, des avis certifiés et un historique de progression (CV Sportif). L'objectif est de fluidifier l'accès aux tournois officiels pour les joueurs isolés tout en permettant aux joueurs de haut niveau de monétiser leur expertise.
Objectifs

4 crédits HUB répartie sur 2 projets.

Une application et un serveur capable de gérer authentification, système de paiement, et une mise en relation directe entre joueurs pour réserver un partenaire de niveau supérieur.

But de l'appli: 
Démocratiser l'accès à la performance : Permettre à tout joueur, quel que soit son réseau, de trouver un partenaire de haut niveau pour franchir un palier technique en compétition.

Sécuriser le marché gris : Remplacer les arrangements informels sur WhatsApp par une plateforme de paiement sécurisée garantissant la présence du partenaire (anti-no-show).

Valoriser l'expertise : Offrir une source de revenus complémentaire aux joueurs classés via un statut de "Mentor" valorisant leur pédagogie.

Dynamiser l'écosystème Padel : Augmenter le nombre d'inscriptions en tournois officiels en levant le frein du "manque de partenaire".


Projet 1 : Fondations et Marketplace (60h / 8 jours-homme)

Objectif du projet
Développer une application mobile fonctionnelle permettant l’inscription, la recherche et la consultation de profils de joueurs et mentors.

US 1 – Infrastructure et authentification
Charge estimée : 2 jours-homme (15 heures)

Description
Mise en place de l’environnement technique et du système d’authentification.

Tâches regroupées
– Initialisation du projet Expo avec React Native et configuration des dépendances
– Configuration de Firebase (Authentication, Firestore, Storage)
– Définition de l’arborescence du projet et du fichier d’environnement
– Création des écrans de connexion et d’inscription (email et connexion sociale Google/Apple)
– Mise en place de la navigation de base avec React Navigation

Livrable
Application fonctionnelle permettant à un utilisateur de créer un compte et de se connecter.

US 2 – Profil utilisateur unifié
Charge estimée : 1,5 jour-homme (11 heures)

Description
Création et édition du profil utilisateur avec le concept de compte unifié.

Tâches
– Onboarding post-inscription (nom, prénom, âge, nationalité)
– Téléversement de la photo de profil via Firebase Storage
– Formulaire de profil (classement, ligue, comité, style de jeu)
– Activation ou désactivation du mode Mentor
– Stockage et récupération des données dans Firestore

Livrable
Un utilisateur peut créer, consulter et modifier son profil complet.

US 3 – Marketplace et listing
Charge estimée : 2 jours-homme (15 heures)

Description
Développement de la page d’accueil affichant les joueurs disponibles.

Tâches
– Requête Firestore pour récupérer les profils avec le mode Mentor activé
– Affichage sous forme de liste ou de grille avec des cartes profil
– Pagination ou défilement infini basique
– Mise en place du design system (couleurs, typographie, composants UI)
– Barre de recherche simple par nom

Livrable
Écran d’accueil affichant une liste scrollable de mentors disponibles.

US 4 – Filtres de recherche
Charge estimée : 1,5 jour-homme (11 heures)

Description
Ajout de filtres permettant d’affiner la recherche de partenaires.

Tâches
– Filtrage par classement (minimum et maximum)
– Filtrage par localisation (ville et rayon approximatif)
– Filtrage par prix (plage de valeurs)
– Filtrage par type de session (tournoi ou entraînement)
– Application des filtres à la requête Firestore

Livrable
L’utilisateur peut filtrer dynamiquement la liste des mentors selon plusieurs critères.

US 5 – Vue détaillée d’un profil
Charge estimée : 1 jour-homme (8 heures)

Description
Création de la page de détail d’un profil joueur ou mentor.

Tâches
– Mise en page de la vue détaillée (photo principale, statistiques, biographie)
– Affichage des informations principales (classement, points, ligue, prix)
– Ajout d’un badge de vérification purement visuel
– Bouton de réservation menant vers le flux de booking

Livrable
Un clic sur une carte profil ouvre la vue détaillée du joueur.

Total projet 1
8 jours-homme, soit 60 heures.

Projet 2 : Transactions et communication (60h / 8 jours-homme)

Objectif du projet
Mettre en place le moteur transactionnel, le système de réservation et la communication entre utilisateurs.

US 6 – Intégration Stripe
Charge estimée : 2,5 jours-homme (19 heures)

Description
Mise en place du système de paiement sécurisé.

Tâches
– Configuration du dashboard Stripe (clés API et webhooks)
– Intégration de Stripe Payment Sheet côté client React Native
– Mise en place de Stripe Connect Express pour les mentors
– Développement de Cloud Functions Firebase pour la gestion des paiements et de la commission de la plateforme
– Tests de paiement en environnement de test

Livrable
Un utilisateur peut effectuer un paiement et un mentor peut recevoir des fonds.

US 7 – Workflow de réservation
Charge estimée : 2 jours-homme (15 heures)

Description
Implémentation du flux complet de demande et validation de session.

Tâches
– Écran de réservation avec sélection de la date, du type de session et du lieu
– Création d’une réservation dans Firestore avec statut initial “pending”
– Mise en place des notifications push via Firebase Cloud Messaging
– Notification envoyée au mentor lors d’une nouvelle demande
– Interface mentor pour accepter ou refuser la réservation
– Mise à jour du statut de la réservation

Livrable
Un client peut demander une session et le mentor peut accepter ou refuser la demande.

US 8 – Messagerie instantanée
Charge estimée : 1,5 jour-homme (11 heures)

Description
Chat simple entre client et mentor après validation de la réservation.

Tâches
– Création d’une collection messages dans Firestore
– Interface de chat avec bulles de messages
– Envoi et réception des messages en temps réel
– Notification push lors de la réception d’un nouveau message
– Activation du chat uniquement après paiement validé

Livrable
Les deux utilisateurs peuvent échanger des messages après acceptation d’une réservation.

US 9 – Système d’avis et historique
Charge estimée : 1 jour-homme (8 heures)

Description
Système de notation post-session et historique des réservations.

Tâches
– Modal de notation avec étoiles et commentaire
– Enregistrement des avis dans Firestore
– Calcul et affichage de la note moyenne sur les profils
– Écran “Mes réservations” avec sessions passées et à venir
– Déclaration du résultat de la session pour suivi personnel

Livrable
Un utilisateur peut noter son mentor et consulter son historique de sessions.

US 10 – Finitions et préparation de la démonstration
Charge estimée : 1 jour-homme (7 heures)

Description
Stabilisation de l’application et préparation de la soutenance académique.

Tâches
– Tests de bout en bout des parcours client et mentor
– Corrections des bugs visuels et UX
– Ajout de données de test (profils fictifs)
– Rédaction d’une documentation minimale (README)
– Préparation des supports de démonstration pour l’école

Livrable
Application stable, démontrable et documentée pour l’évaluation.

Total projet 2
8 jours-homme, soit 60 heures.
Technologies utilisées
React NativeExpoFirebase (Authentication & Firestore)Stripe ConnectNode.js
Détails


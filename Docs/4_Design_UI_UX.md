# RankUp - UI/UX Design Specifications
**Version :** 1.0 (MVP)
**Theme :** Premium, Dynamic, "Dark Mode" Sport (Night Padel Aesthetic)

---

## 1. Identité Visuelle (Design System Light)

### Palette de Couleurs
*   **Fond Principal :** `#0F172A` (Slate 900 - Dark Blue/Black) - *Élégant, nuit.*
*   **Fond Secondaire :** `#1E293B` (Slate 800) - *Cartes, Modales.*
*   **Accent Primaire (Action) :** `#EAB308` (Yellow 500) - *Rappel de la balle de Padel.*
*   **Accent Secondaire (Confiance) :** `#38BDF8` (Sky 400) - *Pour les profils certifiés/Pros.*
*   **Texte Principal :** `#F8FAFC` (Slate 50) - *Lisibilité maximale.*
*   **Texte Secondaire :** `#94A3B8` (Slate 400) - *Labels, sous-titres.*
*   **Error :** `#EF4444` (Red 500).
*   **Success :** `#22C55E` (Green 500).

### Typographie
*   **Font Family :** `Inter` ou `Outfit` (Google Fonts).
*   **H1 (Titres) :** Bold, 24px-32px.
*   **Body :** Regular, 16px.
*   **Label :** Medium, 12px-14px (Uppercase tracking wide).

---

## 2. Écrans & Flux (Wireframes Specs)

### 2.1 Screen: Splash & Welcome
**But :** Accueillir et positionner la marque "Premium".
*   **Layout :**
    *   Fond : Dégradé sombre ou Vidéo background floutée (Match de padel).
    *   Centre : Logo **RankUp** (Typo Bold + Icône Balle/Éclair).
    *   Bas : Slogan *"Elevate your game. Together."*
*   **Actions :**
    *   Auto-transition après 2s ou Bouton "Commencer".

### 2.2 Screen: Auth (Login/Signup)
**But :** Conversion rapide. Zéro friction.
*   **Layout :**
    *   Header : "Bienvenue sur le court."
    *   Form : Email / Password.
    *   Social Buttons (Gros) : "Continuer avec Apple", "Continuer avec Google".
*   **UX :**
    *   Pas de demande de nom/prénom ici. Juste l'accès.
    *   Si nouveau compte -> Redirection vers **2.3 Onboarding**.

### 2.3 Screen: Onboarding (Creation Profil)
**But :** Qualifier l'utilisateur (Unified Account).
*   **Step 1 : Identité**
    *   Photo (Grand rond centré + icône cam). *Required.*
    *   Input : "Prénom Nom".
    *   Input : "Âge" & "Nationalité" (Flags dropdown).
*   **Step 2 : Niveau (Gamified)**
    *   Slider ou Cartes sélectionnables : "Débutant (1-3)", "Intermédiaire (4-6)", "Avancé (7-8)", "Expert (9-10)".
    *   *Optionnel :* Input "Classement Officiel Actuel" (ex: 1250).
*   **Step 3 : Liability**
    *   Card warning (Fond rouge très foncé).
    *   Checkbox : *[ ] Je certifie avoir une licence et décharge RankUp...*
    *   Bouton : "Entrer dans l'arène" (Accent Jaune).

### 2.4 Screen: Home (Marketplace)
**But :** Découverte et Recherche.
*   **Header :**
    *   Salut [Prénom].
    *   Sélection Ville (ex: "📍 Antibes, FR").
    *   Notif Icon.
*   **Search Bar :** "Trouver un partenaire..." (Filtre par nom).
*   **Quick Filters (Chips horizontaux) :** `Tournoi`, `Sparring`, `Top 100`, `Ce weekend`.
*   **Featured Section (Carrousel) :** "Top Mentors de la semaine" (Cartes premium avec bordure dorée).
*   **List Section :** "Joueurs disponibles autour de toi".
    *   *Card Design :* Photo (gauche), Nom + Badge Niveau (Haut droit), Prix (Bas droit, ex: **50€**), Note (ex: ⭐ 4.9).

### 2.5 Screen: Mentor Profile Details
**But :** Rassurer et Convertir.
*   **Hero Image :** Photo du Pro en action (ou Avatar large).
*   **Stats Row :** 🏆 1250 pts | 🎾 Droitier | ⭐ 4.9 (56 avis).
*   **Bio :** Texte court.
*   **Verification Badge :** ✅ "Identité & Licence Vérifiées".
*   **Pricing Card (Sticky Bottom) :**
    *   Gauche : "50€ / session".
    *   Droite : Bouton "Réserver" (Large, Jaune).

### 2.6 Screen: Booking Flow
**But :** Valider l'engagement.
*   **Modal :** "Demande de Session".
*   **Date/Time Picker :** Calendrier simple.
*   **Type :** Toggle `Tournoi` ou `Sparring`.
*   **Lieu :** Input libre ou liste Clubs favoris.
*   **Recap :** "Total à bloquer : 50€".
*   **Payment :** Stripe Element (Apple Pay / Carte).
*   **Confetti UI :** Si succès -> "Demande envoyée ! En attente de validation."

### 2.7 Screen: My Bookings (Tab)
**But :** Suivi.
*   **Tabs :** `À venir` | `Terminés`.
*   **Card State :**
    *   *En attente validation :* Badge Orange.
    *   *Confirmé :* Badge Vert + Bouton "Ouvrir Chat".
    *   *Terminé :* Bouton "Laisser un avis" ou "Déclarer Résultat".

### 2.8 Screen: Messages (Tab)
**But :** Organisation logistique (post-paiement).
*   **List :** Conversations actives.
*   **Chat View :** Bulles classiques (iMessage style).
*   **System Messages :** "Le paiement de 50€ est sécurisé." / "Rappel : Match demain 14h."

### 2.9 Screen: My Profile (Tab)
**But :** Gestion compte & Mode Pro.
*   **Header :** Ma Photo, Mon Niveau.
*   **Dashboard :** "Mes stats" (Matchs joués, Victoires déclarées).
*   **Switch :** "Mode Mentor" (OFF/ON).
    *   *Si ON :* Afficher champs "Tarif" et "Upload Licence".
*   **Settings :** Paiements, Support, Déconnexion.

---

## 3. Interactions Clés
*   **Micro-animations :** Boutons qui pressent, Cartes qui "pop" au touch.
*   **Transitions :** Slide latéral entre les écrans.
*   **Loading :** Squelettes (Shimmer) gris foncé pendant le chargement des profils.

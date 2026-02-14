# 🧪 Guide de Test - RankUp (MVP)

Ce guide explique comment tester les nouvelles fonctionnalités de l'US #2 (Profil Utilisateur Unifié).

## 1. Prérequis : Configuration Firebase 🔥

Avant de lancer l'application, vous devez configurer un projet Firebase pour l'authentification et le stockage des profils.

1.  Allez sur la [Console Firebase](https://console.firebase.google.com/).
2.  Créez un nouveau projet (ex: `rankup-dev`).
3.  Activez **Authentication** :
    *   Méthode de connexion : **Email/Password**.
4.  Activez **Firestore Database** :
    *   Mode : **Test Mode** (pour démarrer sans règles strictes).
5.  Activez **Storage** :
    *   Mode : **Test Mode**.
6.  Allez dans **Project Settings** (roue dentée) -> Général -> "Your apps" -> Web (`</>`).
7.  Copiez la configuration (`config`).
8.  Remplissez le fichier `.env` à la racine de `app/` avec vos clés :

```bash
EXPO_PUBLIC_FIREBASE_API_KEY=votre_api_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=votre_projet.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=votre_id_projet
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=votre_bucket.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=votre_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=votre_app_id
```

## 2. Lancement de l'Application 🚀

Ouvrez un terminal dans le dossier `app/` :

```bash
# Pour tester sur le Web (Recommandé pour vérification rapide UI)
npm start -- --web

# Pour tester sur mobile (Recommandé pour Camera/ImagePicker)
npm start
# -> Scannez le QR code avec l'application Expo Go (iOS/Android)
```

## 3. Scénario de Test (User Journey) 📝

Suivez ces étapes pour valider l'US #2 :

### Étape 1 : Création de Compte (Auth)
1.  Sur l'écran d'accueil (Auth), cliquez sur "Pas encore de compte ? S'inscrire".
2.  Entrez un email (ex: `test@rankup.fr`) et un mot de passe (min 6 car.).
3.  Cliquez sur "Créer mon compte".
    *   *Attendu : Redirection vers le splash screen puis l'Onboarding.*

### Étape 2 : Onboarding (Nouveau Profil)
1.  **Écran 1 (Identité)** :
    *   Ajoutez une photo (cliquez sur le rond).
    *   Remplissez Prénom, Nom, Âge.
    *   Sélectionnez votre Nationalité.
2.  **Écran 2 (Padel)** :
    *   Entrez un classement (optionnel).
    *   Sélectionnez votre Ligue.
    *   Choisissez votre position (Gauche/Droite).
3.  **Écran 3 (Résumé)** :
    *   Vérifiez que les infos sont correctes.
    *   Cliquez sur "Entrer dans l'arène".
    *   *Attendu : Redirection vers la Home Page.*

### Étape 3 : Consultation du Profil
1.  Sur la Home Page, cliquez sur l'icône de profil (👤) en haut à droite.
    *   *Attendu : Affichage de l'écran "Mon Profil" avec vos stats à 0.*

### Étape 4 : Modification & Mode Mentor
1.  Cliquez sur "✏️ Modifier mon profil".
2.  Changez une info (ex: Club).
3.  Activez le **Mode Mentor** (switch en bas).
4.  Entrez un tarif (ex: 30€) et une description.
5.  Cliquez sur "Enregistrer".
    *   *Attendu : Retour au profil. Le badge "Mentor" apparaît à côté du nom.*

### Étape 5 : Déconnexion
1.  En bas du profil, cliquez sur "Se déconnecter".
    *   *Attendu : Retour à l'écran de Login.*

## 4. Dépannage 🛠️

*   **Erreur "Firebase: Error (auth/invalid-api-key)"** : Vérifiez votre fichier `.env`.
*   **Erreur "Missing or insufficient permissions"** : Vérifiez les règles Firestore/Storage (Test Mode).
*   **Image qui ne charge pas** : Vérifiez les règles Storage.
*   **Application blanche au démarrage** : Redémarrez le serveur (`CTRL+C`, puis `npm start -- --web -c`).

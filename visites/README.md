# Manny Express — Fiches de visite

Application web mobile qui remplace la fiche de visite papier. Trois employés
remplissent la fiche chez le client (avec photos), le gérant la consulte ensuite
pour chiffrer le devis.

L'interface est entièrement en français ; le code, lui, est en anglais.

- React 18 + Vite, Tailwind CSS, `lucide-react`
- Firebase : Authentication (email/mot de passe), Firestore, Storage, Hosting
- Aucune inscription publique : les 4 comptes sont créés à la main dans la console

Cette application vit dans le dossier `visites/` du dépôt du site
mannyexpress.com. Elle est indépendante du site vitrine Jekyll : sa propre
configuration Firebase se trouve ici, celle du site vitrine reste à la racine du
dépôt.

---

## 1. Démarrer en local

```bash
cd visites
npm install
cp .env.example .env.local   # puis remplir les valeurs (section 2)
npm run dev
```

## 2. Les clés `.env.local`

Console Firebase → **Paramètres du projet** (roue dentée) → onglet **Général** →
section **Vos applications** → application Web → **Configuration du SDK**.
Chaque valeur affichée correspond à une clé :

| Clé `.env.local` | Valeur dans la console |
| --- | --- |
| `VITE_FIREBASE_API_KEY` | `apiKey` |
| `VITE_FIREBASE_AUTH_DOMAIN` | `authDomain` |
| `VITE_FIREBASE_PROJECT_ID` | `projectId` |
| `VITE_FIREBASE_STORAGE_BUCKET` | `storageBucket` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | `messagingSenderId` |
| `VITE_FIREBASE_APP_ID` | `appId` |

> **Ces valeurs ne sont pas des secrets.** Elles sont incluses dans le code
> envoyé au navigateur : n'importe quel visiteur peut les lire. La sécurité de
> l'application ne repose pas sur elles mais sur les règles d'accès
> (`firestore.rules` et `storage.rules`), qui exigent une connexion pour lire ou
> écrire quoi que ce soit. Elles sont mises dans un fichier d'environnement pour
> pouvoir changer de projet Firebase facilement, pas pour les cacher.

`.env.local` n'est jamais versionné ; `.env.example` l'est, avec des valeurs
vides.

## 3. Préparation du projet Firebase (à faire une seule fois)

Dans la console Firebase, sur le projet `manny-express` :

1. **Authentication → Sign-in method** : activer **Email/Mot de passe**. Laisser
   « Lien e-mail (sans mot de passe) » **désactivé**.
2. **Firestore Database** : créer la base en **mode production**, région
   `europe-west1` (ou la région européenne la plus proche).
3. **Storage** : démarrer en **mode production**, même région.
4. **Hosting** : créer un second site pour l'application, le site principal
   servant déjà mannyexpress.com :
   ```bash
   cd visites
   firebase hosting:sites:create manny-express-visites
   ```
   Le nom `manny-express-visites` est celui déclaré dans `firebase.json`. Si un
   autre nom est choisi, modifier `hosting.site` en conséquence.
5. **Paramètres du projet → Général → Vos applications** : enregistrer une
   application **Web** et recopier sa configuration dans `.env.local`.

## 4. Ajouter ou retirer un utilisateur

Il n'y a **pas** d'écran d'inscription, ni de lien « mot de passe oublié » : tout
se fait dans la console.

- **Ajouter** : Console Firebase → **Authentication** → onglet **Users** →
  **Add user** → e-mail + mot de passe provisoire. Communiquer ce mot de passe à
  l'employé ; il peut le garder tel quel.
- **Retirer** : même écran, menu « ⋮ » au bout de la ligne → **Delete account**.
  L'accès est coupé immédiatement.
- **Changer un mot de passe** : même menu → **Reset password**.

## 5. Le compte gérant (droit de suppression)

Seul le gérant peut supprimer une visite. Ce droit vient d'un « custom claim »
posé une fois sur son compte.

1. Console Firebase → **Paramètres du projet → Comptes de service** →
   **Générer une nouvelle clé privée**. Enregistrer le fichier sous
   `visites/serviceAccountKey.json` (déjà ignoré par git — **ne jamais le
   versionner**).
2. Ouvrir `scripts/set-owner.js` et remplacer `REPLACE_WITH_OWNER_EMAIL` par
   l'e-mail du gérant.
3. Depuis `visites/` :
   ```bash
   npm install firebase-admin
   node scripts/set-owner.js
   ```
4. **Le gérant doit se déconnecter puis se reconnecter** dans l'application pour
   que le droit prenne effet : le jeton d'authentification n'est rafraîchi qu'à
   ce moment-là. Tant qu'il ne l'a pas fait, le bouton « Supprimer la visite »
   reste invisible.
5. Supprimer `serviceAccountKey.json` de la machine une fois l'opération faite.

Les employés ne voient jamais le bouton de suppression, et une tentative de
suppression envoyée directement à la base est refusée par `firestore.rules`.

## 6. Construire et déployer

```bash
npm install -g firebase-tools   # une seule fois
firebase login                  # une seule fois

cd visites
npm run build
firebase deploy --only hosting:manny-express-visites,firestore:rules,storage:rules
```

L'application est alors en ligne sur `https://manny-express-visites.web.app`.

Les règles de sécurité seules :

```bash
firebase deploy --only firestore:rules,storage:rules
```

> Ne pas lancer `firebase deploy` sans `--only` depuis ce dossier : la
> configuration d'hébergement du site vitrine mannyexpress.com se trouve à la
> racine du dépôt et se déploie séparément.

## 7. Installer l'application sur l'iPhone

Sur chaque téléphone : ouvrir l'adresse dans **Safari** → bouton **Partager** →
**Sur l'écran d'accueil**. L'icône du camion Manny Express apparaît sur l'écran
d'accueil et l'application s'ouvre en plein écran, sans la barre de Safari. La
session reste ouverte : la connexion n'est à faire qu'une fois.

Les icônes se trouvent dans `public/icons/` (`icon-180.png`, `icon-192.png`,
`icon-512.png`). Elles ont été générées à partir de `assets/img/logo.svg` du
dépôt. Pour changer le logo, remplacer ces trois fichiers par des **PNG opaques,
à angles droits, sans transparence** (iOS arrondit lui-même les angles et affiche
les zones transparentes en noir), puis reconstruire et redéployer.

## 8. Ce que contient une visite

Une visite = un document dans la collection Firestore `visites`, et un dossier
de photos dans Storage sous `visites/{id}/`. Les photos sont réduites à 1000 px
et ré-encodées en JPEG qualité 0,6 avant l'envoi (une photo de 4 Mo tombe autour
de 150 Ko), ce qui rend l'envoi possible depuis chez le client avec une
connexion faible. Seules les URL des photos sont stockées dans le document.

Supprimer une visite (gérant uniquement) efface le document **et** le dossier de
photos correspondant.

## 9. Structure du code

```
src/
  App.jsx                 écran de connexion ou coquille de l'app (en-tête + 2 onglets)
  firebase.js             initialisation du SDK
  constants.js            couleurs, prestations, formulaire vierge, calcul du volume
  components/
    LoginScreen.jsx       connexion (aucune inscription)
    VisitForm.jsx         le formulaire, sections 1 à 9
    VisitsList.jsx        liste temps réel des visites
    VisitDetail.jsx       consultation d'une visite + suppression (gérant)
    PhotoPicker.jsx       prise de photo, compression, envoi
    PhotoGallery.jsx      vignettes en lecture seule
    ui.jsx                champs, en-têtes de section, spinner
  lib/
    visits.js             lecture/écriture Firestore
    photos.js             envoi/suppression Storage
    compress.js           compression via canvas
    format.js             affichage des dates
```

Une visite enregistrée ne se modifie pas depuis l'application : en cas d'erreur,
refaire une fiche.

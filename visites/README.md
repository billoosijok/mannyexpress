# Manny Express — Fiches de visite

Application web mobile qui remplace la fiche de visite papier. Trois employés
remplissent la fiche chez le client (avec photos), et le devis se fait depuis
cette fiche en un bouton : tout ce qu'il demande y est déjà, il ne reste que le
prix à taper. Un agenda partagé rassemble les prochaines visites et les
prochains déménagements.

L'interface est entièrement en français ; le code, lui, est en anglais.

- React 18 + Vite, Tailwind CSS, `lucide-react`
- Firebase : Authentication (email/mot de passe), Firestore, Storage, Hosting
- Aucune inscription publique : les 4 comptes sont créés à la main dans la console
- Application installable (PWA) qui s'ouvre et se remplit sans connexion

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

Seul le gérant peut supprimer une visite, et supprimer un rendez-vous qu'il n'a
pas créé lui-même. Ce droit s'obtient de deux façons ; **la première suffit**.

**Par l'adresse e-mail.** Les adresses listées dans `OWNER_EMAILS`
(`src/constants.js`) ont le droit, sans rien à installer. La même liste est
répétée dans `firestore.rules`, qui est ce qui l'applique réellement : les deux
doivent rester identiques. Pour changer de gérant, modifier les deux fichiers,
puis redéployer (l'action GitHub s'en charge à la poussée sur `main`).

**Par un « custom claim ».** Le mécanisme d'origine, plus discret que le code
source, mais qui demande une clé de compte de service :

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

Par l'une ou l'autre voie, les employés ne voient jamais le bouton de
suppression, et une tentative envoyée directement à la base est refusée par
`firestore.rules`.

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

**En temps normal il n'y a rien à lancer :** l'action GitHub
`.github/workflows/deploy-visites.yml` construit et déploie l'application **et
les règles Firestore** à chaque poussée sur `main` touchant `visites/`.

**Sauf `storage.rules`**, qui reste à déployer à la main :

```bash
cd visites
firebase deploy --only storage:rules
```

Le compte de service du déploiement peut écrire les règles mais pas lire la
liste des services du projet, et la CLI vérifie que
`firebasestorage.googleapis.com` est activé avant de déployer les règles
Storage — d'où un refus (HTTP 403). Pour s'en débarrasser : donner le rôle
**Consommateur Service Usage** au compte de service dans la console Google
Cloud, puis remettre `storage:rules` dans l'action.

## 7. Installer l'application sur l'iPhone

Sur chaque téléphone : ouvrir l'adresse dans **Safari** → bouton **Partager** →
**Sur l'écran d'accueil**. L'icône du camion Manny Express apparaît sur l'écran
d'accueil et l'application s'ouvre en plein écran, sans la barre de Safari. La
session reste ouverte : la connexion n'est à faire qu'une fois.

Sur Android, le navigateur propose lui-même « Installer l'application ».

Les icônes se trouvent dans `public/icons/` (`icon-180.png`, `icon-192.png`,
`icon-512.png`). Elles ont été générées à partir de `assets/img/logo.svg` du
dépôt. Pour changer le logo, remplacer ces trois fichiers par des **PNG opaques,
à angles droits, sans transparence** (iOS arrondit lui-même les angles et affiche
les zones transparentes en noir), puis reconstruire et redéployer.

Le quatrième fichier, `icon-maskable-512.png`, est la version Android : le
système y découpe lui-même un cercle ou un carré arrondi, le logo y occupe donc
80 % de l'image, le reste étant du fond. Si le logo change, refaire ce fichier
aussi, sinon Android rognera dans le dessin.

## 8. Fonctionnement hors connexion

L'application est une PWA complète : une fois installée, elle s'ouvre et
s'utilise sans réseau — dans une cage d'escalier, une cave, un sous-sol.

- **L'application elle-même** est gardée sur le téléphone par un *service
  worker* (`sw-template.js`, transformé en `dist/sw.js` au moment du build par
  un petit plugin déclaré dans `vite.config.js`). Elle s'ouvre donc même sans
  réseau, au lieu d'afficher l'écran d'erreur du navigateur.
- **Les visites et les rendez-vous déjà consultés** sont conservés par
  Firestore sur le téléphone : les listes et l'agenda s'affichent hors
  connexion.
- **Une fiche ou un rendez-vous enregistré sans réseau** est gardé sur le
  téléphone et part tout seul dès que la connexion revient. Le bouton le dit :
  « Enregistrée — envoi au retour du réseau ».
- **Les photos, elles, ont besoin d'une connexion** : elles partent vers
  Storage au moment où elles sont prises. Un bandeau orange le rappelle dès que
  le téléphone perd le réseau. Une fiche remplie hors connexion doit donc être
  complétée en photos une fois le réseau revenu, ou remplie à nouveau.

En développement (`npm run dev`) le service worker n'est pas enregistré : il ne
sert qu'à la version construite, pour ne pas servir un ancien fichier pendant
qu'on travaille.

## 9. Les mises à jour

**Un déploiement arrive tout seul sur les téléphones, sans rien toucher.**
L'application cherche une nouvelle version au retour au premier plan, au retour
du réseau, et une fois par minute tant qu'elle est ouverte. En pratique une
mise en ligne est prise en compte dans la minute.

Prendre une nouvelle version veut dire recharger la page. C'est fait tout seul
dès que cela ne dérange personne :

| Ce qui se passe sur le téléphone | Ce que fait la mise à jour |
| --- | --- |
| Rien en cours (liste, agenda, formulaire vide) | Elle s'installe immédiatement, sans rien afficher |
| Application en arrière-plan | Elle s'installe hors de vue ; au retour, la nouvelle version est déjà là |
| Une fiche est en cours de saisie | Elle attend, et propose un bandeau « Mettre à jour » |
| Une photo est en cours d'envoi, ou un rendez-vous ouvert | Elle attend la fin, puis s'installe |

**La fiche en cours n'est jamais perdue.** Elle est écrite sur le téléphone à
chaque frappe (`lib/draft.js`) et revient telle quelle après tout rechargement
— mise à jour, plantage, batterie vide, onglet fermé par erreur. C'est ce qui
permet à une mise à jour de s'installer sans prévenir. Elle est effacée dès que
la fiche est enregistrée.

Deux garde-fous dans `lib/updates.js` : ce qu'un rechargement **perdrait** (une
photo en route vers Storage, le formulaire de rendez-vous qui n'est écrit nulle
part) bloque la mise à jour jusqu'au bout ; ce qu'il ne ferait qu'**interrompre**
(la fiche, sauvegardée au fil de la frappe) la retient seulement tant que
quelqu'un regarde l'écran.

Côté hébergement, `sw.js` et `index.html` sont servis en `no-cache` : sans cela
le navigateur pourrait garder l'ancienne version jusqu'à une heure et le
déploiement n'arriverait pas.

## 10. Les notifications

Quand quelqu'un enregistre une fiche de visite ou ajoute un rendez-vous à
l'agenda, **les autres téléphones reçoivent une notification** — y compris
application fermée. Celui qui vient de l'enregistrer n'est pas prévenu : il le
sait déjà.

**Sur chaque téléphone, une fois :** ouvrir l'application (celle de l'écran
d'accueil, pas Safari), toucher la **cloche** en haut à droite, accepter. La
cloche devient dorée. Sur iPhone, l'application **doit** être installée sur
l'écran d'accueil (section 7) : Safari refuse les notifications à un simple
onglet. iOS 16.4 minimum.

Chaque téléphone qui a accepté a un document dans la collection `tokens`,
identifié par son jeton d'envoi. L'application l'écrit, seule la Cloud Function
le lit (par le SDK admin, auquel les règles ne s'appliquent pas) : personne ne
peut lister les téléphones de l'équipe depuis l'application. Un téléphone
réinstallé change de jeton ; l'ancien est effacé au premier envoi qui échoue.

Deux déclencheurs dans `functions/index.js` : `notifyOnVisit` sur la création
d'une fiche, `notifyOnAgenda` sur celle d'un rendez-vous. Ils sont déployés
dans `europe-west1`, la région de la base — un déclencheur Firestore de 1ʳᵉ
génération doit être dans la même région qu'elle. Si la base est ailleurs,
changer `REGION` en tête de la section, sinon le déploiement est refusé.

**Le déploiement des fonctions se fait à la main**, il n'est pas dans l'action
GitHub (le compte de service du déploiement n'a pas les droits nécessaires) :

```bash
cd functions
npm install
firebase deploy --only functions
```

Tant que cette commande n'a pas été lancée, la cloche s'active sans erreur mais
aucune notification ne part : c'est la fonction qui les envoie.

`VITE_FIREBASE_VAPID_KEY` est **facultative** : sans elle, le SDK utilise la clé
par défaut de Firebase. Pour avoir la sienne : Console Firebase → **Cloud
Messaging** → **Certificats push Web** → **Générer une paire de clés**, puis
recopier la clé publique dans `.env.production`.

## 11. Ce que contient une visite

Chaque bloc photo offre deux entrées : **Photo** ouvre l'appareil photo,
**Galerie** ouvre les photos déjà prises sur le téléphone — utile quand le
client a envoyé ses propres photos, ou quand la visite a été photographiée
avant d'ouvrir l'application. Les deux acceptent plusieurs photos à la fois et
passent par la même compression.

Une visite = un document dans la collection Firestore `visites`, et un dossier
de photos dans Storage sous `visites/{id}/`. Les photos sont réduites à 1000 px
et ré-encodées en JPEG qualité 0,6 avant l'envoi (une photo de 4 Mo tombe autour
de 150 Ko), ce qui rend l'envoi possible depuis chez le client avec une
connexion faible. Seules les URL des photos sont stockées dans le document.

**Corriger une fiche déjà enregistrée** : l'ouvrir depuis l'onglet Visites, puis
« Modifier » en haut à droite. Le formulaire se rouvre tel qu'il a été
enregistré, photos comprises, et « Enregistrer les modifications » remplace la
fiche. Qui a corrigé, et quand, s'affiche ensuite en haut de la fiche
(« Dernière modification »). Tout le monde peut corriger une fiche : à quatre,
c'est le plus souvent celui qui l'a remplie qui repère sa faute de frappe.

Deux choses à savoir en modifiant : retirer une photo la supprime tout de suite
de Storage, même si la modification est ensuite annulée ; et une correction
n'est pas conservée en cas de rechargement, contrairement à une fiche neuve —
c'est pour cela qu'une mise à jour de l'application attend qu'elle soit finie.

**Supprimer une visite** efface le document **et** le dossier de photos. Ce
droit est réservé au gérant et vient du « custom claim » posé sur son compte
(section 5) : sans lui, le bouton rouge « Supprimer la visite » reste invisible,
y compris pour le gérant.

## 12. Le devis

**Le devis se fait depuis la fiche de visite, en un bouton.** Ouvrir la fiche
(onglet Visites ou depuis l'agenda) puis **« Faire le devis »** : l'écran
s'ouvre déjà rempli avec tout ce que la visite a relevé — le client et ses
coordonnées, l'adresse, l'étage, l'ascenseur et la surface des deux logements,
le volume total des pièces. **Il ne reste qu'à choisir la formule et à taper le
prix.**

- **Le numéro** est proposé tout seul : le plus grand déjà attribué, plus un.
  Les devis d'avant l'application s'arrêtant à 367, le premier proposé est 368
  (`DEVIS_START_NUMBER` dans `lib/devis.js`). Il reste modifiable à la main.
- **La formule** (P'tit Express, Simple, Standard, Luxe) remplit **deux
  listes** : ce qu'elle comprend, et ce qu'elle laisse au client. Les deux
  s'impriment côte à côte sur le devis — dit d'avance, ce n'est pas discuté le
  jour du déménagement. Elles sortent du tableau des formules de
  mannyexpress.com, recopié dans `TABLEAU_FORMULES` (`src/constants.js`) : le
  site et le devis ne peuvent pas se contredire. Les deux listes sont des
  champs libres ; une fois retouchées, changer de formule ne les écrase plus.
  Le tarif de départ annoncé par le site s'affiche à côté de chaque formule
  pour situer le prix — il ne s'imprime pas.
- **Le prix est le montant que le client règle.** Manny Express est une
  micro-entreprise : pas de TVA, donc pas de ligne HT ni de taux à saisir. Le
  devis porte un seul total et la mention « TVA non applicable, art. 293 B du
  CGI ». Il est **en tête de l'écran, seul dans son encadré** : c'est ce qu'on
  vient taper la première fois, et ce qu'on revient changer ensuite.
- **Tout se change, à tout moment**, et pas seulement le prix : le numéro, les
  deux dates, le client, les adresses et les accès, l'intitulé des deux étapes
  (« Chargement des meubles »), le volume, les deux listes, les conditions.
  Rouvrir un devis enregistré rouvre le même écran ; « Enregistrer les
  modifications » remplace le devis, qui se réimprime avec le nouveau prix.
  Changer de formule sur un devis déjà enregistré remet bien les deux listes à
  jour — sauf si elles ont été retouchées à la main, et le bouton « Remettre
  les listes de la formule » les rétablit alors.
- **Les dates de chargement et de déchargement** sont les seules choses que la
  fiche ne sait pas : elles se saisissent ici.
- **L'aperçu en bas de l'écran est exactement ce qui s'imprime.** Rien n'y est
  masqué ni ajouté.

**Imprimer ou envoyer.** Le bouton **« Imprimer / PDF »** ouvre la boîte
d'impression du téléphone, qui sait aussi « Enregistrer au format PDF » et
partager le fichier — par mail, par WhatsApp. Si elle ne s'ouvre pas depuis
l'application installée sur l'écran d'accueil (iOS le refuse selon les
versions), **« Ouvrir dans le navigateur »** affiche le même devis dans un
onglet Safari, d'où le bouton Partager fait la même chose.

**Le devis est enregistré dans la fiche** (clé `devis` du document, écrite par
son seul écran : corriger la fiche ne l'écrase pas, et l'écrire ne touche pas
la fiche). La fiche affiche ensuite son numéro et son montant en haut, et le
toucher rouvre l'écran pour le corriger ou le réimprimer. Un devis établi sans
réseau part au retour de la connexion, comme une fiche.

Ce que le devis imprime vient de trois endroits : l'en-tête et le pied de page
(adresse, téléphones, SIRET, mention de TVA) de `ENTREPRISE` dans
`src/constants.js`, le contenu des formules de `TABLEAU_FORMULES` dans le même
fichier, et la mise en page de `src/devis.css`. Le logo est `public/logo.png`.
Le devis tient sur une page dans les quatre formules ; en rallonger les listes
peut le faire passer à deux.

## 13. L'agenda

L'onglet **Agenda** est le planning partagé de l'équipe : tout le monde y voit
la même chose, en temps réel.

- **Ajouter** : choisir un jour dans le calendrier puis « Ajouter ». Un
  rendez-vous est soit une **visite** (repérage chez le client), soit un
  **déménagement**. Seule la date est obligatoire : l'heure, le client, le
  téléphone, l'adresse et les notes peuvent être complétés plus tard.
- **Modifier / déplacer** : toucher le rendez-vous pour rouvrir le formulaire.
  Contrairement à une fiche de visite, un rendez-vous reste modifiable, les
  dates changeant souvent.
- **Supprimer** : possible pour la personne qui a créé le rendez-vous, et pour
  le gérant.
- **Appeler** : l'icône téléphone au bout d'une ligne lance l'appel quand un
  numéro a été saisi.
- Les deux vues : **Mois** (calendrier + la journée choisie en dessous) et
  **À venir** (tout ce qui arrive à partir d'aujourd'hui, à la suite).

Les **fiches de visite déjà enregistrées** apparaissent aussi dans le calendrier,
en gris, à leur date de visite : toucher la ligne ouvre la fiche complète. Le
calendrier montre donc à la fois ce qui est prévu et ce qui a déjà été fait.

Les couleurs : **doré** pour une visite, **bleu marine** pour un déménagement,
**gris** pour une fiche déjà remplie. Un point sous le jour signale chaque
rendez-vous (trois au maximum).

Un rendez-vous = un document dans la collection Firestore `agenda`. Il n'y a
aucun lien automatique entre un rendez-vous et la fiche remplie ensuite : ce
sont deux choses séparées, le rendez-vous restant le plan et la fiche le
relevé.

## 14. Structure du code

```
src/
  App.jsx                 écran de connexion ou coquille de l'app (en-tête + 3 onglets)
  firebase.js             initialisation du SDK
  constants.js            couleurs, prestations, formules, entreprise, formulaires vierges
  devis.css               la feuille de devis : mise en page écran et impression
  components/
    LoginScreen.jsx       connexion (aucune inscription)
    VisitForm.jsx         le formulaire, sections 1 à 9 (fiche neuve ou correction)
    VisitsList.jsx        liste temps réel des visites
    VisitDetail.jsx       consultation d'une visite, modification, suppression (gérant)
    DevisForm.jsx         le devis d'une visite : pré-rempli, aperçu, impression
    DevisDocument.jsx     la feuille A4 telle qu'elle s'imprime
    AgendaView.jsx        calendrier du mois, journée choisie, liste « à venir »
    AgendaEventForm.jsx   ajout / modification / suppression d'un rendez-vous
    PhotoPicker.jsx       prise de photo, compression, envoi
    PhotoGallery.jsx      vignettes en lecture seule
    NotificationToggle.jsx la cloche : demande la permission, inscrit le téléphone
    OfflineNotice.jsx     bandeau « hors connexion »
    UpdateBanner.jsx      enregistre le service worker, propose la mise à jour
    ui.jsx                champs, en-têtes de section, spinner
  lib/
    visits.js             lecture/écriture Firestore des fiches
    devis.js              le devis : pré-remplissage, numérotation, montants, écriture
    print.js              impression de la feuille et ouverture dans le navigateur
    agenda.js             lecture/écriture Firestore des rendez-vous
    photos.js             envoi/suppression Storage
    compress.js           compression via canvas
    calendar.js           clés de jour "AAAA-MM-JJ" et grille du mois
    format.js             affichage des dates
    offline.js            écriture qui n'attend pas le serveur quand il n'y a plus de réseau
    draft.js              la fiche en cours, gardée sur le téléphone
    notifications.js      jeton d'envoi du téléphone
    updates.js            détection des déploiements et bascule de version
sw-template.js            le service worker, avant que le build y inscrive sa version
```

Une fiche enregistrée reste modifiable : `VisitForm` sert aussi bien à la
remplir qu'à la corriger, selon qu'on lui passe une visite ou non.

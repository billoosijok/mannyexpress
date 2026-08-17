// Brand colours, taken from the company's printed quote and visit sheet.
export const NAVY = "#1F3864";
export const GOLD = "#C98A2E";
export const BG = "#FAF9F5";
export const BORDER = "#E4E1D8";
export const TEXT = "#2B2E33";
export const MUTED = "#767b85";

/**
 * Who may delete a visit or anyone's appointment. The "owner" custom claim
 * does it (see the README), but posting that claim needs a service-account
 * key and a script run; naming the address here gives the same right with
 * nothing to install. The list is repeated in firestore.rules, which is what
 * actually enforces it — this one only decides whether the button is shown.
 */
export const OWNER_EMAILS = ["elgarbimohamed.m@gmail.com"];

export function isOwnerEmail(email) {
  return OWNER_EMAILS.includes(String(email || "").toLowerCase());
}

/**
 * L'en-tête et le pied du devis. L'adresse et les téléphones sont ceux du
 * devis papier ; le SIRET et le siège social viennent des mentions légales du
 * site, qu'un devis doit porter.
 */
export const ENTREPRISE = {
  nom: "Manny Express",
  activite: "(Déménagement & Transport)",
  adresse: ["36 A Rue Gounod", "11100 NARBONNE"],
  telephones: ["07 51 16 85 03", "06 66 18 19 15"],
  email: "mannyexpress11@gmail.com",
  ville: "Narbonne",
  siret: "952 589 646 00027",
  siege: "1 impasse de la Distillerie, 11100 Narbonne",
  // Micro-entreprise : pas de TVA, et la mention qui doit alors figurer sur
  // le devis. C'est elle qui remplace la ligne « TVA » du modèle papier.
  mentionTva: "TVA non applicable, art. 293 B du CGI.",
};

/**
 * Le mail qui accompagne le devis. Le même texte pour tous les clients, mot
 * pour mot : c'est celui que le gérant a écrit. Le devis lui-même s'y joint à
 * la main depuis le téléphone — un site web ne peut pas attacher un fichier
 * à un mail qu'il n'envoie pas lui-même.
 */
export const MAIL_DEVIS = {
  objet: "Devis N° {numero} — Manny Express",
  corps: `Bonjour,

Veuillez trouver ci-joint le devis comme convenu.

Je reste à votre disposition pour toute question et dans l'attente de votre retour afin de pouvoir vous bloquer une date.

Cordialement,
Manny Express`,
};

// TODO(manny): la P'tit Express ne comprend plus le déménagement lui-même, mais
// les fournitures et le transport des cartons. Son « à partir de 350 € » date de
// l'ancienne formule et n'a pas été revu. Donner le vrai prix plancher.
export const FORMULES = [
  { value: "ptit-express", label: "P'tit Express", aPartirDe: 350 },
  { value: "simple", label: "Simple", aPartirDe: 600 },
  { value: "standard", label: "Standard", aPartirDe: 900 },
  // La formule s'appelle Complet sur le site depuis la refonte du tableau. La
  // valeur reste `luxe` : les devis déjà enregistrés la portent.
  { value: "luxe", label: "Complet", aPartirDe: 1400 },
];

/**
 * Le tableau des formules de mannyexpress.com, ligne par ligne et colonne par
 * colonne, dans l'ordre où la page les présente. Chaque case porte l'un des
 * quatre états du tableau : INCLUS (le ✓ bleu), OPTION (« en option » : sur
 * demande et facturé en plus), VOUS (à la charge du client, et le devis le dit
 * plutôt que de le taire) et SANS_OBJET (le tiret : la ligne ne veut rien dire
 * pour cette formule, elle ne figure donc ni dans les prestations ni dans ce
 * qui reste à faire).
 *
 * C'est la seule source : ce que le site promet et ce que le devis engage ne
 * peuvent pas diverger. Si la page change, cette liste change avec elle.
 */
const INCLUS = "inclus";
const OPTION = "option";
const VOUS = "vous";
const SANS_OBJET = "sans-objet";

const TABLEAU_FORMULES = [
  {
    label: "10 cartons standards",
    etats: { "ptit-express": INCLUS, simple: OPTION, standard: SANS_OBJET, luxe: SANS_OBJET },
  },
  {
    label: "10 m de papier bulle + 2 adhésifs",
    etats: { "ptit-express": INCLUS, simple: OPTION, standard: SANS_OBJET, luxe: SANS_OBJET },
  },
  {
    label: "Transport des cartons",
    etats: { "ptit-express": INCLUS, simple: OPTION, standard: SANS_OBJET, luxe: SANS_OBJET },
  },
  {
    label: "Chargement",
    etats: { "ptit-express": VOUS, simple: INCLUS, standard: INCLUS, luxe: INCLUS },
  },
  {
    label: "Transport sécurisé",
    etats: { "ptit-express": VOUS, simple: INCLUS, standard: INCLUS, luxe: INCLUS },
  },
  {
    label: "Déchargement",
    etats: { "ptit-express": VOUS, simple: INCLUS, standard: INCLUS, luxe: INCLUS },
  },
  {
    label: "Protection du mobilier",
    etats: { "ptit-express": VOUS, simple: INCLUS, standard: INCLUS, luxe: INCLUS },
  },
  {
    label: "Démontage des meubles",
    etats: { "ptit-express": VOUS, simple: VOUS, standard: INCLUS, luxe: INCLUS },
  },
  {
    label: "Remontage des meubles",
    etats: { "ptit-express": VOUS, simple: VOUS, standard: INCLUS, luxe: INCLUS },
  },
  {
    label: "Mise en place des cartons",
    etats: { "ptit-express": VOUS, simple: VOUS, standard: INCLUS, luxe: INCLUS },
  },
  {
    label: "Fourniture des cartons",
    etats: { "ptit-express": VOUS, simple: VOUS, standard: VOUS, luxe: INCLUS },
  },
  {
    label: "Emballage des objets fragiles",
    etats: { "ptit-express": VOUS, simple: VOUS, standard: VOUS, luxe: INCLUS },
  },
  {
    label: "Emballage du reste (vaisselle, vêtements…)",
    etats: { "ptit-express": VOUS, simple: VOUS, standard: VOUS, luxe: INCLUS },
  },
  {
    label: "Déballage des objets fragiles",
    etats: { "ptit-express": VOUS, simple: VOUS, standard: VOUS, luxe: INCLUS },
  },
];

export function formuleByValue(value) {
  return FORMULES.find((formule) => formule.value === value) || FORMULES[1];
}

/** Ce que la formule comprend. */
export function formulePrestations(value) {
  return TABLEAU_FORMULES.filter(({ etats }) => etats[value] === INCLUS).map(
    ({ label }) => label
  );
}

/**
 * Ce qu'elle ne comprend pas, et qui reste au client. Une prestation en option
 * y figure aussi, marquée comme telle : tant qu'elle n'est pas commandée elle
 * est bien à la charge du client, et le dire lui apprend qu'il peut l'ajouter.
 */
export function formuleACharge(value) {
  return TABLEAU_FORMULES.filter(
    ({ etats }) => etats[value] === VOUS || etats[value] === OPTION
  ).map(({ label, etats }) =>
    etats[value] === OPTION ? `${label} (en option, sur devis)` : label
  );
}

export const PRESTATIONS = [
  "Emballage par nos soins",
  "Fourniture de cartons",
  "Démontage / remontage meubles",
  "Garde-meuble / stockage",
  "Monte-meuble",
  "Assurance complémentaire",
  "Nettoyage fin de bail",
];

// Sections 2 and 3 of the paper form share the same field set; the keys are
// built by prefixing each suffix with "depart" or "arrivee".
export const LOGEMENT_FIELDS = [
  { suffix: "Adresse", label: "Adresse complète" },
  { suffix: "Type", label: "Type de logement" },
  // Reprise telle quelle sur le devis, comme sur le devis papier.
  { suffix: "Surface", label: "Surface (m²)" },
  { suffix: "Etage", label: "Étage" },
  { suffix: "Ascenseur", label: "Ascenseur" },
  { suffix: "Escalier", label: "Escalier" },
  { suffix: "Stationnement", label: "Stationnement camion" },
  { suffix: "Distance", label: "Distance portage" },
  { suffix: "MonteMeuble", label: "Monte-meuble nécessaire" },
];

export const CONTRAINTES_FIELDS = [
  { key: "contraintesDates", label: "Date(s) souhaitée(s)" },
  { key: "contraintesCreneau", label: "Créneau horaire" },
  {
    key: "contraintesStationnement",
    label: "Autorisation de stationnement à demander",
  },
  { key: "contraintesCopro", label: "Contraintes copropriété / horaires" },
];

// The two things the agenda holds: the appointment to go and survey a home,
// and the moving day itself. Each carries the classes that colour it in the
// calendar so a day's dots and its cards always agree.
export const AGENDA_TYPES = [
  {
    value: "visite",
    label: "Visite",
    dot: "bg-gold",
    bar: "bg-gold",
    chip: "border-gold bg-gold/10 text-navy",
  },
  {
    value: "demenagement",
    label: "Déménagement",
    dot: "bg-navy",
    bar: "bg-navy",
    chip: "border-navy bg-navy/10 text-navy",
  },
];

/** Falls back to "visite" so an unknown type still renders. */
export function agendaType(value) {
  return AGENDA_TYPES.find((type) => type.value === value) || AGENDA_TYPES[0];
}

export function emptyEvent(date = "") {
  return {
    type: "visite",
    date,
    heure: "",
    clientNom: "",
    clientTel: "",
    adresse: "",
    notes: "",
  };
}

// crypto.randomUUID() is unavailable outside secure contexts, which happens
// when the app is opened over plain http on the local network for testing.
export function uid() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export function emptyPiece() {
  return {
    id: uid(),
    piece: "",
    contenu: "",
    volume: "",
    manutention: "",
    photoUrls: [],
  };
}

export function emptyVisit() {
  const logement = {};
  for (const prefix of ["depart", "arrivee"]) {
    for (const { suffix } of LOGEMENT_FIELDS) {
      logement[prefix + suffix] = "";
    }
  }
  return {
    clientNom: "",
    clientTel: "",
    clientEmail: "",
    dateVisite: "",
    visiteur: "",
    ...logement,
    pieces: [emptyPiece()],
    objetsValeur: "",
    objetsValeurPhotoUrls: [],
    objetsPiano: "",
    objetsPianoPhotoUrls: [],
    objetsElectro: "",
    objetsDemontage: "",
    objetsPlantes: "",
    prestations: [],
    cartonsNecessaires: "",
    contraintesDates: "",
    contraintesCreneau: "",
    contraintesStationnement: "",
    contraintesCopro: "",
    photosSupplementairesUrls: [],
    notes: "",
  };
}

// Written alongside the form, never part of it: these must not travel back
// into the fields when a saved sheet is reopened for correction.
const VISIT_METADATA = [
  "id",
  "volumeTotal",
  // Le devis est écrit à côté de la fiche, par son propre écran : il ne doit
  // ni s'afficher dans le formulaire ni être réécrit quand on corrige la fiche.
  "devis",
  "createdAt",
  "createdBy",
  "createdByEmail",
  "updatedAt",
  "updatedBy",
  "updatedByEmail",
];

/** Every photo a sheet points at, wherever it sits in it. */
export function visitPhotoUrls(visit) {
  return [
    ...(visit.objetsValeurPhotoUrls || []),
    ...(visit.objetsPianoPhotoUrls || []),
    ...(visit.photosSupplementairesUrls || []),
    ...(visit.pieces || []).flatMap((piece) => piece.photoUrls || []),
  ];
}

/** Turns a saved visit back into something the form can edit. */
export function visitToForm(visit) {
  const form = emptyVisit();
  for (const [key, value] of Object.entries(visit)) {
    if (!VISIT_METADATA.includes(key)) form[key] = value;
  }
  // A sheet saved before a field existed simply keeps the empty one, and a
  // piece saved without an id gets one: the form keys its rows on it.
  const pieces = visit.pieces?.length ? visit.pieces : form.pieces;
  form.pieces = pieces.map((piece) => ({ ...emptyPiece(), ...piece }));
  return form;
}

function isBlank(value) {
  if (Array.isArray(value)) return value.length === 0;
  return String(value ?? "").trim() === "";
}

/**
 * Whether anything has been typed into a visit sheet. Comparing against a
 * fresh emptyVisit() would not do: every piece carries a random id.
 */
export function visitHasContent(form) {
  return Object.entries(form).some(([key, value]) => {
    if (key !== "pieces") return !isBlank(value);
    return value.some(({ id: _id, ...fields }) =>
      Object.values(fields).some((field) => !isBlank(field))
    );
  });
}

// Surveyors type French decimals ("12,5"); anything unreadable counts as 0.
export function parseVolume(value) {
  const parsed = Number.parseFloat(String(value ?? "").replace(",", "."));
  return Number.isFinite(parsed) ? parsed : 0;
}

export function totalVolume(pieces) {
  return (pieces || []).reduce((sum, piece) => sum + parseVolume(piece.volume), 0);
}

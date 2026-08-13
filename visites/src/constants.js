// Brand colours, taken from the company's printed quote and visit sheet.
export const NAVY = "#1F3864";
export const GOLD = "#C98A2E";
export const BG = "#FAF9F5";
export const BORDER = "#E4E1D8";
export const TEXT = "#2B2E33";
export const MUTED = "#767b85";

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

// Surveyors type French decimals ("12,5"); anything unreadable counts as 0.
export function parseVolume(value) {
  const parsed = Number.parseFloat(String(value ?? "").replace(",", "."));
  return Number.isFinite(parsed) ? parsed : 0;
}

export function totalVolume(pieces) {
  return (pieces || []).reduce((sum, piece) => sum + parseVolume(piece.volume), 0);
}

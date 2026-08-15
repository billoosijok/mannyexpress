import { collection, doc, getDocs, serverTimestamp, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import { formuleByValue } from "../constants";
import { VISITS } from "./visits";

/**
 * Le premier numéro proposé quand aucune fiche ne porte encore de devis. Les
 * devis d'avant l'application s'arrêtent à 367 ; l'application reprend la
 * suite. Le numéro reste modifiable à la main sur chaque devis.
 */
export const DEVIS_START_NUMBER = 368;

/** "2 480,00 €". Le devis n'affiche jamais un nombre autrement. */
export function formatEuros(value) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(Number.isFinite(value) ? value : 0);
}

/** Le gérant tape « 2480 », « 2 480,50 » ou « 2480€ » : tout doit passer. */
export function parseMontant(value) {
  const cleaned = String(value ?? "")
    .replace(/[^\d,.-]/g, "")
    .replace(",", ".");
  const parsed = Number.parseFloat(cleaned);
  return Number.isFinite(parsed) ? parsed : 0;
}

/** "2026-08-14" → "14/08/2026". Une date vide reste vide. */
export function formatDateFr(value) {
  const [year, month, day] = String(value ?? "").split("-");
  if (year && month && day) return `${day}/${month}/${year}`;
  return String(value ?? "");
}

export function todayKey() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

/**
 * Le prix saisi est celui que le client paie (TTC), comme sur le devis papier.
 * Le HT s'en déduit ; à 0 % de TVA — le cas courant — les deux sont égaux.
 */
export function devisTotals(devis) {
  const ttc = parseMontant(devis.prixTTC);
  const taux = parseMontant(devis.tauxTva) / 100;
  const ht = taux > 0 ? ttc / (1 + taux) : ttc;
  return { ht, tva: ttc - ht, ttc };
}

/** Le texte des prestations d'une formule, une par ligne, prêt à corriger. */
export function prestationsText(formuleValue) {
  return formuleByValue(formuleValue).prestations.join("\n");
}

/** Le paragraphe sous les prestations. Le volume vient du relevé de la visite. */
export function conditionsText(volume) {
  const releve = String(volume ?? "").trim();
  return [
    releve
      ? `Ce devis est établi sur la base d'un volume estimé de ${releve} m³, relevé lors de la visite effectuée à votre domicile.`
      : "Ce devis est établi sur la base du relevé effectué lors de la visite à votre domicile.",
    "Il est valable 30 jours et comprend uniquement les prestations listées ci-dessus.",
    "Acompte de 40 % à la signature, solde de 60 % à l'arrivée avant déchargement.",
    "Toute modification du volume, des accès ou de la date pourra donner lieu à un réajustement du tarif.",
  ].join(" ");
}

function volumeText(visit) {
  const total = Number(visit.volumeTotal || 0);
  if (!total) return "";
  return total.toFixed(1).replace(".", ",").replace(",0", "");
}

/**
 * Le devis pré-rempli avec ce que la fiche de visite sait déjà : le client,
 * les deux logements, le volume relevé. Il ne reste que le prix — et la date
 * du déménagement — à taper.
 */
export function emptyDevis(visit, numero = DEVIS_START_NUMBER) {
  const volume = volumeText(visit);
  const formule = "simple";
  return {
    numero: String(numero),
    date: todayKey(),
    envoyeeLe: todayKey(),
    clientNom: visit.clientNom || "",
    clientTel: visit.clientTel || "",
    clientEmail: visit.clientEmail || "",
    formule,
    volume,
    prixTTC: "",
    tauxTva: "0",
    chargementDate: "",
    chargementAdresse: visit.departAdresse || "",
    chargementEtage: visit.departEtage || "",
    chargementAscenseur: visit.departAscenseur || "",
    chargementSurface: visit.departSurface || "",
    dechargementDate: "",
    dechargementAdresse: visit.arriveeAdresse || "",
    dechargementEtage: visit.arriveeEtage || "",
    dechargementAscenseur: visit.arriveeAscenseur || "",
    dechargementSurface: visit.arriveeSurface || "",
    prestations: prestationsText(formule),
    conditions: conditionsText(volume),
  };
}

/**
 * Le devis déjà enregistré, complété des champs ajoutés depuis. Les deux
 * marques d'écriture restent dans la fiche, jamais dans le formulaire.
 */
export function devisToForm(visit) {
  const { updatedAt: _updatedAt, updatedByEmail: _updatedByEmail, ...devis } =
    visit.devis || {};
  return { ...emptyDevis(visit), ...devis };
}

/**
 * Le numéro qui suit le plus grand déjà attribué. La lecture passe par le
 * cache Firestore quand il n'y a pas de réseau, et un échec complet ne bloque
 * rien : le numéro de départ est proposé, et il reste modifiable.
 */
export async function nextDevisNumber() {
  try {
    const snapshot = await getDocs(collection(db, VISITS));
    const numbers = snapshot.docs
      .map((entry) => Number.parseInt(entry.data()?.devis?.numero, 10))
      .filter((numero) => Number.isFinite(numero));
    if (numbers.length === 0) return DEVIS_START_NUMBER;
    return Math.max(...numbers, DEVIS_START_NUMBER - 1) + 1;
  } catch {
    return DEVIS_START_NUMBER;
  }
}

/**
 * Écrit le devis dans la fiche de visite dont il sort. `updateDoc` ne touche
 * que la clé `devis` : la fiche elle-même, et qui l'a remplie, sont laissées
 * intactes.
 */
export async function saveDevis(visitId, devis, user) {
  const stored = {
    ...devis,
    updatedAt: serverTimestamp(),
    updatedByEmail: user?.email || "",
  };
  await updateDoc(doc(db, VISITS, visitId), { devis: stored });
  return stored;
}

/** Le titre du document imprimé : c'est lui que l'iPhone propose comme nom. */
export function devisFileName(devis) {
  const client = String(devis.clientNom || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w]+/g, "-")
    .replace(/^-|-$/g, "");
  return `Devis-${devis.numero || ""}${client ? `-${client}` : ""}`;
}

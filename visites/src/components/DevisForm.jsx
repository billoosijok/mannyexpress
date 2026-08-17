import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  Check,
  ExternalLink,
  FileDown,
  Mail,
  Printer,
  RotateCcw,
} from "lucide-react";
import {
  DEVIS_STATUTS,
  FORMULES,
  MAIL_DEVIS,
  devisStatut,
  formuleByValue,
} from "../constants";
import {
  chargeText,
  devisFileName,
  devisMailObjet,
  devisMailto,
  devisMontant,
  devisToForm,
  formatEuros,
  nextDevisNumber,
  prestationsText,
  saveDevis,
} from "../lib/devis";
import { commit } from "../lib/offline";
import { devisPdfBlob, sharePdf } from "../lib/pdf";
import { openNodeInBrowser, printNode } from "../lib/print";
import DevisDocument from "./DevisDocument";
import {
  Card,
  ErrorNote,
  Field,
  SectionHeader,
  Spinner,
  TextArea,
  TextInput,
} from "./ui";

/** Les lignes non vides d'un des deux champs de prestations. */
function countLignes(text) {
  return String(text || "")
    .split("\n")
    .filter((line) => line.trim());
}

/** Si les listes enregistrées disent autre chose que la formule choisie. */
function listesRetouchees(devis) {
  if (!devis) return false;
  return (
    devis.prestations !== prestationsText(devis.formule) ||
    devis.charge !== chargeText(devis.formule)
  );
}

/**
 * Le devis d'une fiche de visite. Tout ce que la visite a relevé y est déjà —
 * client, adresses, étages, volume — il ne reste qu'à choisir la formule et à
 * taper le prix. Tout y reste modifiable, à tout moment : un devis rouvert
 * s'ouvre sur son prix, et « Enregistrer » remplace celui d'avant.
 */
export default function DevisForm({
  visit,
  user,
  onBack,
  onSaved,
  backLabel = "Retour à la fiche",
}) {
  const [devis, setDevis] = useState(() => devisToForm(visit));
  const [status, setStatus] = useState("idle"); // idle | saving | envoye | en-attente
  const [pdfStatus, setPdfStatus] = useState("idle"); // idle | working | ready | done
  const [error, setError] = useState("");
  const frameRef = useRef(null);
  // Le PDF fabriqué, gardé tant que le devis n'a pas changé : c'est lui qui
  // permet au second appui d'ouvrir la feuille de partage sans attente.
  const pdfCache = useRef({ key: "", blob: null });

  const editing = Boolean(visit.devis);

  // Ce que le gérant a lui-même écrit n'est plus jamais remplacé : ni le
  // numéro par celui que la base propose, ni les listes par celles de la
  // formule suivante. Sur un devis rouvert, « écrit à la main » ne veut pas
  // dire « déjà enregistré » — sans quoi changer de formule ne remettrait
  // plus jamais les listes à jour : c'est écrit ce que la formule choisie ne
  // donne pas.
  const numeroEdited = useRef(Boolean(visit.devis?.numero));
  const prestationsEdited = useRef(listesRetouchees(visit.devis));

  useEffect(() => {
    if (numeroEdited.current) return undefined;
    let cancelled = false;
    nextDevisNumber().then((numero) => {
      if (cancelled || numeroEdited.current) return;
      setDevis((previous) => ({ ...previous, numero: String(numero) }));
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const setValue = (key) => (value) =>
    setDevis((previous) => ({ ...previous, [key]: value }));

  // Changer de formule réécrit les deux listes — ce qu'elle comprend et ce
  // qu'elle laisse au client — tant qu'elles n'ont pas été retouchées à la
  // main. Après, elles appartiennent au gérant.
  function setFormule(value) {
    setDevis((previous) => ({
      ...previous,
      formule: value,
      prestations: prestationsEdited.current
        ? previous.prestations
        : prestationsText(value),
      charge: prestationsEdited.current ? previous.charge : chargeText(value),
    }));
  }

  // Remet les deux listes telles que la formule les donne, quand elles ont
  // été retouchées puis regrettées.
  function resetListes() {
    prestationsEdited.current = false;
    setDevis((previous) => ({
      ...previous,
      prestations: prestationsText(previous.formule),
      charge: chargeText(previous.formule),
    }));
  }

  const formule = formuleByValue(devis.formule);
  // Comptées sur les listes du devis, pas sur celles de la formule : c'est ce
  // qui s'imprime, retouches comprises, que le compte doit annoncer.
  const comprises = countLignes(devis.prestations);
  const aCharge = countLignes(devis.charge);
  const montant = useMemo(() => devisMontant(devis), [devis]);
  const fileName = devisFileName(devis);

  /** Ce que la feuille de partage — ou le téléchargement — a donné. */
  function announcePdf(result) {
    if (result === "blocked") {
      // Safari a refusé la feuille de partage faute de geste récent. Le PDF,
      // lui, est fait : le bouton le dit et le second appui l'enregistre.
      setPdfStatus("ready");
      return;
    }
    setPdfStatus(result === "cancelled" ? "idle" : "done");
    if (result !== "cancelled") setTimeout(() => setPdfStatus("idle"), 2500);
  }

  /**
   * Le devis en PDF A4. L'application le fabrique elle-même plutôt que de le
   * demander à la boîte d'impression : c'est ce qui garantit le format, que
   * l'enregistrement passe par la feuille de partage de l'iPhone ou par les
   * téléchargements de l'ordinateur.
   */
  function handlePdf() {
    if (pdfStatus === "working") return;
    setError("");

    const key = JSON.stringify(devis);
    if (pdfCache.current.key === key && pdfCache.current.blob) {
      sharePdf(pdfCache.current.blob, fileName).then(announcePdf);
      return;
    }

    setPdfStatus("working");
    devisPdfBlob(frameRef.current)
      .then((blob) => {
        if (!blob) throw new Error("aperçu introuvable");
        pdfCache.current = { key, blob };
        return sharePdf(blob, fileName);
      })
      .then(announcePdf)
      .catch(() => {
        setPdfStatus("idle");
        setError("La fabrication du PDF a échoué. Réessayez.");
      });
  }

  async function handleSave() {
    if (status === "saving") return;
    setError("");
    setStatus("saving");
    try {
      setStatus(await commit(saveDevis(visit.id, devis, user)));
      onSaved?.({ ...devis });
      setTimeout(() => setStatus("idle"), 2500);
    } catch {
      setStatus("idle");
      setError("L'enregistrement du devis a échoué. Vérifiez la connexion.");
    }
  }

  return (
    <div className="pb-4">
      <button
        type="button"
        onClick={onBack}
        className="mb-4 flex min-h-[44px] items-center gap-2 text-sm font-medium text-navy"
      >
        <ArrowLeft size={18} /> {backLabel}
      </button>

      {error && (
        <div className="mb-4">
          <ErrorNote>{error}</ErrorNote>
        </div>
      )}

      {/* Le devis se fait dans cet ordre : la formule d'abord, elle décide de
          ce qui est compris ; le prix ensuite ; le reste se corrige après. */}
      <Card>
        <SectionHeader
          number="1"
          title="Formule"
          subtitle="Elle remplit ce que le devis comprend, et ce qu'il ne comprend pas"
        />
        <div className="mb-2 grid grid-cols-2 gap-2">
          {FORMULES.map(({ value, label, aPartirDe }) => {
            const selected = devis.formule === value;
            return (
              <button
                key={value}
                type="button"
                onClick={() => setFormule(value)}
                className={`min-h-[64px] rounded-lg border px-3 py-2 text-left transition ${
                  selected
                    ? "border-gold bg-gold text-white"
                    : "border-line bg-white text-ink"
                }`}
              >
                <span className="block text-sm font-semibold">{label}</span>
                <span
                  className={`block text-xs ${selected ? "text-white/80" : "text-muted"}`}
                >
                  à partir de {aPartirDe} €
                </span>
              </button>
            );
          })}
        </div>
        <p className="text-xs text-muted">
          {comprises.length} prestation{comprises.length > 1 ? "s" : ""} comprise
          {comprises.length > 1 ? "s" : ""}
          {aCharge.length > 0
            ? `, ${aCharge.length} à la charge du client`
            : ", rien à la charge du client"}{" "}
          — la liste complète est en section 7, modifiable.
        </p>
      </Card>

      <Card className="border-l-4 border-l-gold">
        <SectionHeader
          number="2"
          title="Prix"
          subtitle={
            editing
              ? "Modifiable à tout moment — le devis se réimprime avec le nouveau prix"
              : `Formule ${formule.label} : à partir de ${formule.aPartirDe} €`
          }
        />
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-ink">
            Prix total à régler (€)
          </span>
          <input
            className="field-input h-16 text-center text-3xl font-semibold text-navy"
            inputMode="decimal"
            value={devis.prixTTC ?? ""}
            onChange={(event) => setValue("prixTTC")(event.target.value)}
            placeholder="2480"
          />
        </label>
        <p className="mt-2 text-center text-sm text-muted">
          {formatEuros(montant)} sur le devis — micro-entreprise, pas de TVA
        </p>
      </Card>

      <Card>
        <SectionHeader
          number="3"
          title="Devis"
          subtitle="Rempli avec ce que la visite a relevé"
        />
        <div className="flex gap-3">
          <div className="flex-1">
            <Field label="Numéro">
              <TextInput
                inputMode="numeric"
                value={devis.numero}
                onChange={(value) => {
                  numeroEdited.current = true;
                  setValue("numero")(value);
                }}
              />
            </Field>
          </div>
          <div className="flex-1">
            <Field label="Date du devis">
              <TextInput type="date" value={devis.date} onChange={setValue("date")} />
            </Field>
          </div>
        </div>
        <Field label="Envoyé le">
          <TextInput
            type="date"
            value={devis.envoyeeLe}
            onChange={setValue("envoyeeLe")}
          />
        </Field>
        <Field label="Volume (m³)" hint="Relevé sur la fiche, corrigeable ici">
          <TextInput
            inputMode="decimal"
            value={devis.volume}
            onChange={setValue("volume")}
          />
        </Field>
        {/* Le même statut que dans l'onglet Devis, où il se change d'un doigt.
            Ici il suit le reste du formulaire : il part à l'enregistrement. */}
        <p className="mb-1 text-sm font-medium text-ink">Statut</p>
        <div className="grid grid-cols-2 gap-2">
          {DEVIS_STATUTS.map((choix) => (
            <button
              key={choix.value}
              type="button"
              onClick={() => setValue("statut")(choix.value)}
              className={`min-h-[44px] rounded-lg border px-2 text-xs font-semibold ${
                devisStatut(devis.statut).value === choix.value
                  ? choix.pastille
                  : choix.doux
              }`}
            >
              {choix.label}
            </button>
          ))}
        </div>
        <p className="mt-1 text-xs text-muted">
          C'est la couleur du devis dans l'onglet Devis, où il se change aussi
          sans ouvrir cet écran.
        </p>
      </Card>

      <Card>
        <SectionHeader number="4" title="Client" />
        <Field label="Nom / prénom">
          <TextInput value={devis.clientNom} onChange={setValue("clientNom")} />
        </Field>
        <Field label="Téléphone">
          <TextInput type="tel" value={devis.clientTel} onChange={setValue("clientTel")} />
        </Field>
        <Field label="Email">
          <TextInput
            type="email"
            value={devis.clientEmail}
            onChange={setValue("clientEmail")}
          />
        </Field>
      </Card>

      <EtapeCard
        number="5"
        title="Chargement"
        prefix="chargement"
        devis={devis}
        setValue={setValue}
      />
      <EtapeCard
        number="6"
        title="Déchargement"
        prefix="dechargement"
        devis={devis}
        setValue={setValue}
      />

      <Card>
        <SectionHeader
          number="7"
          title="Ce que comprend la formule"
          subtitle="Repris du tableau des formules du site, une ligne par prestation"
        />
        <TextArea
          value={devis.prestations}
          onChange={(value) => {
            prestationsEdited.current = true;
            setValue("prestations")(value);
          }}
          rows={7}
        />
        <p className="mb-3 mt-1 text-xs text-muted">
          Ce qui reste au client, imprimé à côté sur le devis :
        </p>
        <TextArea
          value={devis.charge}
          onChange={(value) => {
            prestationsEdited.current = true;
            setValue("charge")(value);
          }}
          rows={5}
        />
        <button
          type="button"
          onClick={resetListes}
          className="mt-2 flex min-h-[44px] w-full items-center justify-center gap-2 rounded-lg border border-line text-sm font-medium text-navy"
        >
          <RotateCcw size={16} /> Remettre les listes de la formule {formule.label}
        </button>
      </Card>

      <Card>
        <SectionHeader number="8" title="Conditions" />
        <TextArea
          value={devis.conditions}
          onChange={setValue("conditions")}
          rows={5}
        />
      </Card>

      <Card>
        <SectionHeader
          number="9"
          title="Enregistrer en PDF et envoyer"
          subtitle="Le PDF est une A4 exacte, faite par l'application elle-même"
        />
        <button
          type="button"
          onClick={handlePdf}
          disabled={pdfStatus === "working"}
          className={`mb-2 flex min-h-[48px] w-full items-center justify-center gap-2 rounded-lg px-3 text-sm font-semibold text-white transition ${
            pdfStatus === "done" ? "bg-green-600" : "bg-navy"
          } ${pdfStatus === "working" ? "opacity-70" : ""}`}
        >
          {pdfStatus === "working" && <Spinner />}
          {pdfStatus === "done" && <Check size={18} />}
          {(pdfStatus === "idle" || pdfStatus === "ready") && <FileDown size={18} />}
          {pdfStatus === "working" && "Fabrication du PDF A4..."}
          {pdfStatus === "ready" && "PDF A4 prêt — toucher pour enregistrer"}
          {pdfStatus === "done" && "PDF A4 enregistré"}
          {pdfStatus === "idle" && "Enregistrer le PDF A4"}
        </button>
        <p className="mb-3 text-xs text-muted">
          Le PDF est fabriqué par l'application, au format <b>A4</b> exact — il
          n'y a plus de taille de papier à choisir. Sur iPhone, la feuille de
          partage s'ouvre : « Enregistrer dans Fichiers », Mail, WhatsApp. Sur
          ordinateur, le fichier descend dans les téléchargements.
        </p>

        {/* Les deux anciennes voies restent : la boîte d'impression pour sortir
            le devis sur une vraie imprimante, et l'onglet Safari pour le
            relire en grand. */}
        <div className="mb-2 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => printNode(frameRef.current, fileName)}
            className="flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-lg border border-navy px-3 text-sm font-medium text-navy"
          >
            <Printer size={18} /> Imprimer
          </button>
          <button
            type="button"
            onClick={() => openNodeInBrowser(frameRef.current, fileName)}
            className="flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-lg border border-navy px-3 text-sm font-medium text-navy"
          >
            <ExternalLink size={18} /> Ouvrir dans le navigateur
          </button>
        </div>
        <p className="mb-4 text-xs text-muted">
          « Imprimer » ouvre la boîte d'impression du téléphone — penser alors à
          Options → <b>A4</b>, c'est elle qui décide du papier. Elle ne s'ouvre
          pas toujours depuis l'application installée sur l'écran d'accueil :
          « Ouvrir dans le navigateur » affiche le même devis dans un onglet
          Safari.
        </p>

        {/* Le mail part de l'application de messagerie du téléphone, déjà
            écrit. La pièce jointe s'y ajoute à la main : une page web n'a pas
            le droit d'attacher un fichier à un mail qu'elle n'envoie pas. */}
        <div className="rounded-lg border border-line bg-cream/60 p-3">
          <p className="mb-1 text-sm font-semibold text-navy">Mail au client</p>
          <p className="mb-2 text-xs text-muted">
            {devis.clientEmail ? (
              <>
                À : {devis.clientEmail} — objet « {devisMailObjet(devis)} »
              </>
            ) : (
              "Aucun email pour ce client : ajoutez-le en section 4."
            )}
          </p>
          <p className="mb-3 whitespace-pre-wrap rounded border border-line bg-white p-2 text-xs text-ink">
            {MAIL_DEVIS.corps}
          </p>
          <a
            href={devisMailto(devis)}
            className={`flex min-h-[48px] w-full items-center justify-center gap-2 rounded-lg bg-gold text-sm font-semibold text-white ${
              devis.clientEmail ? "" : "pointer-events-none opacity-50"
            }`}
          >
            <Mail size={18} /> Écrire le mail au client
          </a>
          <p className="mt-2 text-xs text-muted">
            Le message s'ouvre déjà écrit ; il ne reste qu'à joindre le PDF
            enregistré juste avant, puis à envoyer.
          </p>
        </div>
      </Card>

      <Card>
        <SectionHeader number="10" title="Aperçu du devis" />
        <DevisDocument devis={devis} frameRef={frameRef} />
      </Card>

      <div className="fixed inset-x-0 bottom-16 z-20 border-t border-line bg-cream/95 px-4 py-3 backdrop-blur">
        <div className="mx-auto max-w-md">
          <button
            type="button"
            onClick={handleSave}
            disabled={status === "saving"}
            className={`flex min-h-[52px] w-full items-center justify-center gap-2 rounded-xl text-base font-semibold text-white transition ${
              status === "envoye" || status === "en-attente" ? "bg-green-600" : "bg-gold"
            } ${status === "saving" ? "opacity-70" : ""}`}
          >
            {status === "saving" && <Spinner />}
            {(status === "envoye" || status === "en-attente") && <Check size={20} />}
            {status === "saving" && "Enregistrement..."}
            {status === "envoye" && "Devis enregistré"}
            {status === "en-attente" && "Enregistré — envoi au retour du réseau"}
            {status === "idle" &&
              (editing ? "Enregistrer les modifications" : "Enregistrer le devis")}
          </button>
        </div>
      </div>
    </div>
  );
}

/** Chargement et déchargement : mêmes champs, préfixe différent. */
function EtapeCard({ number, title, prefix, devis, setValue }) {
  const fields = [
    // L'intitulé est la ligne en gras du devis : « Chargement des meubles ».
    { suffix: "Titre", label: "Intitulé sur le devis" },
    { suffix: "Date", label: "Date", type: "date" },
    { suffix: "Adresse", label: "Adresse complète" },
    { suffix: "Etage", label: "Étage" },
    { suffix: "Ascenseur", label: "Ascenseur" },
    { suffix: "Surface", label: "Surface (m²)" },
  ];

  return (
    <Card>
      <SectionHeader number={number} title={title} />
      {fields.map(({ suffix, label, type }) => {
        const key = prefix + suffix;
        return (
          <Field key={key} label={label}>
            <TextInput type={type} value={devis[key]} onChange={setValue(key)} />
          </Field>
        );
      })}
    </Card>
  );
}

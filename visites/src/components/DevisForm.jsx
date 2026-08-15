import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, Check, ExternalLink, Printer } from "lucide-react";
import { FORMULES } from "../constants";
import {
  chargeText,
  devisFileName,
  devisMontant,
  devisToForm,
  formatEuros,
  nextDevisNumber,
  prestationsText,
  saveDevis,
} from "../lib/devis";
import { commit } from "../lib/offline";
import { openNodeInBrowser, printNode } from "../lib/print";
import DevisDocument from "./DevisDocument";
import {
  Card,
  ErrorNote,
  Field,
  SectionHeader,
  SelectInput,
  Spinner,
  TextArea,
  TextInput,
} from "./ui";

// Le tarif de départ du site accompagne chaque formule : c'est le repère du
// prix à taper, il ne s'imprime jamais sur le devis.
const FORMULE_OPTIONS = FORMULES.map(({ value, label, aPartirDe }) => ({
  value,
  label: `${label} — à partir de ${aPartirDe} €`,
}));

/**
 * Le devis d'une fiche de visite. Tout ce que la visite a relevé y est déjà —
 * client, adresses, étages, volume — il ne reste qu'à choisir la formule et à
 * taper le prix. L'aperçu en bas est exactement ce qui s'imprime.
 */
export default function DevisForm({ visit, user, onBack, onSaved }) {
  const [devis, setDevis] = useState(() => devisToForm(visit));
  const [status, setStatus] = useState("idle"); // idle | saving | envoye | en-attente
  const [error, setError] = useState("");
  const frameRef = useRef(null);

  // Ce que le gérant a lui-même écrit n'est plus jamais remplacé : ni le
  // numéro par celui que la base propose, ni les prestations par celles de la
  // formule suivante.
  const numeroEdited = useRef(Boolean(visit.devis?.numero));
  const prestationsEdited = useRef(Boolean(visit.devis?.prestations));

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

  const montant = useMemo(() => devisMontant(devis), [devis]);
  const fileName = devisFileName(devis);

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
        <ArrowLeft size={18} /> Retour à la fiche
      </button>

      {error && (
        <div className="mb-4">
          <ErrorNote>{error}</ErrorNote>
        </div>
      )}

      <Card>
        <SectionHeader
          number="1"
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
        <Field label="Formule">
          <SelectInput
            value={devis.formule}
            onChange={setFormule}
            options={FORMULE_OPTIONS}
          />
        </Field>
        <Field label="Volume (m³)" hint="Relevé sur la fiche, corrigeable ici">
          <TextInput
            inputMode="decimal"
            value={devis.volume}
            onChange={setValue("volume")}
          />
        </Field>

        <div className="rounded-lg border-l-4 border-gold bg-gold/10 p-3">
          <Field
            label="Prix total TTC (€)"
            hint="Micro-entreprise : pas de TVA, ce prix est celui que le client règle"
          >
            <TextInput
              inputMode="decimal"
              value={devis.prixTTC}
              onChange={setValue("prixTTC")}
              placeholder="Ex : 2480"
            />
          </Field>
          <div className="flex items-center justify-between border-t border-gold/40 pt-2 text-sm text-navy">
            <span>Sur le devis</span>
            <span className="font-semibold">{formatEuros(montant)}</span>
          </div>
        </div>
      </Card>

      <Card>
        <SectionHeader number="2" title="Client" />
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
        number="3"
        title="Chargement"
        prefix="chargement"
        devis={devis}
        setValue={setValue}
      />
      <EtapeCard
        number="4"
        title="Déchargement"
        prefix="dechargement"
        devis={devis}
        setValue={setValue}
      />

      <Card>
        <SectionHeader
          number="5"
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
      </Card>

      <Card>
        <SectionHeader number="6" title="Conditions" />
        <TextArea
          value={devis.conditions}
          onChange={setValue("conditions")}
          rows={5}
        />
      </Card>

      <Card>
        <SectionHeader number="7" title="Aperçu du devis" />
        <div className="mb-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => printNode(frameRef.current, fileName)}
            className="flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-lg bg-navy px-3 text-sm font-medium text-white"
          >
            <Printer size={18} /> Imprimer / PDF
          </button>
          <button
            type="button"
            onClick={() => openNodeInBrowser(frameRef.current, fileName)}
            className="flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-lg border border-navy px-3 text-sm font-medium text-navy"
          >
            <ExternalLink size={18} /> Ouvrir dans le navigateur
          </button>
        </div>
        <p className="mb-3 text-xs text-muted">
          Sur iPhone, « Imprimer » propose « Enregistrer au format PDF » ; si la
          boîte d'impression ne s'ouvre pas depuis l'application installée,
          passer par « Ouvrir dans le navigateur », puis le bouton Partager.
        </p>
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
            {status === "idle" && "Enregistrer le devis"}
          </button>
        </div>
      </div>
    </div>
  );
}

/** Chargement et déchargement : mêmes champs, préfixe différent. */
function EtapeCard({ number, title, prefix, devis, setValue }) {
  const fields = [
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

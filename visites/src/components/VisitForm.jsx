import { useEffect, useMemo, useRef, useState } from "react";
import { Check, Package, Plus, Trash2 } from "lucide-react";
import {
  CONTRAINTES_FIELDS,
  LOGEMENT_FIELDS,
  PRESTATIONS,
  emptyPiece,
  emptyVisit,
  totalVolume,
  visitHasContent,
} from "../constants";
import { newVisitId, saveVisit } from "../lib/visits";
import { commit } from "../lib/offline";
import { clearDraft, readDraft, writeDraft } from "../lib/draft";
import { deferUpdates, settleUpdates } from "../lib/updates";
import {
  objetsPianoFolder,
  objetsValeurFolder,
  pieceFolder,
  supplementairesFolder,
} from "../lib/photos";
import PhotoPicker from "./PhotoPicker";
import { Card, ErrorNote, Field, SectionHeader, Spinner, TextArea, TextInput } from "./ui";

export default function VisitForm({ user }) {
  // A sheet left half-filled comes back as it was, whatever ended the last
  // session — a version taking over, a crash, a phone shutting down.
  const [restored] = useState(readDraft);
  // The id is reserved up front so photos taken during the draft already know
  // their final storage folder.
  const [visitId, setVisitId] = useState(() => restored?.visitId ?? newVisitId());
  const [form, setForm] = useState(() => restored?.form ?? emptyVisit());
  const [status, setStatus] = useState("idle"); // idle | saving | envoye | en-attente
  const [error, setError] = useState("");

  const volumeTotal = useMemo(() => totalVolume(form.pieces), [form.pieces]);

  useEffect(() => {
    // Debounced: this runs on every keystroke.
    const timer = setTimeout(() => {
      if (visitHasContent(form)) writeDraft(visitId, form);
      else {
        clearDraft();
        // Nothing in progress any more: a version waiting its turn can go in.
        settleUpdates();
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [visitId, form]);

  // Read through a ref so the guard itself never changes: registering a new
  // one on every keystroke would leave a gap where nothing holds the update.
  const formRef = useRef(form);
  formRef.current = form;
  useEffect(() => deferUpdates(() => visitHasContent(formRef.current)), []);

  const setValue = (key) => (value) =>
    setForm((previous) => ({ ...previous, [key]: value }));

  const setUrls = (key) => (updater) =>
    setForm((previous) => ({ ...previous, [key]: updater(previous[key]) }));

  const setPieceValue = (pieceId, key) => (value) =>
    setForm((previous) => ({
      ...previous,
      pieces: previous.pieces.map((piece) =>
        piece.id === pieceId ? { ...piece, [key]: value } : piece
      ),
    }));

  const setPieceUrls = (pieceId) => (updater) =>
    setForm((previous) => ({
      ...previous,
      pieces: previous.pieces.map((piece) =>
        piece.id === pieceId
          ? { ...piece, photoUrls: updater(piece.photoUrls) }
          : piece
      ),
    }));

  function addPiece() {
    setForm((previous) => ({ ...previous, pieces: [...previous.pieces, emptyPiece()] }));
  }

  function removePiece(pieceId) {
    setForm((previous) => ({
      ...previous,
      pieces: previous.pieces.filter((piece) => piece.id !== pieceId),
    }));
  }

  function togglePrestation(label) {
    setForm((previous) => ({
      ...previous,
      prestations: previous.prestations.includes(label)
        ? previous.prestations.filter((item) => item !== label)
        : [...previous.prestations, label],
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (status === "saving") return;

    if (!form.clientNom.trim()) {
      setError("Le nom du client est obligatoire.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setError("");
    setStatus("saving");
    try {
      setStatus(await commit(saveVisit(visitId, form, user)));
      // The sheet is in Firestore now, on the phone at the very least: the
      // copy kept for a reload has done its job.
      clearDraft();
      setTimeout(() => {
        setForm(emptyVisit());
        setVisitId(newVisitId());
        setStatus("idle");
        window.scrollTo({ top: 0, behavior: "smooth" });
      }, 2500);
    } catch {
      setStatus("idle");
      setError("L'enregistrement a échoué. Vérifiez la connexion et réessayez.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="pb-4">
      {error && (
        <div className="mb-4">
          <ErrorNote>{error}</ErrorNote>
        </div>
      )}

      {/* 1 — Client */}
      <Card>
        <SectionHeader number="1" title="Client" />
        <Field label="Nom / prénom du client" required>
          <TextInput
            value={form.clientNom}
            onChange={setValue("clientNom")}
            placeholder="Ex : Dupont Marie"
          />
        </Field>
        <Field label="Téléphone">
          <TextInput type="tel" value={form.clientTel} onChange={setValue("clientTel")} />
        </Field>
        <Field label="Email">
          <TextInput
            type="email"
            value={form.clientEmail}
            onChange={setValue("clientEmail")}
          />
        </Field>
        <Field label="Date de visite">
          <TextInput
            type="date"
            value={form.dateVisite}
            onChange={setValue("dateVisite")}
          />
        </Field>
        <Field label="Réalisée par">
          <TextInput value={form.visiteur} onChange={setValue("visiteur")} />
        </Field>
      </Card>

      {/* 2 & 3 — Logements */}
      <LogementCard
        number="2"
        title="Logement de départ"
        prefix="depart"
        form={form}
        setValue={setValue}
      />
      <LogementCard
        number="3"
        title="Logement d'arrivée"
        prefix="arrivee"
        form={form}
        setValue={setValue}
      />

      {/* 4 — Inventaire par pièce */}
      <Card>
        <SectionHeader number="4" title="Inventaire par pièce" />

        {form.pieces.map((piece, index) => (
          <div
            key={piece.id}
            className="mb-4 rounded-lg border border-line bg-cream/60 p-3"
          >
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wide text-muted">
                Pièce {index + 1}
              </span>
              {form.pieces.length > 1 && (
                <button
                  type="button"
                  onClick={() => removePiece(piece.id)}
                  aria-label="Supprimer la pièce"
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-muted hover:text-red-600"
                >
                  <Trash2 size={18} />
                </button>
              )}
            </div>

            <Field label="Pièce">
              <TextInput
                value={piece.piece}
                onChange={setPieceValue(piece.id, "piece")}
                placeholder="Ex : Salon"
              />
            </Field>
            <Field label="Meubles / objets">
              <TextArea
                value={piece.contenu}
                onChange={setPieceValue(piece.id, "contenu")}
                rows={3}
              />
            </Field>
            <Field label="Volume (m³)">
              <TextInput
                inputMode="decimal"
                value={piece.volume}
                onChange={setPieceValue(piece.id, "volume")}
                placeholder="Ex : 12,5"
              />
            </Field>
            <Field label="Manutention particulière">
              <TextInput
                value={piece.manutention}
                onChange={setPieceValue(piece.id, "manutention")}
              />
            </Field>

            <span className="mb-1 block text-sm font-medium text-ink">Photos</span>
            <PhotoPicker
              folder={pieceFolder(visitId, piece.id)}
              urls={piece.photoUrls}
              onChange={setPieceUrls(piece.id)}
            />
          </div>
        ))}

        <button
          type="button"
          onClick={addPiece}
          className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-lg border border-dashed border-navy/40 text-sm font-medium text-navy"
        >
          <Plus size={18} /> Ajouter une pièce
        </button>

        <div className="mt-4 flex items-center justify-between rounded-lg bg-navy px-4 py-3 text-white">
          <span className="text-sm">Volume total</span>
          <span className="text-lg font-semibold">
            {volumeTotal.toFixed(1)} m³
          </span>
        </div>
      </Card>

      {/* 5 — Objets sensibles */}
      <Card>
        <SectionHeader number="5" title="Objets sensibles" />
        <Field label="Objets de valeur / fragiles">
          <TextArea value={form.objetsValeur} onChange={setValue("objetsValeur")} />
        </Field>
        <PhotoPicker
          folder={objetsValeurFolder(visitId)}
          urls={form.objetsValeurPhotoUrls}
          onChange={setUrls("objetsValeurPhotoUrls")}
        />

        <Field label="Piano / coffre-fort / œuvres d'art">
          <TextArea value={form.objetsPiano} onChange={setValue("objetsPiano")} />
        </Field>
        <PhotoPicker
          folder={objetsPianoFolder(visitId)}
          urls={form.objetsPianoPhotoUrls}
          onChange={setUrls("objetsPianoPhotoUrls")}
        />

        <Field label="Électroménager à débrancher">
          <TextArea value={form.objetsElectro} onChange={setValue("objetsElectro")} />
        </Field>
        <Field label="Meubles à démonter">
          <TextArea value={form.objetsDemontage} onChange={setValue("objetsDemontage")} />
        </Field>
        <Field label="Plantes / animaux">
          <TextArea value={form.objetsPlantes} onChange={setValue("objetsPlantes")} />
        </Field>
      </Card>

      {/* 6 — Prestations */}
      <Card>
        <SectionHeader number="6" title="Prestations souhaitées" />
        <div className="mb-4 flex flex-wrap gap-2">
          {PRESTATIONS.map((label) => {
            const selected = form.prestations.includes(label);
            return (
              <button
                key={label}
                type="button"
                onClick={() => togglePrestation(label)}
                className={`min-h-[44px] rounded-lg border px-3 text-sm transition ${
                  selected
                    ? "border-gold bg-gold text-white"
                    : "border-line bg-white text-ink"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>

        <div className="rounded-lg border-l-4 border-gold bg-gold/10 p-3">
          <label className="block">
            <span className="mb-1 flex items-center gap-2 text-sm font-semibold text-navy">
              <Package size={16} /> Nombre de cartons nécessaires (estimation)
            </span>
            <TextInput
              inputMode="numeric"
              value={form.cartonsNecessaires}
              onChange={setValue("cartonsNecessaires")}
              placeholder="Ex : 40"
            />
          </label>
        </div>
      </Card>

      {/* 7 — Contraintes */}
      <Card>
        <SectionHeader number="7" title="Contraintes & disponibilités" />
        {CONTRAINTES_FIELDS.map(({ key, label }) => (
          <Field key={key} label={label}>
            <TextInput value={form[key]} onChange={setValue(key)} />
          </Field>
        ))}
      </Card>

      {/* 8 — Photos supplémentaires */}
      <Card>
        <SectionHeader
          number="8"
          title="Photos supplémentaires"
          subtitle="Toute autre photo utile (vue générale, accès, façade...)"
        />
        <PhotoPicker
          folder={supplementairesFolder(visitId)}
          urls={form.photosSupplementairesUrls}
          onChange={setUrls("photosSupplementairesUrls")}
        />
      </Card>

      {/* 9 — Notes */}
      <Card>
        <SectionHeader number="9" title="Notes libres" />
        <TextArea value={form.notes} onChange={setValue("notes")} rows={4} />
      </Card>

      <SubmitBar status={status} />
    </form>
  );
}

function LogementCard({ number, title, prefix, form, setValue }) {
  return (
    <Card>
      <SectionHeader number={number} title={title} />
      {LOGEMENT_FIELDS.map(({ suffix, label }) => {
        const key = prefix + suffix;
        return (
          <Field key={key} label={label}>
            <TextInput value={form[key]} onChange={setValue(key)} />
          </Field>
        );
      })}
    </Card>
  );
}

function SubmitBar({ status }) {
  const saving = status === "saving";
  const done = status === "envoye" || status === "en-attente";

  return (
    <div className="fixed inset-x-0 bottom-16 z-20 border-t border-line bg-cream/95 px-4 py-3 backdrop-blur">
      <div className="mx-auto max-w-md">
        <button
          type="submit"
          disabled={saving || done}
          className={`flex min-h-[52px] w-full items-center justify-center gap-2 rounded-xl text-base font-semibold text-white transition ${
            done ? "bg-green-600" : "bg-gold"
          } ${saving ? "opacity-70" : ""}`}
        >
          {saving && <Spinner />}
          {done && <Check size={20} />}
          {saving && "Enregistrement..."}
          {status === "envoye" && "Visite enregistrée"}
          {/* Saved on the phone: the sheet is safe, it just has not left yet. */}
          {status === "en-attente" && "Enregistrée — envoi au retour du réseau"}
          {status === "idle" && "Enregistrer la visite"}
        </button>
      </div>
    </div>
  );
}

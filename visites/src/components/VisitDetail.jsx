import { useState } from "react";
import { ArrowLeft, Package, Trash2 } from "lucide-react";
import { CONTRAINTES_FIELDS, LOGEMENT_FIELDS } from "../constants";
import { deleteVisit } from "../lib/visits";
import { formatVisitDate } from "../lib/format";
import PhotoGallery from "./PhotoGallery";
import { Card, ErrorNote, SectionHeader, Spinner } from "./ui";

function hasContent(...values) {
  return values.some((value) =>
    Array.isArray(value) ? value.length > 0 : String(value ?? "").trim() !== ""
  );
}

function Line({ label, value }) {
  if (!String(value ?? "").trim()) return null;
  return (
    <div className="border-b border-line py-2 last:border-0">
      <p className="text-xs uppercase tracking-wide text-muted">{label}</p>
      <p className="whitespace-pre-wrap text-ink">{value}</p>
    </div>
  );
}

export default function VisitDetail({ visit, isOwner, onBack }) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  const pieces = visit.pieces || [];

  async function handleDelete() {
    const confirmed = window.confirm(
      `Supprimer définitivement la visite de ${visit.clientNom || "ce client"} ? Les photos seront également supprimées.`
    );
    if (!confirmed) return;

    setError("");
    setDeleting(true);
    try {
      await deleteVisit(visit.id);
      onBack();
    } catch {
      setDeleting(false);
      setError("La suppression a échoué. Réessayez.");
    }
  }

  return (
    <div className="pb-4">
      <button
        type="button"
        onClick={onBack}
        className="mb-4 flex min-h-[44px] items-center gap-2 text-sm font-medium text-navy"
      >
        <ArrowLeft size={18} /> Retour aux visites
      </button>

      {error && (
        <div className="mb-4">
          <ErrorNote>{error}</ErrorNote>
        </div>
      )}

      <Card>
        <SectionHeader number="1" title="Client" />
        <Line label="Nom / prénom du client" value={visit.clientNom} />
        <Line label="Téléphone" value={visit.clientTel} />
        <Line label="Email" value={visit.clientEmail} />
        <Line label="Date de visite" value={formatVisitDate(visit)} />
        <Line label="Réalisée par" value={visit.visiteur || visit.createdByEmail} />
      </Card>

      <LogementSection number="2" title="Logement de départ" prefix="depart" visit={visit} />
      <LogementSection number="3" title="Logement d'arrivée" prefix="arrivee" visit={visit} />

      {pieces.length > 0 && (
        <Card>
          <SectionHeader number="4" title="Inventaire par pièce" />
          {pieces.map((piece, index) => (
            <div
              key={piece.id || index}
              className="mb-3 rounded-lg border border-line bg-cream/60 p-3"
            >
              <p className="font-semibold text-navy">
                {piece.piece || `Pièce ${index + 1}`}
              </p>
              <Line label="Meubles / objets" value={piece.contenu} />
              <Line label="Volume (m³)" value={piece.volume} />
              <Line label="Manutention particulière" value={piece.manutention} />
              <PhotoGallery urls={piece.photoUrls} />
            </div>
          ))}
          <div className="mt-2 flex items-center justify-between rounded-lg bg-navy px-4 py-3 text-white">
            <span className="text-sm">Volume total</span>
            <span className="text-lg font-semibold">
              {Number(visit.volumeTotal || 0).toFixed(1)} m³
            </span>
          </div>
        </Card>
      )}

      {hasContent(
        visit.objetsValeur,
        visit.objetsValeurPhotoUrls,
        visit.objetsPiano,
        visit.objetsPianoPhotoUrls,
        visit.objetsElectro,
        visit.objetsDemontage,
        visit.objetsPlantes
      ) && (
        <Card>
          <SectionHeader number="5" title="Objets sensibles" />
          <Line label="Objets de valeur / fragiles" value={visit.objetsValeur} />
          <PhotoGallery urls={visit.objetsValeurPhotoUrls} />
          <Line label="Piano / coffre-fort / œuvres d'art" value={visit.objetsPiano} />
          <PhotoGallery urls={visit.objetsPianoPhotoUrls} />
          <Line label="Électroménager à débrancher" value={visit.objetsElectro} />
          <Line label="Meubles à démonter" value={visit.objetsDemontage} />
          <Line label="Plantes / animaux" value={visit.objetsPlantes} />
        </Card>
      )}

      {hasContent(visit.prestations, visit.cartonsNecessaires) && (
        <Card>
          <SectionHeader number="6" title="Prestations souhaitées" />
          {visit.prestations?.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-2">
              {visit.prestations.map((label) => (
                <span
                  key={label}
                  className="rounded-lg border border-gold bg-gold/10 px-3 py-1.5 text-sm text-navy"
                >
                  {label}
                </span>
              ))}
            </div>
          )}
          {String(visit.cartonsNecessaires ?? "").trim() && (
            <p className="flex items-center gap-2 rounded-lg border-l-4 border-gold bg-gold/10 p-3 font-semibold text-navy">
              <Package size={18} />
              {visit.cartonsNecessaires} cartons nécessaires (estimation)
            </p>
          )}
        </Card>
      )}

      {hasContent(...CONTRAINTES_FIELDS.map(({ key }) => visit[key])) && (
        <Card>
          <SectionHeader number="7" title="Contraintes & disponibilités" />
          {CONTRAINTES_FIELDS.map(({ key, label }) => (
            <Line key={key} label={label} value={visit[key]} />
          ))}
        </Card>
      )}

      {visit.photosSupplementairesUrls?.length > 0 && (
        <Card>
          <SectionHeader number="8" title="Photos supplémentaires" />
          <PhotoGallery urls={visit.photosSupplementairesUrls} />
        </Card>
      )}

      {hasContent(visit.notes) && (
        <Card>
          <SectionHeader number="9" title="Notes libres" />
          <p className="whitespace-pre-wrap text-ink">{visit.notes}</p>
        </Card>
      )}

      {isOwner && (
        <button
          type="button"
          onClick={handleDelete}
          disabled={deleting}
          className="mb-4 flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 font-medium text-red-700 disabled:opacity-60"
        >
          {deleting ? <Spinner /> : <Trash2 size={18} />}
          {deleting ? "Suppression..." : "Supprimer la visite"}
        </button>
      )}
    </div>
  );
}

function LogementSection({ number, title, prefix, visit }) {
  const values = LOGEMENT_FIELDS.map(({ suffix }) => visit[prefix + suffix]);
  if (!hasContent(...values)) return null;

  return (
    <Card>
      <SectionHeader number={number} title={title} />
      {LOGEMENT_FIELDS.map(({ suffix, label }) => (
        <Line key={suffix} label={label} value={visit[prefix + suffix]} />
      ))}
    </Card>
  );
}

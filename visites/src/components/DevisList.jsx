import { useEffect, useMemo, useState } from "react";
import { ChevronDown, FileText } from "lucide-react";
import { DEVIS_STATUTS, devisStatut } from "../constants";
import { devisFromVisits, formatDateFr, formatEuros, saveDevisStatut } from "../lib/devis";
import { commit } from "../lib/offline";
import { subscribeToVisits } from "../lib/visits";
import { ErrorNote, Spinner } from "./ui";

/**
 * Tous les devis, celui d'aujourd'hui en tête. Chacun porte son montant à
 * droite et sa couleur à gauche : d'un coup d'oeil, ce qui est signé, ce qui
 * attend, ce qui est déménagé et ce qui est refusé.
 *
 * Le statut se change d'un doigt, sans ouvrir le devis — c'est ce que la
 * liste sert à faire vingt fois par semaine. Le reste (le prix, les listes,
 * le PDF) reste derrière la ligne, dans l'écran du devis.
 */
export default function DevisList({ user, onSelect }) {
  const [visits, setVisits] = useState(null);
  const [error, setError] = useState("");
  const [filtre, setFiltre] = useState("tous");
  // La ligne dont les quatre statuts sont dépliés. Une seule à la fois : deux
  // rangées de boutons ouvertes sur un téléphone, on ne voit plus les devis.
  const [ouvert, setOuvert] = useState("");

  useEffect(() => {
    return subscribeToVisits(
      (data) => {
        setError("");
        setVisits(data);
      },
      () => setError("Impossible de charger les devis. Vérifiez la connexion.")
    );
  }, []);

  const tous = useMemo(() => devisFromVisits(visits || []), [visits]);
  const montres = useMemo(
    () =>
      filtre === "tous"
        ? tous
        : tous.filter((ligne) => devisStatut(ligne.devis.statut).value === filtre),
    [tous, filtre]
  );
  const total = montres.reduce((somme, ligne) => somme + ligne.montant, 0);

  async function changeStatut(ligne, statut) {
    setOuvert("");
    // La ligne se recolore aussitôt : la liste vient de Firestore, qui répond
    // depuis le téléphone avant même d'avoir vu le serveur.
    try {
      await commit(saveDevisStatut(ligne.visit.id, statut, user));
    } catch {
      setError("Le statut n'a pas pu être enregistré. Vérifiez la connexion.");
    }
  }

  if (error && visits === null) {
    return (
      <div className="pt-6">
        <ErrorNote>{error}</ErrorNote>
      </div>
    );
  }

  if (visits === null) {
    return (
      <div className="flex justify-center py-16 text-gold">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (tous.length === 0) {
    return (
      <div className="flex flex-col items-center py-16 text-center">
        <FileText size={40} className="mb-3 text-line" />
        <p className="font-medium text-ink">Aucun devis établi</p>
        <p className="mt-1 text-sm text-muted">
          Les devis faits depuis une fiche de visite apparaîtront ici.
        </p>
      </div>
    );
  }

  return (
    <div className="py-2">
      {error && (
        <div className="mb-3">
          <ErrorNote>{error}</ErrorNote>
        </div>
      )}

      {/* Les statuts servent aussi à trier : toucher « Signé » ne laisse que
          les devis signés, et le total en dessous suit. */}
      <div className="-mx-4 mb-3 flex gap-2 overflow-x-auto px-4 pb-1">
        <FiltreChip
          active={filtre === "tous"}
          onClick={() => setFiltre("tous")}
          label="Tous"
          nombre={tous.length}
          classes="border-navy bg-navy/10 text-navy"
        />
        {DEVIS_STATUTS.map((statut) => (
          <FiltreChip
            key={statut.value}
            active={filtre === statut.value}
            onClick={() => setFiltre(statut.value)}
            label={statut.label}
            nombre={
              tous.filter((ligne) => devisStatut(ligne.devis.statut).value === statut.value)
                .length
            }
            classes={statut.doux}
          />
        ))}
      </div>

      <p className="mb-3 text-xs text-muted">
        {montres.length} devis — <b className="text-navy">{formatEuros(total)}</b>
      </p>

      {montres.length === 0 ? (
        <p className="py-10 text-center text-sm text-muted">
          Aucun devis {devisStatut(filtre).label.toLowerCase()} pour l'instant.
        </p>
      ) : (
        <ul className="space-y-3">
          {montres.map((ligne) => (
            <LigneDevis
              key={ligne.visit.id}
              ligne={ligne}
              ouvert={ouvert === ligne.visit.id}
              onToggle={() =>
                setOuvert((precedent) =>
                  precedent === ligne.visit.id ? "" : ligne.visit.id
                )
              }
              onStatut={(statut) => changeStatut(ligne, statut)}
              onSelect={() => onSelect(ligne.visit)}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

function FiltreChip({ active, onClick, label, nombre, classes }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex min-h-[36px] shrink-0 items-center gap-1.5 rounded-full border px-3 text-xs font-semibold ${
        active ? classes : "border-line bg-white text-muted"
      }`}
    >
      {label}
      <span className={active ? "" : "text-muted/70"}>{nombre}</span>
    </button>
  );
}

function LigneDevis({ ligne, ouvert, onToggle, onStatut, onSelect }) {
  const { devis, montant } = ligne;
  const statut = devisStatut(devis.statut);

  return (
    <li
      className={`overflow-hidden rounded-xl border border-l-4 border-line bg-white shadow-card ${statut.liseret}`}
    >
      {/* Le nom ouvre le devis, la pastille change son statut : deux boutons
          côte à côte, jamais l'un dans l'autre. */}
      <div className="flex items-center gap-3 p-3 pl-4">
        <button type="button" onClick={onSelect} className="min-w-0 flex-1 text-left">
          <span className="block truncate font-semibold text-navy">
            {devis.clientNom || ligne.visit.clientNom || "Client sans nom"}
          </span>
          <span className="mt-0.5 block text-xs text-muted">
            Devis N° {devis.numero || "—"} · {formatDateFr(devis.date)}
          </span>
        </button>
        {/* Le montant à droite, en face du nom : c'est ce qu'on vient lire. */}
        <div className="flex shrink-0 flex-col items-end gap-1">
          <span className="text-base font-bold leading-none text-navy">
            {formatEuros(montant)}
          </span>
          <button
            type="button"
            onClick={onToggle}
            className={`flex min-h-[36px] items-center gap-1 rounded-full px-3 text-xs font-semibold ${statut.pastille}`}
          >
            {statut.label}
            <ChevronDown size={13} className={ouvert ? "rotate-180" : ""} />
          </button>
        </div>
      </div>

      {ouvert && (
        <div className="grid grid-cols-2 gap-2 border-t border-line bg-cream/60 p-3">
          {DEVIS_STATUTS.map((choix) => (
            /* Le statut posé est plein, les trois autres en simple contour. */
            <button
              key={choix.value}
              type="button"
              onClick={() => onStatut(choix.value)}
              className={`min-h-[44px] rounded-lg border px-2 text-xs font-semibold ${
                choix.value === statut.value ? choix.pastille : choix.doux
              }`}
            >
              {choix.label}
            </button>
          ))}
        </div>
      )}
    </li>
  );
}
